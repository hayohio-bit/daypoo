import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, LocateFixed } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ToiletPopup } from '../components/map/ToiletPopup';
import { useToilets } from '../hooks/useToilets';
import { ToiletData } from '../types/toilet';
import { VisitModal } from '../components/map/VisitModal';
import { api } from '../services/apiClient';

declare global {
  interface Window { 
    kakao: any; 
    setSelectedToiletGlobal?: (toilet: ToiletData) => void;
  }
}

// ── 현재 위치 훅 ──────────────────────────────────────────────────────
function useCurrentPosition() {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGranted(true); },
      () => {
        setPos({ lat: 37.5172, lng: 127.0473 }); // fallback: 강남구청
        setGranted(false);
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  }, []);

  return { pos, granted };
}

// ── 카카오맵 마커 생성 헬퍼 ─────────────────────────────────────────
function createToiletMarker(kakao: any, toilet: ToiletData) {
  const emoji = toilet.isVisited ? '💩' : '🚻';
  const markerBg = toilet.isVisited ? '#1B4332' : '#8a9a8a';

  const content = `
    <div onclick="window.setSelectedToiletGlobal(${JSON.stringify(toilet).replace(/"/g, '&quot;')})" style="
      position:relative;
      display:flex;flex-direction:column;align-items:center;
      cursor:pointer;
      will-change:transform;
      transform:translateZ(0);
      contain:strict;
      width:36px; height:44px;
    ">
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:${markerBg};
        display:flex;align-items:center;justify-content:center;
        font-size:18px;
        box-shadow:0 3px 12px rgba(0,0,0,0.25);
        border:2.5px solid #fff;
        ${toilet.isOpen24h ? 'outline:2px solid #E8A838;outline-offset:2px;' : ''}
      ">${emoji}</div>
      <div style="
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid ${markerBg};
        margin-top:-1px;
      "></div>
    </div>`;

  const marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(toilet.lat, toilet.lng),
    zIndex: toilet.isVisited ? 5 : 3,
    image: new kakao.maps.MarkerImage(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      new kakao.maps.Size(1, 1)
    )
  });

  const overlay = new kakao.maps.CustomOverlay({
    content,
    position: marker.getPosition(),
    yAnchor: 1.15,
    zIndex: toilet.isVisited ? 5 : 3,
    clickable: true
  });

  return { marker, overlay };
}

type FilterMode = 'all' | 'favorite' | 'visited';

export function MapPage({ openAuth }: { openAuth: (mode: 'login' | 'signup') => void }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const markersRef = useRef<Map<string, { marker: any; overlay: any }>>(new Map());
  const myOverlayRef = useRef<any>(null);

  const [selectedToilet, setSelectedToilet] = useState<ToiletData | null>(null);
  const [targetForVisit, setTargetForVisit] = useState<ToiletData | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  const { pos } = useCurrentPosition();
  const [bounds, setBounds] = useState<any>(null);
  const { toilets, loading, toggleFavorite, markVisited } = useToilets({ 
    lat: pos?.lat ?? 37.5172, 
    lng: pos?.lng ?? 127.0473, 
    bounds 
  });

  // ── 로그인 후 화장실 정보 복원 ──────────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem('lastSelectedToilet');
    if (saved) {
      try {
        setSelectedToilet(JSON.parse(saved));
      } catch { /* ignore */ }
      sessionStorage.removeItem('lastSelectedToilet');
    }
  }, []);

  const handleSelectToilet = useCallback((toilet: ToiletData | null) => {
    setSelectedToilet(toilet);
    if (toilet) sessionStorage.setItem('lastSelectedToilet', JSON.stringify(toilet));
    else sessionStorage.removeItem('lastSelectedToilet');
  }, []);

  useEffect(() => {
    window.setSelectedToiletGlobal = (toilet: ToiletData) => handleSelectToilet(toilet);
    return () => { delete window.setSelectedToiletGlobal; };
  }, [handleSelectToilet]);

  const handleFavoriteToggle = useCallback((id: string) => {
    toggleFavorite(id);
    setSelectedToilet(prev => {
      const updated = prev && prev.id === id ? { ...prev, isFavorite: !prev.isFavorite } : prev;
      if (updated) sessionStorage.setItem('lastSelectedToilet', JSON.stringify(updated));
      return updated;
    });
  }, [toggleFavorite]);

  // ── 방문 인증 (로그인 확인 + 체크인) ────────────────────────────
  const handleVisitRequest = useCallback(async () => {
    const isLogged = !!localStorage.getItem('accessToken');
    if (!isLogged) {
      // ★ 현재 화장실 정보를 세션에 저장 후 팝업 닫기 → 로그인 모달 띄우기
      if (selectedToilet) {
        sessionStorage.setItem('lastSelectedToilet', JSON.stringify(selectedToilet));
      }
      handleSelectToilet(null);
      openAuth('login');
      return;
    }

    if (!selectedToilet || !pos) return;

    try {
      // 백엔드 체크인 호출 (1분 타이머 시작)
      await api.post('/records/check-in', {
        toiletId: Number(selectedToilet.id),
        latitude: pos.lat,
        longitude: pos.lng
      });
    } catch (e: any) {
      // 체크인 실패 시에도 모달은 일단 띄워줌 (위치 검증은 기록 저장 시 다시 수행)
      console.warn('체크인 사전 호출 실패 (무시):', e.message);
    }

    setTargetForVisit(selectedToilet);
    handleSelectToilet(null);
  }, [selectedToilet, openAuth, pos, handleSelectToilet]);

  // ── 방문 인증 완료 (DB 저장) ────────────────────────────────────
  const handleVisitComplete = useCallback(async (recordData: any) => {
    if (!pos) return;
    
    try {
      const payload = {
        toiletId: Number(recordData.toiletId),
        bristolScale: recordData.bristolType,
        color: recordData.color,
        conditionTags: recordData.conditionTags || [],
        dietTags: recordData.foodTags || [],
        latitude: pos.lat,
        longitude: pos.lng
      };

      await api.post('/records', payload);
      markVisited(String(recordData.toiletId));
      setTargetForVisit(null);
      alert('방문 인증이 완료되었습니다! 💩✨');
    } catch (e: any) {
      console.error('방문 인증 저장 실패:', e);
      // 구체적인 에러 메시지를 유저에게 보여줌
      const msg = e.message || '서버 내부 오류입니다.';
      if (msg.includes('1분') || msg.includes('체류')) {
        alert('⏳ 아직 1분이 지나지 않았습니다. 잠시 후 다시 시도해주세요!');
      } else if (msg.includes('반경') || msg.includes('거리')) {
        alert('📍 화장실 근처(150m 이내)에서만 인증이 가능합니다.');
      } else if (msg.includes('어뷰징') || msg.includes('이미')) {
        alert('⚠️ 같은 화장실은 3시간 이후에 다시 인증할 수 있습니다.');
      } else {
        alert(`인증 오류: ${msg}`);
      }
    }
  }, [markVisited, pos]);

  const updateBounds = useCallback(() => {
    if (!mapRef.current) return;
    const b = mapRef.current.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    setBounds({ swLat: sw.getLat(), swLng: sw.getLng(), neLat: ne.getLat(), neLng: ne.getLng() });
  }, []);

  const updateMarkersVisibility = useCallback(() => {
    if (!mapRef.current) return;
    const level = mapRef.current.getLevel();
    markersRef.current.forEach((item) => {
      if (level >= 6) item.overlay.setMap(null);
      else item.overlay.setMap(mapRef.current);
    });
  }, []);

  const filteredToilets = toilets.filter((t) => {
    const matchesFilter = filter === 'all' ? true : filter === 'favorite' ? t.isFavorite : filter === 'visited' ? t.isVisited : true;
    const matchesSearch = searchQuery.trim() === '' || t.name.includes(searchQuery) || (t.roadAddress && t.roadAddress.includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  // ── 카카오맵 초기화 (pos가 준비된 후에만 실행) ─────────────────
  useEffect(() => {
    if (!pos || !window.kakao || !mapContainerRef.current || mapRef.current) return;

    window.kakao.maps.load(() => {
      const center = new window.kakao.maps.LatLng(pos.lat, pos.lng);
      const map = new window.kakao.maps.Map(mapContainerRef.current, { center, level: 4 });
      mapRef.current = map;

      const clusterer = new window.kakao.maps.MarkerClusterer({
        map,
        averageCenter: true,
        minLevel: 6,
        styles: [{
          width: '50px', height: '50px',
          background: 'rgba(27, 67, 50, 0.85)',
          borderRadius: '50%', color: '#fff',
          textAlign: 'center', fontWeight: 'bold', lineHeight: '50px',
          border: '2px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }]
      });
      clustererRef.current = clusterer;

      window.kakao.maps.event.addListener(map, 'idle', updateBounds);
      window.kakao.maps.event.addListener(map, 'zoom_changed', updateMarkersVisibility);

      // ★ 즉시 bounds를 갱신하여 첫 데이터 fetch를 트리거
      updateBounds();
      setMapLoaded(true);

      // ★ 내 위치 마커
      const myOverlay = new window.kakao.maps.CustomOverlay({
        position: center,
        content: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="
              width:40px;height:40px;border-radius:50%;
              background:linear-gradient(135deg,#3B82F6,#60a5fa);
              display:flex;align-items:center;justify-content:center;
              font-size:22px;
              box-shadow:0 0 0 4px rgba(59,130,246,0.25),0 4px 14px rgba(59,130,246,0.4);
              border:2.5px solid #fff;
              animation:mypulse 2s infinite;
            ">🧑</div>
          </div>`,
        zIndex: 10,
      });
      myOverlay.setMap(map);
      myOverlayRef.current = myOverlay;
    });
  }, [pos]); // ★ pos가 준비된 후에 실행

  // ── pos 변경 시 내 위치 오버레이도 이동 ──────────────────────────
  useEffect(() => {
    if (!mapRef.current || !pos || !myOverlayRef.current) return;
    const center = new window.kakao.maps.LatLng(pos.lat, pos.lng);
    myOverlayRef.current.setPosition(center);
    mapRef.current.setCenter(center);
    updateBounds();
  }, [pos]);

  // ── 마커 업데이트 (안정적 병합) ──────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !clustererRef.current) return;
    
    const currentToiletsIds = new Set(filteredToilets.map(t => t.id));
    
    // 화면에 없는 마커만 제거
    markersRef.current.forEach((item, id) => {
      if (!currentToiletsIds.has(id)) {
        item.overlay.setMap(null);
        clustererRef.current.removeMarker(item.marker);
        markersRef.current.delete(id);
      }
    });

    // 없는 마커만 추가
    const newMarkers: any[] = [];
    const level = mapRef.current.getLevel();
    filteredToilets.forEach((toilet) => {
      if (!markersRef.current.has(toilet.id)) {
        const { marker, overlay } = createToiletMarker(window.kakao, toilet);
        if (level < 6) overlay.setMap(mapRef.current);
        markersRef.current.set(toilet.id, { marker, overlay });
        newMarkers.push(marker);
      }
    });
    if (newMarkers.length > 0) {
      clustererRef.current.addMarkers(newMarkers);
      clustererRef.current.redraw();
    }
  }, [filteredToilets, mapLoaded]);

  const moveToMyLocation = useCallback(() => {
    if (!mapRef.current || !pos) return;
    mapRef.current.panTo(new window.kakao.maps.LatLng(pos.lat, pos.lng));
  }, [pos]);

  // pos가 아직 null이면 로딩 표시
  if (!pos) {
    return (
      <div className="relative h-screen flex flex-col overflow-hidden" style={{ background: '#F2F7F4' }}>
        <Navbar openAuth={openAuth} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-bounce">📍</div>
            <p className="text-[#7a9e8a] font-bold">위치를 찾고 있습니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col overflow-hidden" style={{ background: '#F2F7F4' }}>
      <Navbar openAuth={openAuth} />
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" style={{ borderRadius: '0', willChange: 'transform', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />

        {/* 검색 및 필터 */}
        <div className="absolute top-[120px] left-1/2 -translate-x-1/2 z-20 w-full px-4" style={{ maxWidth: '600px' }}>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ border: '1.5px solid transparent', background: '#fff', boxShadow: '0 4px 24px rgba(27,67,50,0.15)' }}>
            <SearchIcon size={16} style={{ color: '#7a9e8a' }} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="화장실 검색" className="flex-1 outline-none text-sm" style={{ background: 'transparent' }} />
          </div>
          <div className="flex gap-2 mt-2 justify-center">
            {(['all', 'favorite', 'visited'] as FilterMode[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className="px-4 py-1.5 rounded-full text-xs font-bold transition-all" style={{ background: filter === f ? '#1B4332' : 'rgba(255,255,255,0.9)', color: filter === f ? '#fff' : '#2D6A4F', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {f === 'all' ? '전체' : f === 'favorite' ? '즐겨찾기' : '내 기록'}
              </button>
            ))}
          </div>
        </div>

        {/* 내 위치 버튼 */}
        <div className="absolute right-4 bottom-8 z-20">
          <button onClick={moveToMyLocation} className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-lg">
            <LocateFixed size={20} style={{ color: '#1B4332' }} />
          </button>
        </div>

        {/* 메인 팝업 */}
        <AnimatePresence>
          {selectedToilet && (
            <div className="absolute inset-0 z-[1001] pointer-events-none">
              <div className="absolute pointer-events-auto" style={{ left: '50%', top: '75%', transform: 'translate(-50%, -50%)' }}>
                <ToiletPopup 
                  toilet={selectedToilet} 
                  onClose={() => handleSelectToilet(null)} 
                  onFavoriteToggle={handleFavoriteToggle} 
                  onVisitRequest={handleVisitRequest} 
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* 방문 인증 모달 */}
        <AnimatePresence>
          {targetForVisit && (
            <VisitModal toilet={targetForVisit} onClose={() => setTargetForVisit(null)} onComplete={handleVisitComplete} />
          )}
        </AnimatePresence>
      </div>

      {/* 내 위치 펄스 애니메이션 */}
      <style>{`
        @keyframes mypulse {
          0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          70%  { box-shadow: 0 0 0 14px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
      `}</style>
    </div>
  );
}
