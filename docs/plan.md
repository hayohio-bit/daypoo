# 결제창 미출력 원인 파악 및 해결 계획

사용자가 결제 버튼을 클릭했을 때 토스 페이먼츠 결제창이 뜨지 않는 문제를 조사하고 해결하기 위한 계획입니다.

## 1. 예상 원인 분석
- **환경 변수 누락:** `PremiumPage.tsx`와 `MyPage.tsx`에서 `import.meta.env.VITE_TOSS_CLIENT_KEY`를 사용하고 있으나, `.env` 파일에 해당 키가 정의되어 있지 않음.
- **Vite 환경 설정 오류:** Vite 서버가 `frontend/` 디렉토리에서 실행될 때, 루트(`/`) 디렉토리에 있는 `.env` 파일을 자동으로 읽지 못함. (Vite는 기본적으로 `vite.config.js`가 위치한 곳의 `.env`만 로드함)
- **클라이언트 키 타입 불일치:** `VITE_` 접두사가 붙지 않은 환경 변수는 프론트엔드 코드에서 접근할 수 없음.

## 2. 조사 단계
- [x] 현재 `.env` 파일 내용 확인 (루트 및 서브 디렉토리) -> `TOSS_SECRET_KEY`만 존재하고 `VITE_TOSS_CLIENT_KEY` 누락 확인.
- [x] `vite.config.js` 설정 확인 -> `envDir` 설정 부재 확인.
- [ ] 브라우저 개발자 도구 콘솔 로그 확인 (에이전트 환경에서 직접 확인은 어려우나 코드상 `console.error` 출력 예상).

## 3. 해결 단계
- **단계 1:** 루트 `.env` 파일에 `VITE_TOSS_CLIENT_KEY` 추가 (테스트 키: `test_ck_D5aYdBmDx9E0Z14dk96Mlr3a985Z` 등 사용 권장 혹은 사용자 확인).
- **단계 2:** `frontend/vite.config.js`에 `envDir: '../'` 설정을 추가하여 루트의 `.env`를 공유하도록 수정.
- **단계 3:** 프론트엔드 서버 재시작 및 동작 확인.

## 4. 결과 보고
- 작업 완료 후 `docs/modification-history.md`에 기록하고 사용자에게 안내.
