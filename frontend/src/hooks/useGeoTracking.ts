import { useState, useEffect, useRef } from 'react';
import { getDistance } from '../utils/geoUtils';
import { ToiletData } from '../types/toilet';
import { api } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

interface GeoPosition {
  lat: number;
  lng: number;
}

/**
 * 전역 위치 트래킹 및 자동 체크인(Fast Check-in) 훅
 */
export function useGeoTracking(
  toilets: ToiletData[], 
  onAutoCheckIn?: (remainedSeconds: number) => void,
  isEnabled: boolean = true
) {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [granted, setGranted] = useState(false);
  const lastCheckInRef = useRef<Map<string, number>>(new Map());
  const toiletsRef = useRef(toilets);
  const { refreshUser } = useAuth();

  useEffect(() => {
    toiletsRef.current = toilets;
  }, [toilets]);

  useEffect(() => {
    // isEnabled가 false면 위치 추적 안함
    if (!isEnabled || !navigator.geolocation) return;

    let watchId: number | null = null;
    let permissionStatus: PermissionStatus | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const startWatching = () => {
      if (watchId !== null) return; // Already watching

      watchId = navigator.geolocation.watchPosition(
        (p) => {
          const newPos = { lat: p.coords.latitude, lng: p.coords.longitude };
          setPosition(newPos);
          setGranted(true);
          
          const isLogged = !!(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'));
          if (!isLogged) return;

          toiletsRef.current.forEach((toilet) => {
            const dist = getDistance(newPos.lat, newPos.lng, toilet.lat, toilet.lng);
            if (dist <= 150) {
              const now = Date.now();
              const lastTime = lastCheckInRef.current.get(toilet.id) || 0;
              if (now - lastTime > 120000) {
                lastCheckInRef.current.set(toilet.id, now);
                console.log(`[Fast Check-in] ${toilet.name} 진입 감지 (${Math.round(dist)}m). 체크인 핑 전송.`);
                
                api.post('/records/check-in', {
                  toiletId: Number(toilet.id),
                  latitude: newPos.lat,
                  longitude: newPos.lng
                })
                .then(async (res: any) => {
                  await refreshUser();
                  if (onAutoCheckIn && res && typeof res.remainedSeconds === 'number') {
                    onAutoCheckIn(res.remainedSeconds);
                  }
                })
                .catch(err => {
                  console.warn('[Fast Check-in] 체크인 API 호출 실패:', err.message);
                });
              }
            }
          });
        },
        (err) => {
          console.error('[GeoTracking] 위치 추적 실패:', err);
          setGranted(false);
          // functional update로 stale closure 방지
          setPosition(prev => prev ?? { lat: 37.5172, lng: 127.0473 });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    const initTracking = async () => {
      if ('permissions' in navigator) {
        try {
          permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });

          if (permissionStatus.state === 'granted') {
            startWatching();
          } else if (permissionStatus.state === 'denied') {
            // 권한 거부 상태 → fallback 좌표 즉시 설정
            setGranted(false);
            setPosition(prev => prev ?? { lat: 37.5172, lng: 127.0473 });
          } else {
            // 'prompt' 상태 → onchange 대기하되, iOS에서 onchange 미발화 대비 안전 타임아웃
            fallbackTimer = setTimeout(() => {
              if (watchId === null) startWatching();
            }, 5000);
          }

          permissionStatus.onchange = () => {
            console.log('[GeoTracking] Permission state changed:', permissionStatus?.state);
            if (permissionStatus?.state === 'granted') {
              if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
              startWatching();
            } else if (permissionStatus?.state === 'denied') {
              if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
              if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
              }
              setGranted(false);
              setPosition(prev => prev ?? { lat: 37.5172, lng: 127.0473 });
            }
          };
        } catch (e) {
          console.warn('Geolocation permission query unsupported, falling back to immediate request');
          startWatching();
        }
      } else {
        // Fallback for Safari/Legacy
        startWatching();
      }
    };

    // 1. 이미 동의한 상태인지 체크
    const hasConsented = localStorage.getItem('location_consented') === 'true';

    // 이미 동의한 사용자만 곧바로 Tracking 시작
    if (hasConsented) {
      initTracking();
    } else {
      // 2. 동의하지 않은 사용자는 fallback 위치 설정만 해둠. 실제 권한 요청 안함.
      setPosition(prev => prev ?? { lat: 37.5172, lng: 127.0473 });
    }

    // 3. LocationConsentBanner에서 동의 이벤트를 발생시키면 Tracking 시작
    const onLocationConsented = () => {
      initTracking();
    };

    window.addEventListener('locationConsented', onLocationConsented);

    return () => {
      window.removeEventListener('locationConsented', onLocationConsented);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (permissionStatus) permissionStatus.onchange = null;
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [isEnabled, toilets, refreshUser]); 

  return { position, granted };
}
