# 섹션 4: RankingDataSeeder 분석

초기 어플리케이션은 사용자가 0명인 빈 깡통 상태입니다. 랭킹 시스템이 프론트엔드 환경에서 올바로 렌더링되는지 개발/검증하기 위하여, 로컬 환경이나 시뮬레이션 환경이 뜰 때 더미(Dummy) 데이터를 시드(Seeding)해야 합니다. 이를 수행하는 핵심 징검다리가 `RankingDataSeeder` 또는 `ApplicationRunner` 입니다.

## 1. Spring 이벤트 기반 초기 구동 (`ApplicationReadyEvent`)
DayPoo 프로젝트는 프로그램이 시작되어 컨텍스트가 완전히 초기화된 것을 확인한 뒤 랭킹 관련 초기 구동을 시도합니다. 바로 `ApplicationReadyEvent` 리스너를 사용하는 방법입니다.

```java
  @EventListener(ApplicationReadyEvent.class)
  public void onApplicationReady() {
    log.info("[Ranking] ApplicationReadyEvent: 랭킹 재구축 수행");
    // 초기 더미/기존 데이터가 DB에 있다면 그 직후 Redis에 Sync를 수행합니다.
    rebuildAllRankings(); 
  }
```

## 2. 개발 및 테스트 환경 분기 (`@Profile`)
운영 서버(Production)에서는 실수로라도 봇 데이터나 테스트 더미 데이터가 덮어씌워져서는 안 됩니다. 보통 스프링 부트에서는 이를 `@Profile("!prod")` 어노테이션으로 엄격하게 제어합니다.

```java
// 가상의 Seeder 구조 (DayPoo 시뮬레이터 참고)
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class AppDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PooRecordRepository recordRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("로컬/통합 테스트 환경: 기본 봇 유저 및 기록 생성 동작 구동");
            // 봇 사용자들을 생성하고, 봇 시나리오에 따른 배변 기록 생성 처리...
        }
    }
}
```

시퀀스
```text
[Spring Boot Startup]
        |
    (DB Schema Migration By Flyway)
        |
    [CommandLineRunner / Seeder 실행 (!prod 한정)]
        -> User 테이블 봇 100명 Insert
        -> PooRecord 테이블 더미 배변 기록 Insert
        |
    [ApplicationReadyEvent 발동]
        -> RankingService.rebuildAllRankings() 실행
        -> DB의 통계 쿼리를 기반으로 Redis ZSet 랭킹에 점수 초기화
```

---

> [!NOTE] 랭킹 설계 핵심
> **소스 이원화와 Redis의 휘발성 보완**
> Redis를 주 메모리 저장소로 사용할 때 "서버 리엔트리(재부팅 시 데이터 날아감)" 문제를 어떻게 해결할지가 중요한 쟁점입니다. 
영구 저장소(PostgreSQL)에 `PooRecord` 원본을 남겨두고 애플리케이션 시작 시마다 즉시 집계하여 Redis로 퍼올리는 구조를 취함으로써, 어떠한 경우에도 랭킹 정합성을 자가 회복할 수 있는 견고함을 갖추었습니다!

