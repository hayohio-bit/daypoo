# 섹션 4: Framer Motion 랭킹 애니메이션 효과

DayPoo 프로젝트는 이미 `RankAvatarEffect`나 `FlipGlassCard`와 같은 고난도 물리 기반(Spring) 애니메이션을 `Framer Motion`을 통해 적극적으로 활용하고 있습니다. 데이터 구조가 변할 때 리팩토링 과정에서 UI가 딱딱하게 끊기지 않고 부드럽게 이어지도록 하는(Shared Element Transition) 핵심 로직을 분석합니다.

---

## 1. 탭 전환 시 매끄러운 잉크 효과 (`layoutId`)

전체, 우리동네, 건강왕 탭을 누를 때 뚝뚝 끊기는 느낌을 최소화하기 위해서는 배경 요소가 미끄러지듯 이동해야 합니다. Framer Motion의 강력한 기능인 `layoutId`를 활용합니다. React 트리 내에서 완전히 다른 위치에 있더라도 같은 `layoutId`를 가진 요소는 브라우저 엔진이 자체 보간 연산을 통해 부드럽게 이어줍니다.

```tsx
// 탭 버튼 컴포넌트 내부 예시
<button
  onClick={() => setTab(t.key)}
  className="flex-1 py-3 rounded-xl relative"
>
  {/* 선택된 탭일 때만 아래 Background가 마운트됨 */}
  {tab === t.key && (
    <motion.div
      layoutId="activeTabBackground" // 다른 탭으로 바뀔 때 마치 이동하는 듯한 효과 부여
      className="absolute inset-0 bg-[#E8A838] rounded-xl shadow-lg"
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
    />
  )}
  <span className="relative z-10">{t.label}</span>
</button>
```

## 2. 랭킹 리스트 순차 파도 타기 (`staggerChildren` / `AnimatePresence`)
RTK Query로 100명의 데이터를 가져온 뒤, 한 번에 렌더링하면 화면이 버벅일 수 있습니다. 순차적으로 위에서 아래로 떨어지게 하여 시각적인 체감 로딩 속도를 줄입니다.

```tsx
// RankingListContainer.tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }, // 내부 자식들이 0.05초 간격으로 연속 등장
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } },
};

return (
  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-2">
    <AnimatePresence>
      {users.map(user => (
        <motion.div key={user.userId} variants={itemVariants} exit={{ opacity: 0, scale: 0.9 }}>
          <RankItem user={user} />
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
);
```

---

> [!TIP] Refactoring Point
> **시각적 영속성 확보 (Visual Continuity)**
> RTK Query를 통해 데이터가 폴링(새로고침)되면서, 내가 5위에서 4위로 올라갔을 때 텍스트만 틱 하고 바뀌면 유저는 이를 인지하기 어렵습니다. 만약 Array Sort 로직을 통해 아이템의 `key`가 유지된 채 Data Order만 교체된다면, `Framer Motion`의 `layout` 속성을 줄당(row) 적용하여 카드가 물리적으로 한 칸 올라가는 애니메이션을 손쉽게 달성할 수 있습니다.
