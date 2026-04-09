# 시나리오 3: 주간 AI 건강 리포트 발급 및 열람 E2E 분석

**[통합 핵심 포인트]**
> DB의 7일 치 배변 기록 스키마를 JSON 배열로 파싱해 Python으로 개발된 AI 컨테이너로 넘기고, 그 결과물을 Markdown 엔진으로 파싱하는 복합 컨텐츠 아키텍처입니다.

## 1. 리포트 생성 트리거 및 API
1. 사용자가 `<ReportPage>` 진입 시 "내 주간 건강 리포트 작성" 배너를 터치합니다.
2. 프론트엔드 `apiClient` 가 `GET /api/v1/reports/weekly` 방식 호출로 `HealthReportController`를 가격합니다.

## 2. 백엔드 집계 알고리즘 (`HealthReportService.java`)
3. `PooRecordRepository.findAllByUserAndCreatedAtAfterOrderByCreatedAtDesc` 를 통해 최근 7일의 데이터를 끌어모읍니다.
4. 해당 기록들(Bristol 스케일, Color, 식이 태그)을 `AiReportRequest.PooRecordData` 객체 묶음으로 매핑합니다.

## 3. Python AI 서버 통신 (`AiClient.java`)
5. 백엔드는 Python으로 배포된 `@Value("${ai-service.url}")`를 향해 묶음 객체를 동기 통신으로 쏩니다.
6. Python 단(`report.py` 구현체 추정)에서는 LangChain과 LLM 프롬프팅을 거쳐 분석 텍스트를 추출하고 결과를 반환합니다. (응답 속도를 높이기 위해, 해당 AI 컨테이너가 Redis 24시간 자체 캐시를 갖추는 추세로 개발됩니다.)

## 4. 리포트 알림 
7. **[현재 구조]** 현재 DayPoo 소스 내부에서는 `HealthReportGeneratedEvent`라는 스프링 이벤트를 사용하지 않고, API 응답 완료 시 프론트엔드가 즉시 Report payload를 수신하는 "동기식" 방향으로 코딩되어 있습니다. 동기 응답이 끝나면, 프론트에서 자연스레 화면을 전환합니다.

## 5. Markdown 렌더링 (`ReportPage.tsx` 추정)
8. AI가 응답한 `insights`나 `summary` 등의 필드를, 프론트엔드의 `React Markdown` 라이브러리와 `remark-gfm` 플러그인을 거쳐 도식화된 문단과 형광펜 텍스트 등 가독성 좋은 데이터로 컨버팅해 렌더링합니다.

---

### E2E 매핑 테이블

| 레이어 | 담당 파일 / 컴포넌트 | 역할 요약 |
| :--- | :--- | :--- |
| 프론트 UI | `ReportPage.tsx` | API 트리거 및 Skeleton 로딩 노출 |
| API 진입점 | `HealthReportController.java` | HTTP 매핑 인증 절차 |
| 백엔드 서비스 | `HealthReportService.java` | 로컬 DB 정보 조회 및 AI DTO 합본 가공 |
| 외부 연동 모듈| `AiClient.java` | RestTemplate + Retryable 옵션 적용 송/수신 |
| AI 서버 (Python)| `report.py` | GPT-4o 연계 종합 추론 실행 |
| 프론트 Data View| `react-markdown` | 수신된 텍스트 청크를 Markdown Viewer로 파싱 |

### 에러 시나리오 성능 대응
*   **LLM 응답 지연(30초 이상)에 프론트엔드 타임아웃 발생:** 현재 동기 방식의 최대 단점입니다. 만약 OpenAI 서버 자체 지연으로 연결이 30초를 넘어가게 되면 프론트의 `fetch` 기반 `apiClient.ts`에 설정된 `AbortController`가 작동해 타임아웃 에러를 발생시킵니다. <br> 따라서 향후 도입 방안으로, **비동기 큐잉 모델(Kafka/RabbitMQ)**과 더불어 `HealthReportGeneratedEvent` 이벤트 발행 -> 백엔드는 202 Accepted 처리 -> 완료 시 알림(Notice) 날림 방식으로 스케일업 해야 합니다.
