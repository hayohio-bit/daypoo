# 섹션 3: Recharts 데이터 시각화 상세 구현

현재 프로젝트 랭킹 탭은 **포디움(Top 3) 기반의 카드 UI**와 **수직 나열된 리스트 UI**로만 순위를 표현하고 있습니다. (현재 Recharts는 설치되어 있으나 랭킹 페이지 병합 전).
사용자들이 "내 점수가 1등과 얼마나 차이나는지?" 혹은 "내 점수가 최근 얼마나 올랐는지?"를 한눈에 파악하기 위해서는 시각적 위젯(Chart) 도입이 필수적입니다.

---

## 1. 수평(Horizontal) BarChart 컴포넌트 설계

사용자의 점수 격차를 렌더링하기 위해 d3 기반의 `Recharts` 라이브러리를 활용합니다.

```tsx
// src/components/ranking/RankingTrendChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  nick: string;
  score: number;
}

export function RankingTrendChart({ data }: { data: ChartData[] }) {
  // 1, 2, 3위에 별도 색상을 입히기 위한 분기
  const getColor = (index: number) => {
    if (index === 0) return '#E8A838'; // Gold
    if (index === 1) return '#B0B8B4'; // Silver
    if (index === 2) return '#CD7C4A'; // Bronze
    return '#52B788'; // Emerald Default
  };

  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-[24px] shadow-sm mt-6">
      <h3 className="text-sm font-black mb-4 text-[#1A2B27]">상위 랭크 점수 스펙트럼</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical" // 누워있는 수평 바 차트
          data={data.slice(0, 10)} // Top 10명만
          margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="nick" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 12, fontWeight: 800, fill: '#6B7280' }} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
          />
          <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={16}>
            {data.slice(0, 10).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## 2. 렌더링 매커니즘: SVG vs Canvas
Recharts는 내부적으로 SVG를 렌더링합니다. 
React 노드로써 `div`를 그리는 기존 리스트 방식(`RankItem.tsx`)보다 기하학 도형 렌더링에 특화되어 브라우저 Layout 단계를 최소화하고 화면 전환 퍼포먼스가 더 뛰어납니다. (대량 데이터의 경우 Canvas를 사용하는 라이브러리를 써야 하지만 10~20명 단위에서는 Recharts의 SVG 성능이 압도적입니다).

---

> [!TIP] Refactoring Point
> **DOM 부하 감소 및 시각적 피드백 제공 (Retention Growth)**
> 텍스트 1,000점과 100점을 비교하는 것보다 바(Bar)의 길이가 10배 차이나는 것을 보는 것이 인간의 경쟁심리를 더 효과적으로 자극합니다. `Recharts`를 통한 "내 위치(My Score Point)" 핀 찍기 기능을 응용하면 앱 방문 지속 시간(Retention) 향상에 매우 큰 도움을 줄 수 있습니다.
