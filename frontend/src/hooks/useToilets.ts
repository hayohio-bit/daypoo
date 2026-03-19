import { useState, useEffect, useCallback, useRef } from 'react';
import { ToiletData } from '../types/toilet';

// ── 공공데이터 API 응답 → 내부 타입 변환 ─────────────────────────────
interface RawToiletItem {
  wtnnmNm: string;
  rdnmadr: string;
  lnmadr?: string;
  latitude: string;
  longitude: string;
  opntime?: string;
  clstime?: string;
  satOpntime?: string;
  satClstime?: string;
  holOpntime?: string;
  holClstime?: string;
  wntyIsYn?: string;
  mlChmnCnt?: string;
  mlUrinalCnt?: string;
  fmlChmnCnt?: string;
  dspsChmnCnt?: string;
  chldChmnCnt?: string;
  nprgnDprtrFcltyIsYn?: string;
  emgncyBellIsYn?: string;
  cctvisYn?: string;
  institutionNm?: string;
  phoneNumber?: string;
}

function parseOpenTime(open?: string, close?: string): string | undefined {
  if (!open || !close) return undefined;
  return `${open}~${close}`;
}

function isOpen24h(openTime?: string): boolean {
  if (!openTime) return false;
  return openTime.includes('00:00~24:00') || openTime.includes('00:00~23:59');
}

// ── 훅 ────────────────────────────────────────────────────────────────
interface UseToiletsOptions {
  lat: number;
  lng: number;
  radius?: number;
  bounds?: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  } | null;
}

export function useToilets({ lat, lng, radius = 1000, bounds }: UseToiletsOptions) {
  const [toilets, setToilets] = useState<ToiletData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const fetchToilets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/poop-map/api/v1/toilets?latitude=${lat}&longitude=${lng}&radius=${radius}`;

      if (bounds) {
        const centerLat = (bounds.swLat + bounds.neLat) / 2;
        const centerLng = (bounds.swLng + bounds.neLng) / 2;
        const R = 6371000;
        const dLat = ((bounds.neLat - centerLat) * Math.PI) / 180;
        const dLng = ((bounds.neLng - centerLng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos((centerLat * Math.PI) / 180) * Math.cos((bounds.neLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
        const dynamicRadius = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        url = `/poop-map/api/v1/toilets?latitude=${centerLat}&longitude=${centerLng}&radius=${Math.min(dynamicRadius, 10000)}`;
      }

      try {
        const res = await fetch(url);
        if (res.ok) {
          const backendData = await res.json();
          const data: ToiletData[] = backendData.map((item: any) => ({
            id: String(item.id),
            name: item.name || '이름없음',
            roadAddress: item.address || '',
            lat: item.latitude,
            lng: item.longitude,
            openTime: item.openHours,
            isOpen24h: item.is24h,
            isVisited: false,
            isFavorite: false,
          }));

          // ★ 핵심 수정: 기존 마커 데이터를 지우지 않고, 새 데이터와 병합 (merge)
          // 기존 즐겨찾기 / 방문 상태를 유지하면서 새 데이터를 추가
          setToilets(prev => {
            if (prev.length === 0) return data;
            
            const prevMap = new Map(prev.map(t => [t.id, t]));
            const newMap = new Map(data.map(t => [t.id, t]));
            
            // 새 데이터에 있는 항목 — 기존 상태 유지
            const merged = data.map(t => {
              const existing = prevMap.get(t.id);
              if (existing) {
                return { ...t, isFavorite: existing.isFavorite, isVisited: existing.isVisited };
              }
              return t;
            });

            return merged;
          });

          initialLoadDone.current = true;
        } else {
          console.warn('[useToilets] 백엔드 API 호출 실패:', res.status);
          // 실패 시 기존 데이터를 유지 (빈 배열로 밀지 않음)
        }
      } catch (e) {
        console.error('[useToilets] 연동 오류:', e);
        // 네트워크 오류 시에도 기존 데이터를 유지
      }
    } catch (e) {
      console.error('[useToilets] fetch 실패:', e);
      setError('화장실 데이터를 불러오지 못했습니다.');
      // ★ 오류 시에도 기존 데이터를 절대 지우지 않음
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radius, JSON.stringify(bounds)]);


  useEffect(() => {
    fetchToilets();
  }, [fetchToilets]);

  const toggleFavorite = useCallback((id: string) => {
    setToilets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  }, []);

  const markVisited = useCallback((id: string) => {
    setToilets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isVisited: true } : t))
    );
  }, []);

  return { toilets, loading, error, toggleFavorite, markVisited, refetch: fetchToilets };
}
