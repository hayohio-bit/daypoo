# 섹션 5: DiceBear 아바타 연동 및 렌더링 성능 최적화

현재 프로젝트의 `avatar.ts`는 `@dicebear/core`와 **5종의 스타일 컬렉션**(`funEmoji`, `avataaars`, `bottts`, `lorelei`, `pixelArt`)을 활용하여 유저별 고유 아바타를 동적으로 생성합니다.

---

## 1. 5종 스타일 매핑 메커니즘
`useRankings` 및 랭킹 페이지에서는 서버에서 준 `equippedAvatarUrl` (예: `dicebear:bottts:seed123`) 파싱 로직을 타서 SVG 기반 Data URI를 추출합니다.

```ts
// avatar.ts 
import { createAvatar } from '@dicebear/core';
import { funEmoji, avataaars, bottts, lorelei, pixelArt } from '@dicebear/collection';

export const parseDicebearUrl = (imageUrl: string, fallbackId: number) => {
  if (imageUrl && imageUrl.startsWith('dicebear:')) {
    const parts = imageUrl.split(':');
    const styleStr = parts[1]; // e.g., 'bottts'
    const seed = parts[2];
    
    // 5종 컬렉션에 대한 스위치 처리
    const collection = styleStr === 'bottts' ? bottts : 
                       styleStr === 'pixelArt' ? pixelArt : funEmoji;

    return createAvatar(collection, { seed }).toDataUri();
  }
  // ... 생략
};
```

## 2. 대량 데이터 렌더링 시 브라우저 메인 스레드 병목 문제
`createAvatar(...).toDataUri()`는 단순한 문자열 조합이 아니라, 내부적으로 수십 개의 SVG Path를 복잡하게 연산하여 베이스64로 인코딩하는 꽤나 무거운 **동기(Synchronous)** 함수입니다. 랭킹 1위부터 100위까지 스크롤 시 한 번에 호출되면 브라우저 화면이 멈추거나 터치가 씹히는 'Jank' 현상이 초래됩니다.

### 리팩토링 해결책: Windowing (가상 리스트) + 메모이제이션
- **Windowing 도입 방안:** `react-window` 라이브러리를 통해 화면 뷰포트에 보이는 (예: Top 20) 명의 아바타만 생성하고 렌더링되게 합니다.
- **이미지 캐싱 보강 방안:** 한 번 계산된 Data URI를 브라우저 캐시(전역 메모리 또는 Map 객체)에 담아둡니다 (`memoization`).

```tsx
// 아바타 렌더링 최적화를 위한 Wrapper 제안
import React, { useMemo } from 'react';

const OptimizedAvatar = React.memo(({ url, userId }: { url: string, userId: number }) => {
  const finalSrc = useMemo(() => {
    // 내부 연산을 최초 컴포넌트 렌더때 단 한 번만 수행함.
    return generateRankingAvatar(userId, 0, url);
  }, [url, userId]);

  return <img src={finalSrc} alt="avatar" loading="lazy" />;
});
```

---

> [!WARNING] Refactoring Point
> **보이지 않는 자원(Main Thread) 아껴쓰기**
> 프론트엔드는 자원이 무한대가 아닙니다. 화려한 5종 다이스베어 아바타는 강렬한 시각적 효과를 주지만 반대로 수많은 DOM 노드(혹은 엄청 긴 SVG 문자열)를 만듭니다. `Intersection Observer` 훅을 통해 화면에 아바타가 노출될 때만 SVG 연산을 시작하는 **지연 로딩(Lazy Hashing) 전략**을 도입해야 거대한 1,000명 단위 랭킹 시스템을 무사주행할 수 있습니다.
