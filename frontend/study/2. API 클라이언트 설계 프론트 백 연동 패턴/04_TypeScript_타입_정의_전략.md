# 04. TypeScript 타입 정의 전략

> **파일 위치**: `frontend/src/types/` (4개 파일)  
> 백엔드 Java DTO를 TypeScript 타입으로 수동 관리하는 방법 학습

---

## 타입 파일 구조

```text
frontend/src/types/
├── api.ts          ← 공통 + 주요 도메인 (ApiResponse<T>, UserResponse, NotificationDto 등)
├── admin.ts        ← 관리자 전용 (PageResponse<T>, AdminStatsResponse 등)
├── subscription.ts ← 구독·결제 관련
└── toilet.ts       ← 화장실·지도 관련
```

---

## Java → TypeScript 타입 변환 규칙

| Java | TypeScript | 예시 |
| --- | --- | --- |
| `String` | `string` | `email: string` |
| `Integer` / `Long` | `number` | `id: number` |
| `Boolean` | `boolean` | `isRead: boolean` |
| `LocalDateTime` | `string` (ISO 8601) | `createdAt: string` |
| `List<T>` | `T[]` | `tags: string[]` |
| `Map<K,V>` | `Record<K,V>` | `visitCounts: Record<number, number>` |
| `Optional<T>` | `T \| null` | `titleName: string \| null` |
| Java `enum` | Union Type | `'BASIC' \| 'PRO' \| 'PREMIUM'` |
| `Page<T>` (Spring) | `PageResponse<T>` | (아래 참고) |
| `void` | `void` | 응답 없는 mutation |

---

## 핵심 타입 주석 해설

```typescript
// ── ApiResponse<T>: 백엔드 공통 응답 래퍼 ────────────────────────
// 백엔드: { data: T, message: '...' } 형태로 응답
// apiClient.ts가 .data를 자동 언박싱하므로 서비스 함수에서 직접 쓸 일은 거의 없음
export interface ApiResponse<T> {
  data: T;
  message?: string;
  code?: string;    // 백엔드 ErrorCode enum 값 (에러 시 활용)
}

// ── PageResponse<T>: Spring Page<T> 응답 구조 매핑 ───────────────
// 사용 예: GET /admin/users?page=0&size=20 → PageResponse<AdminUserListResponse>
export interface PageResponse<T> {
  content: T[];          // 현재 페이지 데이터
  totalElements: number; // 전체 항목 수 (페이지네이션 UI에 사용)
  totalPages: number;
  size: number;
  number: number;        // 현재 페이지 번호 (0-based)
  first: boolean;
  last: boolean;
}

// ── HealthRecordRequest: V27 마이그레이션 이후 toiletId 선택적 ────
// 이유: 화장실 없는 장소에서도 건강 기록 가능하도록 변경됨
export interface HealthRecordRequest {
  toiletId?: number;     // optional (V27 이후)
  bristolScale?: number; // 미입력 시 AI 분석으로 자동 감지
  conditionTags: string[];
  dietTags: string[];
  imageBase64?: string;  // 전송 후 서버에서 즉시 폐기, DB 미저장
}
```

---

## Enum 타입 2가지 패턴

```typescript
// ── 패턴 1: Union Type (현재 사용 중) ────────────────────────────
export type SubscriptionPlan = 'BASIC' | 'PRO' | 'PREMIUM';
// 단점: 값 목록을 배열로 순회하거나 label 매핑이 번거로움

// ── 패턴 2: const 객체 + typeof (권장) ───────────────────────────
export const SubscriptionPlan = {
  BASIC: 'BASIC',
  PRO: 'PRO',
  PREMIUM: 'PREMIUM',
} as const;
export type SubscriptionPlan = typeof SubscriptionPlan[keyof typeof SubscriptionPlan];

// 장점: 배열 순회 + label 맵 모두 가능
const options = Object.values(SubscriptionPlan); // ['BASIC', 'PRO', 'PREMIUM']
const labels: Record<SubscriptionPlan, string> = {
  BASIC: '무료', PRO: '프로', PREMIUM: '프리미엄',
};
```

> **현재 프로젝트 Role enum 실제 값**: `ROLE_USER | ROLE_PRO | ROLE_PREMIUM | ROLE_ADMIN` (4개)  
> study 파일 일부에 USER/ADMIN 2개로 잘못 기재된 부분 있음 — 실제 `Role.java` 기준으로 작성

---

## 날짜 처리 유틸리티

```typescript
// 백엔드: "2026-04-07T09:30:00" (LocalDateTime → ISO 8601 문자열)
// 프론트 타입: createdAt: string  ← Date 객체가 아닌 string으로 받는 이유:
//   JSON 직렬화 시 Date는 문자열로 변환되며, 타임존 처리 복잡도 증가

// ReviewListModal.tsx에서 현재 사용 중인 유틸 패턴
export function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays  = Math.floor(diffMs / 86_400_000);

  if (diffHours < 1)  return '방금 전';
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7)   return `${diffDays}일 전`;
  return new Date(isoString).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}
// 개선: utils/date.ts로 분리 시 여러 컴포넌트에서 재사용 가능
```

---

## 새 DTO 추가 워크플로우

```text
1. 백엔드 DTO 확인
   backend/src/main/java/com/daypoo/api/dto/SomethingResponse.java

2. 어느 types/ 파일에 넣을지 결정
   공통/유저/알림/기록 → api.ts
   관리자 → admin.ts  /  결제·구독 → subscription.ts  /  화장실·지도 → toilet.ts

3. TypeScript interface 작성 (Java camelCase 그대로 사용)
   Optional 필드: ?  또는  | null

4. 서비스 파일 반환 타입 업데이트
   async function getSomething(): Promise<SomethingResponse>
```

---

## 체크리스트

| 항목 | 현황 |
| --- | --- |
| `ApiResponse<T>` 공통 래퍼 | ✅ `api.ts` |
| `PageResponse<T>` 페이징 타입 | ✅ `admin.ts` |
| 날짜 필드가 `string` (ISO 8601) | ✅ `createdAt: string` |
| `toiletId?: number` V27 이후 optional | ✅ `HealthRecordRequest` |
| Role enum 4개 값 반영 | ⬜ `admin.ts`에서 ROLE_PRO, ROLE_PREMIUM 추가 확인 |
| Enum const 객체 패턴 적용 | ⬜ 리팩토링 검토 |
| 날짜 유틸 `utils/date.ts` 분리 | ⬜ 검토 |
