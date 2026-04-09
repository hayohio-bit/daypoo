# 섹션 3: RankingController API 엔드포인트 설계

`RankingController`는 클라이언트에게 랭킹 데이터를 응답해 주는 관문입니다. 프론트엔드 환경에서 한 번의 API 호출로 **"상위 TOP 10 랭커 정보"**와 **"나의 랭킹 정보"**를 패키징하여 제공함으로써 불필요한 네트워크 송수신을 최적화하고 있습니다.

## 1. REST 엔드포인트 목록
Spring Boot 컨트롤러에 정의된 주요 엔드포인트는 아래와 같습니다. 사용자의 인증 정보(`@AuthenticationPrincipal`)가 있을 경우 내 랭킹 정보도 포함해서 반환합니다.

```http
GET /api/v1/rankings/global
GET /api/v1/rankings/health
GET /api/v1/rankings/region?regionName={지역명}
```

## 2. 응답 DTO 설계
단일 랭킹 페이지 접근 시 필요한 모든 데이터를 한 번에 담아 내리는 형태의 DTO 구성을 채택했습니다.

```json
{
  "activeUserCount": 1520,  // 해당 랭킹에 등록된 총 활성 유저 수
  "topRankers": [           // 랭킹 1위 ~ 10위 정보
    {
      "userId": 105,
      "nickname": "배변왕오도독",
      "titleName": "골드푸퍼",
      "level": 12,
      "score": 35.5,
      "rank": 1,
      "equippedAvatarUrl": "/images/avatars/golden.png",
      "equippedItems": [ ... ]
    }
  ],
  "myRank": {               // 현재 로그인한 사용자의 랭킹 정보 (비로그인시 null)
    "userId": 42,
    "nickname": "쾌변요정",
    ...
    "rank": 402
  }
}
```

---

## 3. N+1 문제 해결 및 일괄 조회(Batch) 최적화
단순히 Redis에서 랭킹(Top 10 유저 ID)을 꺼내온 후 각각 DB를 조회하면, **Top 10에 대해 10회, 칭호 조회를 위해 10회, 인벤토리를 위해 10회 DB 쿼리가 발생하는 N+1 문제**가 발생합니다. `RankingService.getRankingFromRedis`는 이 문제를 일괄 IN 연산으로 회피하고 매핑합니다.

```java
// Redis에서 Top 10의 데이터를 가져옴 (점수와 User ID 목록 획득)
Set<ZSetOperations.TypedTuple<String>> topRankersRaw = redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, 9);
List<Long> userIds = topRankersRaw.stream().map(...).collect(Collectors.toList());

// 1. 유저 정보 일괄 조회
List<User> users = userRepository.findAllById(userIds);

// 2. 장착된 칭호 일괄 조회 
Set<Long> titleIds = users.stream().map(User::getEquippedTitleId).collect(Collectors.toSet());
Map<Long, String> titleMap = titleRepository.findAllById(titleIds).stream()
    .collect(Collectors.toMap(Title::getId, Title::getName));

// 3. 인벤토리(아바타 등) 일괄 조회
List<EquippedItemResponse> equippedItems = inventoryRepository.findEquippedByUserIn(users);
```

---

> [!IMPORTANT] 랭킹 설계 핵심
> **응답 지연 최소성 (Low Latency)**
> 캐시(Redis)에서는 O(log N) 속도로 빠르게 ID와 Score를 추출하고, MySQL 등 RDBMS는 `IN (?)` 절을 이용해 관련된 모든 부가정보를 메모리로 퍼올린 뒤 조립(Assemble)합니다. 서비스 로직이 다소 길어지더라도 데이터베이스 커넥션과 쿼리 개수를 비약적으로 축소하여 네트워크 오버헤드를 막는 시니어 급의 필수 설계 패턴입니다.

