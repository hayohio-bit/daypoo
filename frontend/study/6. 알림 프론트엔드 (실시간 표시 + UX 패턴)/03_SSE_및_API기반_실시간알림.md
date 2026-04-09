# 섹션 3: SSE 및 API 기반 실시간 알림 로직 구축

**[정합성 검증 완료 사항]**
> 사용자가 추정했던 `RTK Query`의 폴링(Polling) 방식은 현재 사용되지 않습니다. 
> 놀랍게도 브라우저 표준 명세인 **Server-Sent Events(SSE)** 코드가 완벽히 구현되어 있으나, 현재는 백엔드 구현 완전성을 위해 `SSE_ENABLED = false;` 상태(비활성화)로 유지되고 있습니다. 향후 True로 전환 시 서버 푸시를 바로 받아 전역 상태를 자동 업데이트할 수 있습니다.

## 1. NotificationSubscriber 시스템의 역할

`App.tsx` 상단에 배치되는 `<NotificationSubscriber />` 컴포넌트는 UI 렌더링 요소가 없습니다(`return null;`). 오직 백그라운드에서 백엔드와 물리적인 SSE 스트림 연결 파이프라인을 유지하는 역할만 합니다. 

이 스크립트가 유저의 인터넷 환경 문제로 접속이 끊겼을 때 어떻게 "지수 백오프 기반 재연결(Exponential Backoff Reconnect)"을 시도하는지 분석합니다.

## 2. NotificationSubscriber.tsx 구현 해부

```tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification, ToastType } from '../context/NotificationContext';
import { api } from '../services/apiClient';

const MAX_RETRY_COUNT = 10; 
const BASE_RETRY_DELAY = 1000; 
const MAX_RETRY_DELAY = 30000;

export const NotificationSubscriber: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast, fetchNotifications } = useNotification();
  const [retryCount, setRetryCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<any>(null);

  const connectSSE = useCallback(async () => {
    // 백엔드 의존성 통제 (Flag 제어)
    const SSE_ENABLED = false; 
    if (!SSE_ENABLED) return;

    if (eventSourceRef.current) eventSourceRef.current.close();

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || '';
      // REST API로 먼저 SSE 전용 짧은 생명주기 'subToken'을 발급받아 보안성 강화
      let subToken = localStorage.getItem('accessToken');
      try {
        const res: any = await api.post('/notifications/sse-token', {});
        if (res && res.sseToken) subToken = res.sseToken;
      } catch (err) {}

      // 브라우저 네이티브 EventSource 객체로 연결 수립
      const eventSource = new EventSource(`${BASE_URL}/api/v1/notifications/subscribe?token=${subToken}`);
      eventSourceRef.current = eventSource;

      // 1. 커넥션 성공 시
      eventSource.onopen = () => setRetryCount(0);

      // 2. 서버에서 [이름: notification] 이벤트로 데이터를 푸시했을 때
      eventSource.addEventListener('notification', (event) => {
        const data = JSON.parse(event.data);
        if (data.message) {
          showToast(data.title, data.message, data.type?.toLowerCase() as ToastType, data.icon);
          fetchNotifications(); // UI 업데이트를 위해 최신 알림 목록 강제 Reload
          refreshUser(); 
        }
      });

      // 3. 커넥션 에러 발생 시 자동 재접속 방어 로직 (Jitter/Backoff)
      eventSource.onerror = (err) => {
        eventSource.close();
        if (retryCount >= MAX_RETRY_COUNT) {
          showToast('알림 연결 실패', '알림 서비스에 연결할 수 없습니다.', 'info');
          return;
        }

        // 지수형 증분: 1s -> 2s -> 4s -> 8s -> 최대 30s 제한
        const delay = Math.min(BASE_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
      };
    } catch (err) { }
  }, [user, refreshUser, showToast, fetchNotifications, retryCount]);

  useEffect(() => {
    connectSSE();
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [connectSSE, retryCount]);

  // UI 없음
  return null;
};
```

---

> [!TIP] 성능 팁
> **폴링(Polling) 대신 SSE(EventSource)를 채택한 이유** <br>
> 스마트폰 배터리 및 데이터 절감입니다. 단순 폴링(예: `setInterval` 매 10초)을 돌리면 서버가 HTTP TCP 연결을 매번 새로 뚫고 닫아야 하므로, 유저가 많아지면 서버가 터집니다. 반면 SSE는 HTTP 연결을 한 번만 유지시킨 채 데이터 패킷만 흐르게 두므로 무거운 Socket을 달 필요 없이 가볍게 최강의 성능(O(1) Traffic overhead)을 냅니다.
