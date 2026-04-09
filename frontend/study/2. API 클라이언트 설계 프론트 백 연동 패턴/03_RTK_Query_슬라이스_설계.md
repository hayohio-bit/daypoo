# 03. RTK Query 슬라이스 설계

> **현재 상태**: `@reduxjs/toolkit` 미설치 — `useState + fetch` 패턴 사용 중  
> 이 문서는 RTK Query가 무엇인지, 언제 도입하면 좋은지를 학습합니다.

---

## 현재 방식 vs RTK Query

| 항목 | 현재 (fetch + useState) | RTK Query |
| --- | --- | --- |
| 로딩/에러 상태 | 수동 `useState` 3개 | 자동 `isLoading`, `isError` |
| 캐싱 | 없음 (탭 전환마다 재요청) | 자동 캐시 (60초 기본) |
| 캐시 무효화 | 수동 `refetch()` 호출 | `invalidatesTags` 자동 처리 |
| 낙관적 업데이트 | 직접 구현 | `onQueryStarted` 내장 |
| Polling | `setInterval` 수동 관리 | `pollingInterval: 5000` 1줄 |
| 번들 크기 | 0KB 추가 | +47KB |
| **도입 시점** | **현재 규모로 충분** | **실시간 데이터·공유 캐시 필요 시** |

### 도입을 권장하는 시점

- 알림 미읽음 수를 **N초마다 polling**해야 할 때
- 랭킹·알림 데이터를 **여러 컴포넌트가 공유 캐시**로 쓸 때
- 아이템 구매 후 **인벤토리·포인트 자동 갱신**이 필요할 때

---

## 설치 및 기본 설정

```bash
npm install @reduxjs/toolkit react-redux
```

```typescript
// frontend/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';

export const store = configureStore({
  reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
  // RTK Query 미들웨어 필수 (캐시·폴링·무효화 동작)
  middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
});
```

```tsx
// frontend/src/main.tsx — Provider로 앱 감싸기
import { Provider } from 'react-redux';
import { store } from './store';

<Provider store={store}><App /></Provider>
```

---

## apiSlice.ts 핵심 구조

```typescript
// frontend/src/store/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',

  // ── baseQuery: 공통 헤더 설정 (apiClient.ts의 request()와 동일 역할) ──
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  // ── tagTypes: 캐시 그룹 이름 (잘못 설계하면 불필요한 재요청 발생) ─────
  tagTypes: ['Ranking', 'Notification', 'PooRecord', 'User', 'Shop', 'Admin'],

  endpoints: (builder) => ({

    // ── Query: 데이터 읽기 ───────────────────────────────────────────
    getGlobalRanking: builder.query<RankingResponse, void>({
      query: () => '/rankings/global',
      providesTags: ['Ranking'], // 이 데이터가 'Ranking' 태그에 속함
    }),

    // ── Polling 예시: 5초마다 자동 재요청 ───────────────────────────
    getNotifications: builder.query<NotificationDto[], void>({
      query: () => '/notifications',
      providesTags: ['Notification'],
      // 컴포넌트에서: useGetNotificationsQuery(undefined, { pollingInterval: 5000 })
    }),

    // ── Mutation + invalidation: 수정 후 관련 캐시 자동 갱신 ─────────
    createRecord: builder.mutation<PooRecordResponse, CreateRecordRequest>({
      query: (body) => ({ url: '/records', method: 'POST', body }),
      // 기록 생성 후 기록 목록 + 랭킹 캐시를 무효화 → 자동 재요청
      invalidatesTags: ['PooRecord', 'Ranking'],

      // ── Optimistic Update: 서버 응답 전에 UI 먼저 업데이트 ──────────
      async onQueryStarted(newRecord, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          apiSlice.util.updateQueryData('getMyRecords', undefined, (draft) => {
            draft.unshift({ id: -1, ...newRecord, createdAt: new Date().toISOString() });
          })
        );
        try {
          await queryFulfilled; // 서버 응답 성공 → invalidatesTags가 실제 데이터로 교체
        } catch {
          patch.undo(); // 서버 응답 실패 → 낙관적 업데이트 롤백
        }
      },
    }),

    // ── 세밀한 invalidation: 전체 Shop이 아닌 INVENTORY만 갱신 ───────
    purchaseItem: builder.mutation<void, { itemId: number }>({
      query: (body) => ({ url: '/shop/purchase', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Shop', id: 'INVENTORY' }, // getInventory만 재요청
        'User',                             // 포인트 잔액 갱신
        // 'Shop' 전체를 무효화하면 getShopItems도 재요청 → 불필요
      ],
    }),
  }),
});

// RTK Query가 자동 생성하는 훅들
export const {
  useGetGlobalRankingQuery,
  useGetNotificationsQuery,
  useCreateRecordMutation,
  usePurchaseItemMutation,
} = apiSlice;
```

---

## 실제 사용 예시

```tsx
// ── Polling으로 미읽음 수 실시간 갱신 ────────────────────────────
function NotificationBadge() {
  const { data } = useGetNotificationsQuery(undefined, {
    pollingInterval: 5000, // 5초마다 자동 재요청 (setInterval 불필요)
  });
  return <span>{data?.filter(n => !n.isRead).length ?? 0}</span>;
}

// ── Mutation 후 자동 캐시 갱신 ───────────────────────────────────
function RecordButton() {
  const [createRecord, { isLoading }] = useCreateRecordMutation();

  const handleSubmit = async (data: CreateRecordRequest) => {
    await createRecord(data).unwrap();
    // invalidatesTags: ['PooRecord', 'Ranking'] 자동 실행
    // → refetch() 코드 없이 목록 + 랭킹 자동 갱신
  };
}
```

---

## 체크리스트

| 항목 | 현황 |
| --- | --- |
| `@reduxjs/toolkit` 설치 | ⬜ 미설치 |
| `Provider`로 앱 감싸기 | ⬜ main.tsx 수정 필요 |
| `tagTypes` 정의 | ⬜ apiSlice.ts 신규 작성 필요 |
| 알림 polling 동작 | ⬜ pollingInterval 설정 필요 |
| Optimistic Update 구현 | ⬜ onQueryStarted 구현 필요 |
