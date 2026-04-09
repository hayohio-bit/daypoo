# 01. Fetch 기반 API 클라이언트 설계

> **파일 위치**: `frontend/src/services/apiClient.ts`  
> axios 없이 순수 fetch로 직접 구현한 HTTP 클라이언트 — 인증·재시도·타임아웃 포함

---

## 핵심 구조 한눈에 보기

```
apiClient.ts 에서 구현하는 4가지 핵심 기능
─────────────────────────────────────────────
F1. AbortController  → 30초 타임아웃 (브라우저 내장)
F2. 지수 백오프      → 5xx 에러 시 1초 → 2초 → 4초 재시도
F3. refreshPromise   → 401 동시 다발 시 refresh를 딱 1번만 실행 (뮤텍스)
F4. 자동 언박싱      → 백엔드 { data: T } 응답에서 .data만 꺼내 반환
```

---

## 1. BASE_URL 전략

```typescript
// ✅ 현재: 상대경로 하드코딩
const BASE_URL = '/api/v1';

// 로컬: Vite proxy가 /api → localhost:8080 대신 처리
// 프로덕션: CloudFront가 /api/* → EC2 라우팅

// 💡 개선 가능: VITE_API_URL 환경변수 활용 (NotificationSubscriber.tsx 패턴)
// const BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api/v1';
```

---

## 2. 토큰 관리 (로그인 유지 분기)

```typescript
// "로그인 상태 유지" 체크 여부에 따라 저장 위치가 달라짐
// localStorage   → 브라우저 닫아도 유지
// sessionStorage → 탭 닫으면 삭제

function getToken(key: string): string | null {
  // 클라이언트에서 만료 시간 선제 체크 → 불필요한 API 호출 방지
  if (isTokenExpiredByTime()) { removeTokens(); return null; }
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function isTokenExpiredByTime(): boolean {
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  return expiresAt ? Date.now() > Number(expiresAt) : false;
}
// 저장 키: 'accessToken' | 'refreshToken' | 'tokenExpiresAt'
```

---

## 3. request() 핵심 흐름

```typescript
private async request<T>(method, endpoint, body?, timeout = 30000): Promise<T> {

  // [F1] AbortController로 타임아웃 구현
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout); // 30초 후 중단

  const response = await fetch(`${this.baseUrl}${endpoint}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
    signal: controller.signal,   // ← AbortController 연결
  });
  clearTimeout(timeoutId);

  // [401 처리] refresh 시도 → 성공 시 원래 요청 재시도
  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    const refreshed = await this.tryRefreshToken(); // F3 뮤텍스 참고
    if (refreshed) return this.request<T>(method, endpoint, body, timeout); // 재시도
    throw ApiError('AUTHENTICATION_REQUIRED', 401);
  }

  // [F4] 백엔드 응답 { data: T, message: '...' } → .data만 반환
  return ('data' in data) ? data.data : data;

  // [에러 변환] 네트워크/타임아웃 에러를 ApiError 형태로 통일
  // AbortError  → { code: 'TIMEOUT',       status: 408 }
  // TypeError   → { code: 'NETWORK_ERROR', status: 0   }
}
```

---

## 4. F3: 뮤텍스 패턴 (Race Condition 방지)

**문제**: A·B·C 요청이 동시에 401을 받으면 refresh가 3번 호출됨 → refresh 토큰 소진

```
뮤텍스 없음                  뮤텍스 있음 (현재)
─────────────────────        ──────────────────────────
요청A → 401 → refresh 호출   요청A → 401 → refresh 호출  ← 실제 API 요청
요청B → 401 → refresh 호출   요청B → 401 → 같은 Promise 대기
요청C → 401 → refresh 호출   요청C → 401 → 같은 Promise 대기
→ 토큰 3번 갱신 (오류)        → 토큰 1번 갱신 후 A·B·C 모두 재시도
```

```typescript
private refreshPromise: Promise<boolean> | null = null;

private async tryRefreshToken(): Promise<boolean> {
  if (this.refreshPromise) return this.refreshPromise; // 이미 진행 중 → 공유

  this.refreshPromise = this.doRefreshToken();         // 첫 호출만 실제 API 요청
  try {
    return await this.refreshPromise;
  } finally {
    this.refreshPromise = null; // ⚠️ 완료 후 반드시 초기화 (다음 만료 대비)
  }
}
```

---

## 5. F2: 지수 백오프 재시도

```typescript
private async requestWithRetry<T>(method, endpoint, body?, maxRetries = 3): Promise<T> {

  // 재시도 하면 안 되는 경우 (중복 처리 위험)
  const skipRetry = ['/auth/login', '/auth/signup', '/auth/refresh']
    .some(p => endpoint.includes(p));
  if (skipRetry) return this.request<T>(method, endpoint, body);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await this.request<T>(method, endpoint, body);
    } catch (error: any) {
      // 재시도 불필요: 클라이언트 에러(4xx) → 즉시 throw
      if ([400, 401, 403, 404, 422, 429].includes(error.status)) throw error;
      if (attempt === maxRetries) throw error;

      // 지수 백오프: 1s → 2s → 4s
      await sleep(1000 * Math.pow(2, attempt));
    }
  }
}
```

---

## 6. Axios vs Fetch 비교 (선택 근거)

| 항목 | fetch (현재) | Axios |
|------|------------|-------|
| 번들 크기 | 0KB (내장) | +14KB |
| 타임아웃 | AbortController 수동 | `timeout` 1줄 |
| 자동 JSON | 수동 파싱 | 자동 |
| 인터셉터 | 직접 구현 | 내장 |
| **결론** | **현재 요구사항 충분** | 파일 업로드 진행률 필요 시 검토 |
