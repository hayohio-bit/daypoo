# 섹션 2: Redis Sorted Set 키 설계 & 핵심 연산

## 1. Redis 키 구조 (Namespace 설계)
현재 DayPoo 프로젝트의 랭킹 시스템은 `어플리케이션:도메인:세부주제` 형태로 Redis 네임스페이스를 관리합니다. 일간/주간/월간으로 시간 구분을 하는 대신 주제별(글로벌, 지역, 건강)로 분리되어 있습니다.

- **글로벌 랭킹:** `daypoo:rankings:global`
- **건강왕 랭킹:** `daypoo:rankings:health`
- **지역별 랭킹:** `daypoo:rankings:region:{name}` (예: `daypoo:rankings:region:서울`, `daypoo:rankings:region:부산`)

---

## 2. 임시 키(Rebuilding Key)와 RENAME 전략
스케줄러에 의해 전체 랭킹을 다시 계산할 때, 기존 랭킹 Key를 비우고 데이터를 삽입하게 되면 사용자가 빈 랭킹 페이지를 보게 되는 **다운타임 문제**가 발생합니다.
DayPoo 프로젝트는 이 문제를 방지하기 위해 **임시 키 생성 -> 데이터 주입 -> 키 RENAME** 프로세스를 통해 원자적인 교체를 달성하고 있습니다.

```java
// RankingService.java 내 재구축 로직 분석
public void rebuildAllRankings() {
   // 1. 임시 키 선언
   String tempGlobalKey = "daypoo:rankings:global:rebuilding";
   
   // 2. DB에서 전체 랭크 대상 조회
   List<UserScoreProjection> globalScores = recordRepository.findAllGlobalScores();
   
   // 3. 임시 키에 데이터 세팅 (사용자는 여전히 이전 랭킹을 조회 중)
   for (UserScoreProjection p : globalScores) {
     double score = p.getRecordCount() + p.getUniqueToilets() * 3.0;
     redisTemplate.opsForZSet().add(tempGlobalKey, p.getUserId().toString(), score);
   }
   
   // 4. 원자적(Atomic)으로 기존 키를 임시 키로 덮어쓰기 실시 (O(1))
   redisTemplate.rename(tempGlobalKey, "daypoo:rankings:global");
}
```

---

## 3. 핵심 Redis 명령어 분석 및 벤치마크
Java의 `StringRedisTemplate`을 이용해 내부적으로 처리되는 메인 Redis Command와 성능 복잡도입니다. Sorted Set은 내부적으로 **Skip List**와 **Hash Table**로 구현되어 있어 삽입 및 조회 성능이 극대화됩니다.

| Spring Data API | 동작 대상 (Redis 명령) | 시간 복잡도 | 용도 |
| :--- | :--- | :--- | :--- |
| `opsForZSet().add()` | `ZADD key score member` | **O(log N)** | 랭킹 업데이트 및 사용자 추가 |
| `opsForZSet().reverseRangeWithScores()` | `ZREVRANGE key start stop WITHSCORES` | **O(log N + M)** | 상위 N명의 랭커 조회 (Top 10) |
| `opsForZSet().reverseRank()` | `ZREVRANK key member` | **O(log N)** | 나의 현재 순위(등수) 조회 |
| `opsForZSet().score()` | `ZSCORE key member` | **O(1)** | 특정 사용자의 현재 랭킹 점수 조회 |
| `opsForValue().setIfAbsent()` | `SETNX key value` | **O(1)** | 분산 환경에서 다중 스케줄러 실행 시 경쟁 조건 제어 락(Lock) |
| `rename()` | `RENAME oldkey newkey` | **O(1)** | 무중단 랭킹 교체 |

---

> [!TIP] 랭킹 설계 핵심
> **배치(Batch) 연산과 RENAME의 활용**
> Redis에서 가장 치명적인 것은 긴 수행시간을 가지며 싱글 스레드를 멈추게 하는 연산입니다. 실시간으로 점수를 `ZADD`로 반영하면서도 매일 새벽 전체 데이터를 `Atomic Rename` 기법으로 덮어씀으로서 정합성 오류를 자가 복구하는 훌륭한 아키텍처를 구성했습니다.

