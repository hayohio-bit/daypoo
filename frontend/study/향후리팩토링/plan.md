# 백엔드 실시간 랭킹 시스템 분석 스터디 계획서 (실제 코드 정합성 반영)

현재 백엔드의 실제 코드(`RankingController`, `RankingService`, `RankingDataSeeder` 등) 구조를 분석한 결과, 요청하신 스터디 주제와 일부 차이가 있음을 확인했습니다. **실제 프로젝트 코드에 맞추어 스터디 자료의 세부 내용을 아래와 같이 수정하여 계획합니다.**

---

### ⚠️ 실제 프로젝트 코드와 프롬프트의 주요 차이점 (정합성)
1. **API 엔드포인트:** `/ranking/{period}`가 아니라 **`/rankings/global`, `/rankings/region`, `/rankings/health`**로 분리되어 있습니다.
2. **Redis 키 및 랭킹 종류:** 일간/주간/월간 구분이 아닌, **글로벌(`daypoo:rankings:global`), 지역(`daypoo:rankings:region:{name}`), 건강왕(`daypoo:rankings:health`)** 구조로 운영 중입니다.
3. **점수 산정 로직:** `RankingScoreCalculator` 클래스는 없으며, `RankingService` 내부에 **`recordCount + uniqueToilets * 3.0`** 공식이 하드코딩되어 있습니다.
4. **스케줄러:** 별도의 `RankingScheduler` 대신 `RankingService` 내에서 **매일 새벽 4시(`0 0 4 * * *`)에 전체 랭킹을 Rebuild** 하는 분산 락(Lock) 기반의 구조입니다.
5. **동점자 처리:** 현재 Redis `score`에 타임스탬프가 병합되지 않고 단순 점수로 저장되어, Redis의 사전순(알파벳) 정렬 방식을 따릅니다.

---

### 📄 생성할 파일 및 주요 내용 (frontend/study/backend_ranking_Ex/ 폴더에 생성 예정)

#### 1. `01_랭킹_점수_산정_체계.md`
- 실제 점수 공식 정리 (`기록 1건(1.0) + 서로 다른 화장실(3.0)`)
- 건강왕 점수 산출 방식 요약 (HealthReportSnapshot 기준)
- `RankingScoreCalculator` 대신 `RankingService` 내부 로직 분석

#### 2. `02_Redis_Sorted_Set_설계.md`
- 실제 Redis 키 설계 (`global`, `health`, `region`) 분석
- 매일 전체 재구축(Rebuild)을 활용하는 이유 및 임시 키(`:rebuilding`) 후 `RENAME` 기법
- Mset 구조 대신 사용된 ZSet 명령어 요약 및 O(log N) 성능

#### 3. `03_RankingController_API_설계.md`
- `/api/v1/rankings/global`, `/region`, `/health` 엔드포인트 설계
- `RankingResponse`, `UserRankResponse`, `EquippedItemResponse` 등 N+1 최적화를 방지하기 위한 실제 일괄 리턴 구조 로직

#### 4. `04_RankingDataSeeder_분석.md`
- `!production` 프로파일 환경에서의 `CommandLineRunner` 초기 데이터 세팅 기법
- DB(`User`) 스텁 생성 후 곧바로 Redis 랭킹 서버에 반영하는 로직

#### 5. `05_랭킹_로테이션_및_스케줄러.md`
- `RankingService.scheduledRankingRebuild()` 분석 (매일 04:00)
- Redis 분산 락(`setIfAbsent` / `daypoo:lock:rebuild_rankings`)을 활용해 중복 실행을 막는 획기적인 서버 로직 분석

#### 6. `06_이벤트_기반_랭킹_업데이트.md`
- `ApplicationReadyEvent` 및 배변 기록 관련 이벤트 리스너의 처리 방식
- 데이터 삽입 후 Redis 데이터 정합성 유지 전략

#### 7. `07_봇_시뮬레이션_및_Lambda.md`
- `BotOrchestrator` 및 시나리오 봇 동작 분석
- 부하 생성 및 랭킹 데이터 자동 채움을 위한 아키텍처 (Terraform AWS Lambda 연동 가설)

#### 8. `08_동점_처리_및_공정성.md`
- ZSet 기본 동점자 정렬 방식 (Lexicographical) 설명
- 앱 내 Rate Limiting 등을 이용한 단순 점수 조작 방어 패턴

---
**진행 여부 확인:** 위와 같이 실제 프로젝트 상황에 맞게 8개의 스터디 파일을 `frontend/study/backend_ranking_Ex` 디렉토리에 순차적으로 생성하겠습니다. 승인해 주시면 바로 작업을 시작합니다!
