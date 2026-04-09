# 섹션 2: RTK Query 도입 및 마이그레이션 설계

현재 DayPoo 서비스는 `useRankings.ts` 내부에서 `useState`, `useCallback`, `fetch(axios)`를 수동으로 조합하여 데이터를 가져옵니다. 
데이터가 한 번 캐싱되지 않기 때문에 **"전체 랭킹 탭 → 우리동네 탭 → 전체 랭킹 탭"** 으로 돌아오면 동일한 백엔드 API를 매번 새롭게 호출해야 하는 막대한 **네트워크/서버 비용 낭비**가 발생하고 있습니다. 이를 해결하기 위해 강력한 상태 관리자인 `RTK Query` 도입을 설계합니다.

---

## 1. RTK Query `createApi` 슬라이스 구현 (TypeScript)

Redux-Toolkit 내장의 RTK Query를 사용하여 자동 캐시 무효화 및 폴링(Polling) 기능까지 단 몇 줄로 구현할 수 있습니다.

```tsx
// src/services/rankingApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const rankingApi = createApi({
  reducerPath: 'rankingApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      // JWT 토큰 주입 로직
      const token = (getState() as any).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  // 캐시 태그 지정: 이 태그를 무효화(invalidate)하면 관련 데이터가 갱신됩니다.
  tagTypes: ['Ranking'], 
  endpoints: (builder) => ({
    getGlobalRankings: builder.query<RankingResponse, void>({
      query: () => '/rankings/global',
      providesTags: ['Ranking'],
      // 5분(300,000ms)에 한 번씩 백그라운드 자동 새로고침(실시간성 부여)
      pollingInterval: 300000, 
    }),
    getRegionRankings: builder.query<RankingResponse, string>({
      query: (regionName) => `/rankings/region?regionName=${encodeURIComponent(regionName)}`,
      providesTags: (result, error, arg) => [{ type: 'Ranking', id: arg }],
    }),
  }),
});

// React Hooks 자동 생성
export const { useGetGlobalRankingsQuery, useGetRegionRankingsQuery } = rankingApi;
```

---

## 2. Legacy vs RTK Query (사용성 비교)

컴포넌트 내에서의 호출 방식이 크게 달라지며, 보일러플레이트 코드를 파괴적으로 줄일 수 있습니다.

### Before: 현재의 `useState` + `fetch` 방식
```tsx
const { data, loading, error, refetch } = useRankings(tab, regionName);
// - 캐싱이 전혀 되지 않음. (탭 바꿀 때마다 Loading 노출)
// - 전역 상태가 아니므로 컴포넌트가 언마운트되면 데이터 폭파.
```

### After: `RTK Query` 방식
```tsx
const { data, isLoading, isFetching } = useGetGlobalRankingsQuery(undefined, {
  // 이미 캐시된 데이터가 있다면 즉각 렌더링하고, 뒤에서 백그라운드 업데이트 수행!
  refetchOnMountOrArgChange: true, 
});
```

---

> [!IMPORTANT] Refactoring Point
> **선언적 페칭(Declarative Fetching)과 자동 캐싱**
> 기존에는 "어떻게 데이터를 가공하고", "언제 에러 상태를 바꿀지(명령형)" 개발자가 모두 통제했습니다. RTK Query로 넘어가면 "이 API 주소에서 데이터를 가져와 캐시에 저장해라(선언형)" 로 관점이 바뀝니다. 특히 **`pollingInterval`** 을 통해 브라우저 포커스 시 실시간 랭킹을 다시 받아오는 UX는 서비스 품질을 극도로 끌어올립니다.
