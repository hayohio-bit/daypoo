# 섹션 6: 관리자 RTK Query 슬라이스 검토 및 마이그레이션 방안

**[정합성 검증 완료 사항]**
> `package.json` 검사 결과 `@reduxjs/toolkit` (RTK Query)는 **프로젝트에 완전히 설치되어 있지 않으며 미사용 중**입니다. 
> 현재 `AdminPage.tsx` 상단에서는 순수 커스텀 Axios 래퍼인 `api.get('/api/v1/admin/...')` 와 `useEffect` 기반으로 스테이트를 페인팅하고 있습니다. 

## 1. 현재의 순수 Axios 기반 패칭 로직의 한계

```tsx
// AdminPage.tsx 상단의 현행 페칭 코드 (수 백 라인의 useEffect가 반복됨)
useEffect(() => {
  if (activeTab === 'dashboard') {
     fetchStats();
     fetchLogs();
  } else if (activeTab === 'users') {
     fetchUsers();
  }
  // ... 모든 탭마다 수동 호출 및 loading State 관리 지옥 발생
}, [activeTab]);

const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/api/v1/admin/users', { 
         params: { search, role: roleFilter, page, size } 
      });
      setUsers(data.content);
      // 토탈 페이징 따로 계산...
    } catch(err) { /*...*/ }
    setLoadingUsers(false);
}
```

탭이 바뀔 때마다 다시 로딩이 도는 문제 (캐싱이 전혀 안 됨), 수정 사항 발생 후 `List`를 수동으로 리패치하는 번거로움이 산재해 있습니다. 

## 2. [도입 제언] adminApi.ts (RTK Query API Slice) 아키텍처

위 문제를 단번에 해결할 Redux Toolkit Query 구조를 제안합니다. 터미널 명령 `npm i @reduxjs/toolkit react-redux`이 우선 선행되어야 합니다.

```ts
// frontend/src/services/adminApi.ts 방안
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  // 중요: 캐싱 무효화 트리거들을 정의
  tagTypes: ['AdminUsers', 'AdminToilets', 'AdminItems', 'AdminTitles', 'AdminInquiries', 'DashboardStats'],
  
  endpoints: (builder) => ({
    // 1. 대시보드 페칭 (1분 마다 폴링)
    getDashboardStats: builder.query<AdminStatsResponse, void>({
      query: () => '/api/v1/admin/stats',
      providesTags: ['DashboardStats'],
    }),

    // 2. 검색 및 필터를 객체로 받아 직렬화
    getUsers: builder.query<PageResponse<AdminUserListResponse>, { search?: string; role?: string; page: number }>({
      query: (arg) => ({
         url: '/api/v1/admin/users',
         params: arg
      }),
      providesTags: ['AdminUsers'],
    }),

    // 3. Mutation (조작) 호출: 해당 행위 즉시 관련된 List Tags 만료 -> 리패치 자동수행
    updateUserRole: builder.mutation<void, { id: number; role: string }>({
      query: ({ id, role }) => ({
        url: `/api/v1/admin/users/${id}/role`,
        method: 'PATCH',
        body: { role }
      }),
      // 역할이 변하면 관리자 유저리스트와 대시보드 통계 수치가 바뀔 수 있음
      invalidatesTags: ['AdminUsers', 'DashboardStats'], 
    }),
  }),
});

// React Hook 자동 생성 추출
export const { 
  useGetDashboardStatsQuery, 
  useGetUsersQuery, 
  useUpdateUserRoleMutation 
} = adminApi;
```
위처럼 변경할 시 프론트엔드의 비즈니스 로직(약 1,000라인)을 슬라이스 단 한 장으로 증발시킬 수 있습니다.
