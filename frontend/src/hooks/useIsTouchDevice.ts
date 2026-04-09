export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia('(any-pointer: coarse)').matches)
  );
}

export function useIsTouchDevice() {
  // 클라이언트 사이드 앱이므로 동기적으로 평가해도 무방합니다.
  return isTouchDevice();
}
