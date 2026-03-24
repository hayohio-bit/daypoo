# 변경 이력 (Modification History)

## 2026-03-24 13:00:00

- **작업 내용:** 결제 UX 개선 및 시스템 동기화 작업
- **상세 변경 내역:**
  - **랭킹 상위 UI 시각 효과 강화 (`RankingPage.tsx`):** 순위 리스트와 시상대의 1, 2, 3위 보더라인(ConicGlow) 및 순위 배지 색상을 각각 금(#E8A838), 은(#B0B8B4), 동(#CD7C4A)의 금속 질감에 맞춘 전용 색상으로 차별화하여 상위권 유저의 보상감을 높였습니다.
  - **랭킹 페이지 UI 레이아웃 최적화 (`RankingPage.tsx`):** 하단에 고정되어 시야를 방해하던 '나의 순위' 바를 상단 통계 카드 바로 아래로 이동시키고, 카드 패딩과 텍스트 사이즈를 대폭 키워 시인성을 강화했습니다. 또한 시상대, 통계 칩, 나의 순위 카드 사이의 상하 여백을 세밀하게 재배치(14~16단위 간격)하여 리듬감 있고 전문적인 레이아웃을 완성했습니다.
  - **시스템 동기화:** `upstream/main`으로부터 최신 변경 사항(관리자 기능 마이그레이션 등)을 병합하고 `origin/main`으로 푸시 완료.
  - **백엔드 안정화:** 데이터베이스 마이그레이션 반영을 위해 백엔드 서버를 재가동하고 포트 점검 완료.
- **결과/영향:** 결제 과정에서의 불필요한 에러 노출을 방지하고 최신 시스템 상태를 유지함.

## 2026-03-24 19:45:00

- **작업 내용:** 관리자 API 고도화 및 SSE 전용 인증 체계 구축 (Phase 0~5 완료)
- **상세 변경 내역:**
  - **SSE 인증 보안 강화 (Phase 0):** `JwtProvider.java`에 30초 유효 기간의 단기 토큰 생성 로직(`createSseToken`) 구현 및 `NotificationController.java`에 토큰 발급 엔드포인트(`POST /sse-token`) 추가. 프론트엔드 연결 에러 해결.
  - **데이터베이스 성능 최적화 (Phase 1):** `V2__admin_features.sql` 마이그레이션을 통해 유저 역할, 가입일, 문의 상태, 아이템 타입에 인덱스 추가.
  - **도메인 모델 확장 (Phase 2):** `Item`, `Toilet`, `Inquiry` 엔티티에 관리자용 수정/답변 메서드 추가.
  - **레포지토리 및 DTO 정립 (Phase 3~4):** 6개 레포지토리에 페이징/검색/통계 쿼리 추가 및 관리자 전용 DTO 9종 생성.
  - **통합 관리 API 구축 (Phase 5):** `AdminManagementService` 및 4개의 전용 컨트롤러를 통해 유저, 화장실, CS, 상점 관리용 13개 엔드포인트 구현.
- **결과/영향:** 프론트엔드 실시간 알림 구독 시의 보안 취약점과 500 에러를 동시에 해결하였으며, 관리자 페이지 운영에 필요한 모든 백엔드 인프라와 API를 완비함.

## 2026-03-24 17:30:00

- **작업 내용:** 백엔드 시스템 확장성 및 유지보수성 극대화 (Phase 3: 장기 개선 완료)
- **상세 변경 내역:**
  - **AOP 기반 공통 관심사 분리:**
    - `ServiceLoggingAspect.java`: 서비스 계층의 모든 메서드 호출 시 실행 시간 및 파라미터를 자동 로깅하는 AOP 구현.
    - `RateLimitAspect.java` & `@RateLimit`: Redis 기반의 처리량 제한(Rate Limiting) 기능을 구현하여 로그인, 회원가입 등 주요 API의 남용 및 공격 방지 환경 구축.
  - **SSE 분산 환경 최적화:** `NotificationService.java`를 Redis Pub/Sub 구조로 리팩토링. 서버 인스턴스가 여러 대인 환경에서도 실시간 알림이 끊김 없이 사용자에게 전달되도록 분산 메시징 레이어 구축.
  - **데이터베이스 형상 관리 도입:**
    - Flyway 마이그레이션 도입 (`V1__init.sql` 생성).
    - `application.yml`: `ddl-auto: validate`로 전환하여 운영 환경의 데이터 안전성 확보 및 코드 기반 스키마 동기화 체계 확립.
- **결과/영향:** 시스템의 가시성(Logging)과 보안(Rate Limit)을 강화하고, 클라우드/분산 환경으로의 확장 준비를 모두 마쳤으며, 데이터베이스 변경 이력을 안전하게 관리할 수 있는 전문적인 백엔드 아키텍처를 완성함.

## 2026-03-24 15:40:00

- **작업 내용:** 백엔드 구조 개선 및 안정성 고도화 (Phase 2: 중기 개선 완료)
- **상세 변경 내역:**
  - **외부 API 추상화:** `ExternalApiConfig.java`를 통해 타임아웃(연결 5s, 읽기 30s)이 설정된 전용 `RestTemplate` 빈을 등록. `spring-retry`를 도입하여 `AiClient`, `GeocodingService` 등 외부 연동 시 일시적 장애에 대한 자동 재시도 로직 적용.
  - **토큰 무효화 (Logout):** Redis 기반의 블랙리스트 메커니즘 구현. `AuthService.logout` 시 Access Token을 Redis에 등록하고, `JwtAuthenticationFilter`에서 모든 요청마다 블랙리스트 여부를 검증하여 로그아웃된 토큰의 재사용을 원천 차단.
  - **성능 최적화 (DB & Query):**
    - `schema.sql`: `users(email, nickname)`, `poo_records(user_id, created_at)`, `notifications(user_id, is_read)` 등 주요 조회 경로에 인덱스를 추가하여 검색 속도 개선.
    - **Fetch Join 적용:** `NotificationRepository`, `PooRecordRepository`, `InventoryRepository`에서 연관 엔티티 조회 시 `JOIN FETCH`를 사용하여 N+1 쿼리 문제를 해결하고 전체적인 API 응답 지연 시간 단축.
  - **비즈니스 로직 강화:** `PooRecordService`에서 기존 '개발 모드(경고 후 통과)' 검증 로직을 제거하고, 실제 반경 이탈(`OUT_OF_RANGE`) 및 체류 시간 미달(`STAY_TIME_NOT_MET`) 시 엄격하게 예외를 발생시키도록 수정. `PooRecordController`의 경로 오타(`api/v1/api/v1`)도 정상화함.
- **결과/영향:** 시스템의 회복탄력성(Resilience)과 보안성을 동시에 확보하였으며, 데이터베이스 접근 최적화를 통해 대규모 트래픽 상황에서도 안정적인 서비스 제공이 가능하도록 기반을 다짐.

## 2026-03-24 12:45:00

- **작업 내용:** 백엔드 아키텍처 리팩토링 및 보안 강화 (Phase 1: 단기 개선 완료)
- **상세 변경 내역:**
  - **보안 (CORS):** `SecurityConfig.java` 및 `application.yml` 수정. CORS 와일드카드(`*`)를 제거하고 설정 파일(`app.cors.allowed-origins`)을 통해 명시적인 도메인만 허용하도록 개선하여 보안성 강화.
  - **계층 분리 (Service 도입):** `UserService.java`를 신규 생성하여 Controller에서 `UserRepository`에 직접 접근하던 레이어 위반 문제를 해결. 공통 사용자 조회 로직을 Service 계층으로 캡슐화.
    - 적용 대상: `NotificationController`, `ShopController`, `SupportController`, `ReportController`, `HealthReportController`.
  - **예외 처리 표준화:** `NotificationService.java` 등에서 발생하던 `IllegalArgumentException`을 `BusinessException` 체계로 전환하여 전역 에러 응답 규격을 통일함.
  - **전역 예외 핸들러 보강:** `GlobalExceptionHandler.java`에 `DataIntegrityViolationException`(중복 키), `HttpMessageNotReadableException`(형식이 잘못된 요청) 처리 로직을 추가하고 `ErrorCode.DUPLICATE_KEY` 정의.
- **결과/영향:** Controller-Service-Repository 간의 명확한 역할 분담을 통해 아키텍처를 정립하고, 보안 취약점 해결 및 일관된 에러 처리로 시스템 안정성을 대폭 향상함.

## [2026-03-24 12:00:00] 프론트엔드 리팩토링 잔여 작업 완료 및 시스템 고도화

- **작업 내용**: `goofy-seeking-meteor.md` 기반 프론트엔드 리팩토링 잔여 작업 완료
- **상세 변경 내역**:
  - `VisitModal.tsx`: 카메라 중지 및 정리 로직을 `streamRef`를 통해 더 견고하게 보강.
  - `apiClient.ts`: 전역 `ApiResponse` 및 도메인 타입(`AiAnalysisResponse` 등)을 적용하여 제네릭 기반의 타입 안전성 확보.
  - `types/api.ts`: API 통신에 사용되는 공통 응답 및 도메인별 타입(User, Toilet, PooRecord 등) 정의.
  - `vite.config.js`: `manualChunks` 설정을 도입하여 벤더 라이브러리와 UI 컴포넌트를 분리 빌드하도록 최적화.
  - 의존성 제거: 미사용 라이브러리인 `axios` 및 `zustand`를 `package.json`에서 삭제.
- **결과/영향**: 런타임 안정성(카메라 이슈) 개선, 개발 생산성(타입 자동 완성) 향상 및 빌드 결과물 최적화.

## 2026-03-24 11:26:00

- **작업 내용**: 랭킹 페이지 UI 정렬 수정 및 알림 컨텍스트 최적화
- **상세 변경 내역**:
  - `RankingPage.tsx`: 탭 버튼 레이아웃을 `flex-row`로 변경하고 수직 정렬 보정.
  - `NotificationContext.tsx`: 주요 함수에 `useCallback` 적용하여 불필요한 리렌더링 및 데이터 덮어쓰기 방지.
  - `MainPage.tsx`: AI 건강 리포트 카드를 Glassmorphism 스타일로 최종 확정.
- **결과/영향**: UI 일관성 강화 및 알림 시스템 데이터 정합성 해결.

## 2026-03-24 11:24:00

- **작업 내용**: 리포트 카드 Carousel 디자인 테스트
- **상세 변경 내역**:
  - `MainPage.tsx`: Bento/Glass 대신 Carousel 스타일(`ReportCard_Carousel.tsx`) 적용 테스트.
- **결과/영향**: 다양한 디자인 레이아웃 검토.

## 2026-03-24 11:15:00

- **작업 내용**: 리포트 카드 Glassmorphism 디자인 적용
- **상세 변경 내역**:
  - `MainPage.tsx`: Bento Grid 대신 Glassmorphism 스타일(`ReportCard_Glass.tsx`) 적용.
- **결과/영향**: 프리미엄 UI 디자인 확립.

## 2026-03-24 11:10:00

- **작업 내용**: 메인 페이지 건강 리포트 섹션 Bento Grid 디자인 적용
- **상세 변경 내역**:
  - `MainPage.tsx`: `ReportCard_Bento.tsx` 컴포넌트 임포트 및 레이아웃 반영.
- **결과/영향**: 정보 집약적인 Bento 스타일 UI 구현.

## 2026-03-24 11:00:00

- **작업 내용**: 랭킹 페이지 탭 레이아웃 및 이모지 정렬 수정
- **상세 변경 내역**:
  - 탭 버튼 내 아이콘과 텍스트의 정렬이 맞지 않는 문제 해결.
  - 전체 랭킹, 동네 왕, 건강 왕 각 섹션의 시각적 균형 보정.
- **결과/영향**: 사용자 경험 개선 및 시각적 완성도 향상.

## 2026-03-23 18:00:00

- **작업 내용**: 회원가입 폼 생년월일 입력 및 유효성 검사 강화
- **상세 변경 내역**:
  - `AuthModal.tsx` 내 회원가입 스텝에 `BirthDropdowns` 적용.
  - 생년월일 미선택 시 에러 메시지 표시 로직 추가.
  - 닉네임 중복 체크 API 연동.
- **결과/영향**: 가입 데이터의 정확성 및 서비스 신뢰도 확보.

## 2026-03-23 15:30:00

- **작업 내용**: 실시간 알림 센터 UI 및 테스트 기능 추가
- **상세 변경 내역**:
  - `NotificationPanel.tsx`에 성취, 메시지, 시스템 알림 테스트 버튼 추가.
  - 알림 없을 시 빈 화면 처리 최적화.
- **결과/영향**: 개발 피드백 속도 향상 및 알림 가독성 개선.

## 2026-03-23 12:00:00

- **작업 내용**: 관리자 대시보드 위젯 클릭 네비게이션 구현
- **상세 변경 내역**:
  - 방문자 수, 리뷰 수 등 요약 위젯 클릭 시 관련 상세 라우트로 이동 기능 추가.
  - 시스템 로그 및 상점 관리 페이지 기본 골격 생성.
- **결과/영향**: 관리자 페이지 인터랙션 강화 및 운영 효율 증대.

## 2026-03-22 22:00:00

- **작업 내용**: 로그인 후 이전 페이지 리다이렉트 로직 구현
- **상세 변경 내역**:
  - `AuthContext.tsx`에 `returnUrl` 저장 로직 추가.
  - `AuthModal` 성공 콜백 시 `sessionStorage`에 저장된 이전 경로로 자동 이동.
- **결과/영향**: 끊김 없는 사용자 전환 경험 제공.
