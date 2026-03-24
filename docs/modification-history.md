# 수정 이력 (Modification History)

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

## 2026-03-24 11:08:00
- **작업 내용:** 메인 페이지 AI 건강 리포트 컴포넌트 최종 확정 (Glassmorphism)
- **상세 변경 내역:**
  - `MainPage.tsx`: 테스트했던 Carousel 모드에서 Glassmorphism 모드(`ReportCard_Glass.tsx`)로 최종 복구 및 확정.
- **결과/영향:** 완성도 높은 Glass 디자인을 통해 메인 화면의 심미성과 프리미엄 브랜드 이미지를 구축함.

## 2026-03-24 11:07:00
- **작업 내용:** 메인 페이지 AI 건강 리포트 컴포넌트 교체 (Carousel)
- **상세 변경 내역:**
  - `MainPage.tsx`: 기존 `ReportCard_Glass.tsx` 대신 `ReportCard_Carousel.tsx`를 임포트하여 역동적인 캐러셀(슬라이드) 방식 적용.
- **결과/영향:** 정보 탐색의 재미를 더하고 다양한 분석 데이터를 효율적으로 배치할 수 있는 대화형 UI 제공.

## 2026-03-24 11:06:00
- **작업 내용:** 메인 페이지 AI 건강 리포트 컴포넌트 교체 (Glassmorphism)
- **상세 변경 내역:**
  - `MainPage.tsx`: 기존 `ReportCard_Bento.tsx` 대신 `ReportCard_Glass.tsx`를 임포트하여 세련된 Glassmorphism 테마 적용.
- **결과/영향:** 메인 페이지에 투명도와 블러 효과를 활용한 고급스러운 시각적 경험 제공.

## 2026-03-24 11:05:00
- **작업 내용:** 메인 페이지 AI 건강 리포트 컴포넌트 교체 (Bento Grid)
- **상세 변경 내역:**
  - `MainPage.tsx`: 기존 `ReportCard.tsx` 대신 `ReportCard_Bento.tsx`를 임포트하여 현대적인 Bento Grid 레이아웃 적용.
- **결과/영향:** 메인 페이지의 시각적 요소가 더욱 고급스러워졌으며 리포트 정보의 위계와 가독성이 개선됨.

## 2026-03-24 10:40:00
- **작업 내용:** 알림 시스템 API 고도화 및 SSE 인증 방식 개선 (BACKEND_ISSUES_REPORT 대응)
- **상세 변경 내역:**
  - `JwtAuthenticationFilter.java`: `EventSource`(SSE)의 커스텀 헤더 미지원 문제를 해결하기 위해 URL 쿼리 파라미터(`?token=xxx`)에서 JWT를 추출할 수 있도록 로직 개선.
  - `NotificationController.java` & `NotificationService.java`: 
    - `POST /api/v1/notifications/mark-all-read`: 모든 미읽음 알림을 일괄 읽음 처리하는 API 추가.
    - `DELETE /api/v1/notifications/{notificationId}`: 알림 개별 삭제 API 추가 및 소유권 확인 로직 적용.
  - `NotificationRepository.java`: 일괄 처리를 위한 `findAllByUserAndIsReadFalse` 쿼리 메서드 추가.
- **결과/영향:** 프론트엔드 알림 UI의 기능적 완성도가 높아졌으며, 쿼리 파라미터 인증 지원을 통해 실시간 알림 기능의 안정적인 연결 환경을 구축함.

## 2026-03-24 10:25:00
- **작업 내용:** 스마트 방문 인증(Fast Check-in) 타이머 동기화 버그 수정 (백엔드 우회 대응)
- **상세 변경 내역:**
  - `PooRecordController.java`: 프론트엔드 API 호출 경로의 `/api/v1` 중복 이슈(`/api/v1/api/v1/...`)를 허용하도록 `@RequestMapping`에 중복 경로 패턴 추가.
  - `PooRecordService.java`: `checkIn` 시 거리 검증(`isNear`) 실패 시 예외를 던지는 대신 경고 로그를 남기고 진행하도록 수정 (개발 환경의 위치 오차 및 테스트 편의성 고려, 기존 `createRecord`와 동일한 패턴 적용).
- **결과/영향:** 프론트엔드를 직접 수정하지 않고도 백엔드에서 잘못된 경로 요청을 수용하게 함으로써 사용자가 '방문 인증'을 눌렀을 때 60초 타이머가 초기화되지 않고 서버 기록에 따라 즉시 활성화되도록 개선함.

## 2026-03-24 10:20:00
- **작업 내용:** 모든 시스템 서버(프론트엔드, 백엔드, AI) 및 기반 인프라(Docker) 재가동 완료
- **상세 변경 내역:**
  - **인프라 가동:** Docker Desktop이 중지되어 있어 백엔드 구동에 필요한 PostgreSQL 및 Redis 컨테이너를 가동함 (`docker-compose up -d`).
  - **AI 서비스 복구:** AI 서비스의 가상환경(`.venv`) 경로 불일치 및 라이브러리(`openai` 등) 누락 문제를 해결하기 위해 가상환경을 재생성하고 의존성(`requirements.txt`)을 재설치함.
  - **서버 재시작:**
    - **백엔드:** Spring Boot (8080 포트) 정상 가동 확인.
    - **프론트엔드:** Vite (5173 포트) 정상 가동 확인.
    - **AI 서비스:** FastAPI (8000 포트) 정상 가동 확인.
- **결과/영향:** 모든 서버가 정상적인 연결 상태에서 동작하도록 복구되었으며, 개발 환경이 완전히 활성화됨.

## 2026-03-24 10:15:00
- **작업 내용:** 프로젝트 최종 동기화 및 서버 환경(백엔드/프론트엔드/AI) 재가동 완료
- **상세 변경 내역:**
  - **Git 병합:** 팀원의 최신 작업 내역(스마트 방문 인증 등)을 병합하며 발생한 `docs/modification-history.md`의 충돌을 해결함.
  - **환경 구축:** 
    - 백엔드(Spring Boot, 8080), 프론트엔드(Vite, 5173), AI 모킹 서비스(FastAPI, 8000)를 모두 정상 기동함.
    - 중복 실행 중이던 Gradle/Java 프로세스를 정리하여 포트 충돌 및 리소스 낭비를 방지함.
  - **검증:** AI 서비스 헬스체크(`{"status":"healthy","mode":"mock"}`) 및 백엔드 시작 로그를 통해 전체 시스템의 통합 연결 상태를 확인함.
- **결과/영향:** 모든 서비스가 최신 코드 베이스에서 안정적으로 동작하는 통합 개발 환경을 구축함.

## 2026-03-24 10:10:00
- **작업 내용:** 랭킹 페이지(RankingPage) 탭 버튼 및 리스트 아이템 레이아웃 정렬 개선
- **상세 변경 내역:**
  - `RankingPage.tsx`:
    - 탭 버튼의 배치를 수직(`flex-col`)에서 수평(`flex-row`)으로 변경하고 `gap-2` 및 아이콘 크기 확대(14px -> 16px)를 통해 시각적 균형 확보.
    - 리스트 아이템(`RankItem`) 내 정보 섹션의 수직 중앙 정렬 로직 보완 및 칭호 배지 스타일 미세 조정.
- **결과/영향:** 탭 메뉴의 가독성을 높이고 전체적인 디자인 일관성을 강화하여 프리미엄한 랭킹 시스템 UI를 완성함.

## 2026-03-24 09:12:00
- **작업 내용:** 인증 시스템 개편 잔여 리팩토링 및 API 문서(OpenAPI) 동기화 완료
- **상세 변경 내역:**
  - `PaymentController.java`: `@AuthenticationPrincipal` 변수명을 `username`에서 `email`로 변경하여 모든 컨트롤러의 용어를 통일함.
  - `openapi.yaml`: `SignUpRequest`, `LoginRequest` 스키마 내의 `username` 필드를 `email`로 수정하여 실제 백엔드 DTO(Record) 스펙과 일치시킴.
  - `plan.md`: 인증 시스템 개편(아이디->이메일 전환) 관련 모든 항목을 검토 후 완료([x]) 처리함.
- **결과/영향:** 시스템 내 모든 식별자 용어가 `email`로 통일되어 코드 가독성이 향상되었으며, API 문서와 실제 구현체 간의 불일치가 해소됨.

## 2026-03-24 09:10:00
- **작업 내용:** 스마트 방문 인증(Fast Check-in) 프론트엔드/백엔드 고도화 및 화장실 데이터 동기화 기능 추가
- **상세 변경 내역:**
  - `AdminController.java`: 화장실 수동 동기화를 위한 `syncToilets` API 개발.
  - `MapPage.tsx` & `useGeoTracking.ts`: 백라운드 위치 추적 기반의 'Smart Fast Check-in' 기능 연동. 자동 도착 감지 및 입구 연동 로직 강화.
  - `VisitModal.tsx`: 방문 완료 시의 UI 연동 및 데이터 처리 로직 수정.
  - `NotificationSubscriber.tsx` & `NotificationContext.tsx`: 전역 알림 구독 시스템의 안정화 및 실시간 업데이트 연동.
  - `docs/PLAN_FAST_CHECKIN.md` 등: 개발 가이드 및 아키텍처 문서 최신화.
- **결과/영향:** 사용자가 화장실에 도착했을 때 별도의 조작 없이도 체류 시간이 자동으로 계산되는 패스트 체크인 시스템의 통합을 완료하고, 관리자가 화장실 데이터를 수동으로 갱신할 수 있는 기반을 마련함.

## 2026-03-24 18:40:00
- **작업 내용:** 비로그인 시 알림 아이콘 숨김 처리 및 프론트엔드 알림 테스트 도구 구현
- **상세 변경 내역:**
  - `Navbar.tsx`: `isAuthenticated` 상태를 체크하여 로그인한 사용자에게만 알림(종 모양) 아이콘이 보이도록 수정.
  - `NotificationPanel.tsx`: 
    - `useNotification` 훅을 연동하여 전역 토스트 시스템과 연결.
    - 하단에 'Debug: Notification Test' 섹션 추가. 성취(Achievement), 메시지(Message), 시스템(Info) 등 3가지 유형의 알림을 즉시 테스트할 수 있는 버튼 구현.
    - 테스트 버튼 클릭 시 팝업 애니메이션(Toast)과 알림 목록(Panel List)에 가상 데이터가 즉시 추가되도록 로직 구성하여 팀원 간 UI/UX 검증 편의성 제공.
- **결과/영향:** 로그인 여부에 따른 UI 일관성을 확보하고, 백엔드 연동 없이도 프론트엔드 단에서 알림 애니메이션과 리스트 렌더링을 즉각 테스트할 수 있는 환경을 구축함.
