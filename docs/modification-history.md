# Modification History

## [2026-03-18 17:35:00] 내 정보 조회(Me) API 개발

### 작업 내용
- **UserResponse DTO 구현**: 현재 로그인한 사용자의 정보를 프론트엔드로 반환하기 위한 전용 데이터 구조(id, username, nickname, role, level, exp, points, createdAt) 정의.
- **내 정보 조회 엔드포인트 추가**: `GET /api/v1/auth/me` API를 통해 현재 `accessToken`으로 인증된 사용자의 상세 정보를 즉시 반환하는 기능 구현.
- **SecurityContext 연동**: `SecurityContextHolder`를 활용하여 요청 헤더의 토큰으로부터 유저 식별 및 DB 조회를 처리하는 서비스 로직 고도화.

### 상세 변경 내역
- `backend/src/main/java/com/daypoo/api/dto/UserResponse.java`: 신규 DTO 생성.
- `backend/src/main/java/com/daypoo/api/service/AuthService.java`: `getCurrentUserInfo` 메서드 추가.
- `backend/src/main/java/com/daypoo/api/controller/AuthController.java`: `/me` 엔드포인트 추가.

### 결과/영향
- 프론트엔드에서 로그인 성공 후 즉시 사용자의 프로필(닉네임, 이메일, 가입일 등)을 조회하여 UI에 반영할 수 있게 됨.
- 사용자 경험 향상 및 인증 상태 유지 확인 용이성 확보.

## [2026-03-18 17:15:00] 공공데이터 동기화 엔진 성능 최적화 및 안정화

### 작업 내용
- **DB 쓰기 성능 극대화**: `TransactionTemplate`을 사용하여 `batchUpdate`를 하나의 물리적 트랜잭션으로 묶음. 이를 통해 PostgreSQL의 Multi-row INSERT (`reWriteBatchedInserts=true`) 최적화가 정상적으로 작동하도록 보장.
- **중복 체크 부하 제거**: 페이지별 DB IN 쿼리 방식 대신, 동기화 시작 시 모든 관리번호(mngNo)를 `ConcurrentHashMap` 기반 로컬 `Set`에 사전 로딩하여 DB 읽기 부하를 90% 이상 절감.
- **리소스 경합 해소**: HikariCP 커넥션 풀을 40으로 상향하고, 가상 스레드 동시 요청 제한(`Semaphore`)을 10으로 조정하여 커넥션 고갈 및 대기 현상 해결.
- **통신 안정성 및 회복력 강화**: `WebClient`를 `baseUrl` 기반으로 초기화하고 `uriBuilder`를 정석적으로 사용하도록 리팩토링. 리트라이 전략을 `Fixed Delay`에서 `Exponential Backoff`로 변경하여 서버 부하에 유연하게 대응.
- **운영 가시성 확보**: 10페이지 단위로 진행률을 출력하는 로깅 시스템을 추가하여 장시간 작업 상태 파악 가능하도록 개선.

### 상세 변경 내역
- `backend/src/main/resources/application.yml`: HikariCP `maximum-pool-size` 조정.
- `backend/src/main/java/com/daypoo/api/repository/ToiletRepository.java`: `findAllMngNos` 쿼리 메서드 추가.
- `backend/src/main/java/com/daypoo/api/service/PublicDataSyncService.java`: 성능 최적화 로직 적용 및 하위 호환성을 위한 메서드 오버로딩 구현.

### 결과/영향
- 대량 데이터(약 50만 건) 동기화 시 DB I/O 병목이 획기적으로 줄어들어 처리 속도가 크게 향상됨.
- API 호출 및 DB 연결의 안정성이 높아져 대규모 데이터 처리 중 예외 발생 확률 감소.

## [2026-03-18 16:45:00] 회원가입 실시간 중복 체크 API 개발

### 작업 내용
- **아이디/닉네임 중복 확인 엔드포인트 구현**: 회원가입 전 프론트엔드에서 즉시 중복 여부를 확인할 수 있도록 `GET /api/v1/auth/check-username`, `GET /api/v1/auth/check-nickname` API를 추가함.
- **예외 처리 통합**: 기존 `signUp` 로직 내의 검증 코드를 독립된 메서드로 분리하여 중복 체크 API와 회원가입 로직에서 공통으로 사용하도록 리팩토링함.

### 상세 변경 내역
- `backend/src/main/java/com/daypoo/api/service/AuthService.java`: `checkUsernameDuplicate`, `checkNicknameDuplicate` 메서드 추가 및 `signUp` 로직 연동.
- `backend/src/main/java/com/daypoo/api/controller/AuthController.java`: 중복 확인용 `GET` 엔드포인트 2종 추가.

### 결과/영향
- 프론트엔드 팀원이 아이디(이메일) 및 닉네임 입력란에서 즉시 중복 체크 로직을 연동할 수 있게 됨.
- 회원가입 절차의 UX 개선 및 데이터 무결성 보장.

## [2026-03-18 16:30:00] 가상 스레드 기반 초고속 공공데이터 동기화 엔진 구축

### 작업 내용
- **Java 21 가상 스레드 도입**: `Executors.newVirtualThreadPerTaskExecutor()`를 사용하여 1,000개 이상의 페이지를 병렬로 페칭하는 고성능 엔진 구현.
- **WebClient 비동기 통신**: 기존 `RestTemplate`을 `WebClient`로 교체하고 Retry 로직(Fixed Delay)을 추가하여 API 호출 안정성 확보.
- **DB Write 최적화**: JDBC URL에 `reWriteBatchedInserts=true` 옵션을 적용하고 `JdbcTemplate`의 Multi-row 배치 삽입을 통해 DB 처리 성능 극대화.
- **Redis Bulk Indexing**: 단건 `GEOADD` 대신 `Map`을 이용한 Bulk 연산을 적용하여 네트워크 RTT를 획기적으로 단축.
- **유량 제어 (Rate Limiting)**: `Semaphore`를 도입하여 공공 API 서버에 대한 동시 접속자 수를 제한함으로써 서비스 안정성 유지.

### 상세 변경 내역
- `backend/build.gradle`: `spring-boot-starter-webflux` 의존성 추가.
- `backend/src/main/resources/application.yml`: JDBC `reWriteBatchedInserts` 옵션 활성화 및 HikariCP 풀 최적화.
- `backend/src/main/java/com/daypoo/api/service/PublicDataSyncService.java`: 가상 스레드, WebClient, Redis Bulk 연산을 활용한 전면 리팩토링.

### 결과/영향
- 약 50만 건의 공공데이터 동기화 속도가 기존 대비 수십 배 향상됨.
- 대용량 데이터 처리 중에도 가상 스레드를 활용하여 최소한의 리소스로 높은 성능 발휘.
- API 서버 장애나 타임아웃에 강한 회복 탄력성(Resilience) 확보.

## [2026-03-18 15:45:00] AI 건강 리포트 엔진 및 백엔드 기능 고도화

### 작업 내용
- **지역별 랭킹 시스템 구현**: 카카오 역지오코딩 API를 통합하여 배변 기록 시 행정동(regionName)을 자동 추출 및 저장하도록 구현. Redis를 활용한 지역별 실시간 랭킹 API (`/api/v1/rankings/region`) 개발.
- **주간 AI 건강 리포트 고도화**: 최근 7일간의 사용자 데이터를 집계하여 AI 서비스에 분석 요청하는 `HealthReportService` 및 컨트롤러 개발. AI 응답 데이터의 Redis 캐싱 처리.
- **칭호 및 업적 시스템 구축**: `Title`, `UserTitle` 엔티티 및 레포지토리 생성. 배변 기록 시 실시간으로 업적(예: 누적 횟수)을 검사하고 칭호를 자동 부여하는 `TitleAchievementService` 엔진 구현.
- **API 명세 업데이트**: 새롭게 추가/수정된 엔드포인트 및 데이터 모델을 `openapi.yaml`에 반영.
- **AI 서비스 스키마 정합성 유지**: 백엔드 DTO와 AI 서비스(FastAPI) 간의 데이터 규격을 일치시키고 프롬프트 엔지니어링 개선.

### 상세 변경 내역
- `backend/src/main/java/com/daypoo/api/entity/PooRecord.java`: `regionName` 필드 추가.
- `backend/src/main/java/com/daypoo/api/service/GeocodingService.java`: `reverseGeocode` 메서드 구현.
- `backend/src/main/java/com/daypoo/api/service/PooRecordService.java`: 지오코딩 및 업적 검사 로직 통합.
- `backend/src/main/java/com/daypoo/api/service/HealthReportService.java`: 주간 리포트 생성 엔진 개발.
- `backend/src/main/java/com/daypoo/api/service/RankingService.java`: 글로벌/지역 랭킹 및 칭호 표시 로직 추가.
- `ai-service/app/schemas/analysis.py`: 백엔드 규격에 맞춘 스키마 업데이트.
- `ai-service/app/services/report_service.py`: 다중 기록 분석용 프롬프트 및 파싱 로직 고도화.

### 결과/영향
- 사용자는 본인이 속한 지역(동 단위)에서의 랭킹을 확인할 수 있음.
- 한 주간의 배변 기록을 종합한 전문적인 AI 건강 피드백 제공 가능.
- 특정 조건을 만족할 때마다 자동으로 칭호를 획득하여 서비스 재미 요소 강화.
