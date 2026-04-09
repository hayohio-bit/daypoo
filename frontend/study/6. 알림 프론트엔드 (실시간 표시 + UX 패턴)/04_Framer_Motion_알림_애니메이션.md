# 섹션 4: Framer Motion 알림 애니메이션

**[정합성 검증 완료 사항]**
> DayPoo 프로젝트는 UI의 역동성을 극대화하기 위해 `framer-motion` 패키지를 알림 영역 전역에 걸쳐 사용 중입니다. 사용자가 제시한 드래그 제스처(`onDragEnd`)는 현재 코드에 없으나, `y: 100` 기반의 Toast 슬라이드-업 애니메이션과 자동 삭제 트랜지션이 설계되어 있음을 확인했습니다.

## 1. Toast 팝업 애니메이션 (NotificationToast.tsx)

화면 우측 하단에서 튀어오르는 물리 엔진(Spring) 기반의 움직임이며, 5초 동안 프로그래스 바(Progress Bar)가 줄어드는 인디케이터가 매력적입니다.

```tsx
import { motion } from 'framer-motion';

export function NotificationToast({ type, title, message, icon, onClose }) {
  // ...아이콘 결정 로직
  
  return (
    <motion.div
      layout // Toast 큐(Queue)에서 알림 삭제 시 위아래 빈 공간을 부드럽게 메꿔주는 핵심 속성
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, x: -50 }} // 왼쪽으로 스르륵 사라짐
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        mass: 1 
      }}
      className="relative flex items-center bg-white/95 backdrop-blur-md p-4 rounded-[24px]"
    >
      {/* 5초 수명을 시각화하는 자동 축소 프로그래스 바 (Linear 애니메이션) */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }} // Context의 5초 TTL과 박자 맞춤
        className="absolute bottom-0 left-0 h-0.5 bg-gray-100 group-hover:bg-emerald-500/20"
      />
      {/* Content ... */}
    </motion.div>
  );
}
```

## 2. NotificationPanel 드롭다운 및 리스트 트랜지션

NotificationPanel 내부에서도 `AnimatePresence`를 통해 탭(Tap)과 리스트 스크롤에 심미성을 더했습니다. 패널 자체가 화면 밖에서 밀려들어오게 합니다.

```tsx
// 1. 패널 자체 등장 애니메이션
<motion.div
  initial={{ x: '100%', opacity: 0 }} // 우측 화면 밖에서
  animate={{ x: 0, opacity: 1 }}      // 화면 안으로
  exit={{ x: '100%', opacity: 0 }}
  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
  className="fixed top-0 right-0 z-[2001] w-full max-w-[420px] h-full ..."
>

// 2. 알림 아이템 시퀀스 드롭 효과 (stagger 대체)
<div className="space-y-3">
  {filteredNotifications.map((n, index) => (
    <motion.div
      key={n.id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ delay: index * 0.05 }} // delay를 인덱스 배수로 줘서 차례대로 폭포수처럼 떨어지게 유도
      className="..."
    >
      {/* 알림 내용 */}
    </motion.div>
  ))}
</div>
```

---

> [!TIP] UX 설계 팁
> **알림 시스템에서의 `layout` 속성 위력** <br>
> Toast 알림이 3개가 떠있다가 가운데 위치한 2번째 알림의 시간초과(5초)로 `언마운트(Exit)`될 때, 3번째 알림이 갑자기 위로 툭 끊기듯 올라가면 사용자가 텍스트를 읽다가 방해를 받습니다. Framer Motion `<motion.div layout>`을 선언해두면 남은 노드들의 Y 좌표 여백을 엔진이 부드럽게 메꿔주는 극강의 UX를 선사합니다.
