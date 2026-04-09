# 섹션 3: 공통 DataTable 컴포넌트 아키텍처 제언

**[정합성 검증 완료 사항]**
> `AdminPage.tsx` 내부를 확인한 결과, 제네릭(`T`)을 사용한 완벽하게 추상화된 공통 `DataTable` 컴포넌트는 아직 분리되지 않았으며, `UsersTab`, `ToiletsTab` 탭들에서 `<table>...</table>` 마크업이 독립적으로 각각 6번 이상 인라인 반복 구현되고 있습니다. 
> 향후 관리자 시스템 고도화를 위해 기획하셨던 **공통 DataTable** 컴포넌트로의 마이그레이션을 제안합니다.

## 1. 현재의 인라인 Table 사용 패턴 파악

지금은 데이터를 받아와 직접 Map을 순회하며 일일이 TR, TD를 렌더링하고 있습니다.
```tsx
// 현재 UsersTab 내부의 구현 파편화 (코드 중복 발생)
<div className="overflow-x-auto">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="border-b">
        <th className="p-4 text-xs font-bold ...">유저정보</th>
        <th className="p-4 text-xs font-bold ...">권한</th>
        {/* ... */}
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
         <tr key={user.id} className="border-b hover:bg-black/[0.02]">
           <td className="p-4">{user.email}</td>
           {/* ... */}
         </tr>
      ))}
    </tbody>
  </table>
</div>
```

## 2. [도입 제언] 제네릭 기반 `DataTable<T>` 컴포넌트 설계

테이블 UI의 통일성 및 페이징, 검색 모듈의 중복 작성을 피하기 위해 사용자가 제시한 `ColumnDef<T>` 방식을 독립 파일(`frontend/src/components/admin/DataTable.tsx`)로 생성해야 합니다.

```tsx
import React from 'react';

// 제네릭 T를 받아 자유자재로 타입 바인딩
export interface ColumnDef<T> {
  header: string;
  accessor: keyof T;
  width?: string;
  // 컴포넌트 렌더링이 필요한 셀 (ex: 아바타 이미지, 버튼)
  cell?: (item: T) => React.ReactNode; 
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  // 페이지네이션
  pagination: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  };
  isLoading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data, columns, searchPlaceholder, pagination, onSearch, isLoading
}: DataTableProps<T>) {

  // ... (디바운스 검색바 구현부)
  
  return (
    <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden">
        {/* 헤더 검색 영역 */}
        {/* 실제 테이블 영역 반복문 단 1회 작성 */}
        <table className="w-full text-left">
           <thead>
             <tr>
               {columns.map((col, idx) => <th key={idx}>{col.header}</th>)}
             </tr>
           </thead>
           <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  {columns.map((col, idx) => (
                    <td key={idx}>
                      {col.cell ? col.cell(item) : String(item[col.accessor])}
                    </td>
                  ))}
                </tr>
              ))}
           </tbody>
        </table>
        {/* Pagination 영역 */}
    </div>
  );
}
```

> [!TIP] 성능 팁
> 테이블 셀 안에서 함수가 빈번하게 호출되는 Cell Renderer를 방어하기 위해 React 19의 `useMemo` 등을 묶어서 `<DataTable>` 자체를 Memoization 해야 리렌더링 폭풍을 피할 수 있습니다.
