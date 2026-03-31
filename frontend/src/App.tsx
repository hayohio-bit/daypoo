import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SplashPage } from './pages/SplashPage';
import { MainPage } from './pages/MainPage';
import { MapPage } from './pages/MapPage';
import { RankingPage } from './pages/RankingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TransitionProvider } from './context/TransitionContext';
import { AuthModal } from './components/AuthModal';
import { ForgotPage } from './pages/ForgotPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { MyPage } from './pages/MyPage';
import { SupportPage } from './pages/SupportPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { AuthCallback } from './pages/AuthCallback';
import { AdminPage } from './pages/AdminPage';
import { SocialSignupPage } from './pages/SocialSignupPage';
import { PremiumPage } from './pages/PremiumPage';
import { ServerErrorPage } from './pages/ServerErrorPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationSubscriber } from './components/NotificationSubscriber';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navigate } from 'react-router-dom';

function LoginPage() {
  // 백엔드(Spring Security)에서 OAuth2 인증 실패 또는 로그인 페이지로의
  // 리다이렉트가 발생했을 때 이 컴포넌트로 라우팅됩니다. 
  // 더미 페이지 대신, 메인 페이지로 돌아가 로그인 모달을 다시 열 수 있도록 처리합니다.
  return <Navigate to="/main?login=open" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  console.log('[AdminRoute] Debug:', {
    loading,
    user,
    userRole: user?.role,
    hasUser: !!user,
    accessToken: !!(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'))
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8faf9] text-[#1B4332] font-black tracking-widest text-xl">
        ADMIN GATEWAY LOADING...
      </div>
    );
  }

  const isAdmin = user && (
    (typeof user.role === 'string' && user.role.toUpperCase().includes('ADMIN')) ||
    (Array.isArray(user.role) && user.role.some((r: string) => r.toUpperCase().includes('ADMIN')))
  );

  if (!isAdmin) {
    console.error('[AdminRoute] ❌ Access denied. Redirecting to /main.', {
      userRole: user?.role,
      hasToken: !!(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'))
    });
    return <Navigate to="/main" replace />;
  }

  console.log('[AdminRoute] ✅ Access granted. User is admin.');
  return <>{children}</>;
}

function App() {
  const [onAuthSuccess, setOnAuthSuccess] = useState<(() => void) | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // URL에 ?login=open 이 있을 경우 자동으로 AuthModal을 열어줌
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'open') {
      setAuthMode('login');
      setAuthOpen(true);
      // 열고 난 후 URL 파라미터 정리
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error')) {
      // OAuth2 인증 실패(예: KAKAO_CLIENT_ID 없음 등) 시 
      console.error('OAuth Error:', params.get('error'));
      alert('소셜 로그인 처리 중 문제가 발생했습니다. (설정/비밀키 누락 등)\n서버 관리자에게 문의하세요.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const openAuth = useCallback((mode: 'login' | 'signup', callback?: () => void) => {
    setAuthMode(mode);
    setOnAuthSuccess(() => callback || null);
    setAuthOpen(true);
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <TransitionProvider>
            <NotificationProvider>
              <NotificationSubscriber />
              <Routes>
                <Route path="/" element={<SplashPage />} />
                <Route path="/main" element={<MainPage openAuth={openAuth} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/map" element={<MapPage openAuth={openAuth} />} />
                <Route path="/ranking" element={<RankingPage openAuth={openAuth} />} />
                <Route path="/forgot-password" element={<ForgotPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/mypage" element={<MyPage openAuth={openAuth} />} />
                <Route path="/support" element={<SupportPage openAuth={openAuth} />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/signup/social" element={<SocialSignupPage />} />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/premium" element={<PremiumPage openAuth={openAuth} />} />
                <Route path="/500" element={<ServerErrorPage />} />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  } 
                />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <AuthModal 
                isOpen={authOpen} 
                onClose={() => setAuthOpen(false)} 
                defaultMode={authMode}
                onSuccess={() => {
                  if (onAuthSuccess) onAuthSuccess();
                  setOnAuthSuccess(null);
                }}
              />
            </NotificationProvider>
          </TransitionProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
