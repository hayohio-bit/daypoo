# 카메라 화면 안 보이는 버그 수정 계획

## Context
방문인증 모달(VisitModal)에서 "카메라 실행하기" 버튼을 눌러도 카메라 화면이 표시되지 않는 버그.

---

## 근본 원인

**파일**: `frontend/src/components/map/VisitModal.tsx` (56–67번 줄)

**타이밍 버그**: `startCamera()`에서 `getUserMedia()`로 스트림을 얻은 뒤, `videoRef.current`가 `null`이라 스트림이 할당되지 않음.

```typescript
const startCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia(...);
  if (videoRef.current) {          // ← 여기서 null! → if 블록 건너뜀
    videoRef.current.srcObject = stream;
    setIsCameraActive(true);       // ← 절대 호출 안 됨
  }
};
```

**이유**: `<video ref={videoRef}>` 요소는 `isCameraActive === true`일 때만 DOM에 렌더링됨 (218번 줄: `{isCameraActive && (...)}`). 그런데 `isCameraActive`가 아직 `false`인 상태에서 `videoRef.current`를 참조하니 `null`이 됨.

결과: 스트림을 얻어도 할당 불가 → `setIsCameraActive(true)` 호출 안 됨 → 카메라 화면 영원히 안 보임.

---

## 수정 방법

### 접근: `streamRef` + `useEffect` 패턴

1. `streamRef`를 추가해 스트림을 임시 보관
2. `startCamera()`에서 스트림을 `streamRef.current`에 저장 후 `setIsCameraActive(true)` 바로 호출
3. `useEffect`로 `isCameraActive`가 `true`로 바뀌는 시점(= `<video>` DOM 마운트 직후)에 `videoRef.current.srcObject` 할당

```typescript
// 추가
const streamRef = useRef<MediaStream | null>(null);

// startCamera 수정
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
    streamRef.current = stream;   // 스트림 임시 저장
    setIsCameraActive(true);      // 먼저 video 요소를 DOM에 마운트
  } catch (err) {
    console.error('카메라 시작 실패:', err);
    alert('카메라 권한이 필요합니다.');
  }
};

// useEffect 추가 (isCameraActive가 true가 된 직후 video에 srcObject 할당)
useEffect(() => {
  if (isCameraActive && videoRef.current && streamRef.current) {
    videoRef.current.srcObject = streamRef.current;
  }
}, [isCameraActive]);

// stopCamera 수정 (streamRef도 정리)
const stopCamera = useCallback(() => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
  setIsCameraActive(false);
}, []);
```

---

## 수정 대상 파일

- `frontend/src/components/map/VisitModal.tsx`
  - 28번 줄 근처: `streamRef` 추가
  - 56–67번 줄: `startCamera` 수정
  - 69–75번 줄: `stopCamera` 수정
  - 141–143번 줄 근처: `useEffect` 추가

---

## 검증 방법

1. 개발 서버 실행 후 MapPage에서 화장실 선택 → 방문 인증 모달 열기
2. "카메라 실행하기" 버튼 클릭 → 카메라 권한 허용
3. 카메라 화면이 정상적으로 표시되는지 확인
4. 번개 버튼(촬영) 클릭 후 이미지 캡처 및 AI 분석 동작 확인
5. "다시 찍기" 버튼으로 재촬영 시에도 정상 동작 확인
6. 모달 닫을 때 카메라 스트림이 정상 종료되는지 확인 (브라우저 카메라 인디케이터 꺼짐)
