# 섹션 2: NotificationContext 기반 전역 상태 설계 분석

**[정합성 검증 완료 사항]** 
> ⚠️ 실제 프로젝트 코드베이스 확인 결과, `Redux Toolkit`이나 `RTK Query` 라이브러리는 알림 도메인에 적용되어 있지 않습니다.
> 현재 모든 알림 상태(데이터 목록, 읽지 않은 수, 토스트 표시 로직)는 오직 **`NotificationContext.tsx` 의 React 전역 Context API** 하나로 우아하게 통합 관리 중입니다. 따라서 본 섹션은 Context 로직의 내부를 집중적으로 다룹니다.

## 1. Context 내부 상태(State) 및 메모이제이션 전략

`Redux`를 걷어냄으로써 보일러플레이트 코드를 줄인 직관적인 설계입니다.

- **Data 상태:** `const [notifications, setNotifications] = useState<Notification[]>([])`
- **Toast 큐 상태:** `const [toasts, setToasts] = useState<Toast[]>([])`
- **읽지 않은 개수(Unread Count):** 백엔드에서 억지로 새로운 API를 파지 않고 프론트엔드 내부에서 보유 중인 데이터 배열을 기반으로 자동 연산합니다. (`useMemo`를 통해 O(N) 반복 연산 최적화)

## 2. NotificationContext.tsx 최적화 분석 (전체 구현)

```tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NotificationToast, ToastType } from '../components/NotificationToast';
import { api } from '../services/apiClient';
import { useAuth } from './AuthContext';

// (인터페이스 선언부 생략...)

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const auth = useAuth();

  // 1. 유저 변경/로그아웃 대응 클리어링
  useEffect(() => {
    if (!auth.user) setNotifications([]);
  }, [auth.user]);

  // 2. Unread Count 파생 상태 (백엔드 추가 호출 없음!)
  const unreadCount = useMemo(() =>
    Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0
  , [notifications]);

  // 3. 토스트 알림 큐(Queue) 처리 + 5초 TTL 스케줄러 보장
  const showToast = useCallback((title: string, message: string, type: ToastType = 'info', icon?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, icon }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000); // 5초 후 자가 소멸
  }, []);

  // 4. API 통신 로직 및 낙관적 업데이트(Optimistic Update)
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) { }
  }, []);

  // [성능 최적화] API 실패 시에도 프론트 상태 돌려주기 (Rollback 대응 처리 필요 가능)
  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(prev => Array.isArray(prev) ? prev.map(n => n.id === id ? { ...n, isRead: true } : n) : []);
    } catch (err) {
      // API가 터져도 로컬 UI에서는 무조건 읽힌 것처럼 업데이트를 유지(UX 최적화)
      setNotifications(prev => Array.isArray(prev) ? prev.map(n => n.id === id ? { ...n, isRead: true } : n) : []);
    }
  }, []);

  /* markAllAsRead, deleteNotification 생략... */

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, showToast, fetchNotifications, markAllAsRead, markAsRead, deleteNotification, setNotifications 
    }}>
      {children}
      {/* Toast 렌더링 포탈 영역 */}
      <div className="fixed bottom-6 left-6 z-[3000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <NotificationToast key={toast.id} {...toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
```

---

> [!TIP] 성능 팁
> **불변성을 깨지 않는 상태 병합과 Context API의 한계** <br>
> 현재 `useMemo`와 `useCallback`이 적절하게 쓰여 리렌더링을 방어하고 있습니다. 하지만 Context 내부 배열 요소가 수천 개로 늘어나면 필터링 및 병합(`spread operator`) 비용이 기하급수적으로 증가합니다. 훗날 데이터량이 무지막지해진다면 이 Context를 `Zustand`나 `Redux`로 쪼개는 마이그레이션이 필요합니다.
