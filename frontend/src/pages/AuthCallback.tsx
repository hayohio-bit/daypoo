import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      // 로그인 성공 시 메인 또는 원래 있던 페이지로 이동
      navigate('/main', { replace: true });
    } else {
      console.error('인증 토큰을 찾을 수 없습니다.');
      navigate('/main', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#152e22] text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">로그인 중입니다. 잠시만 기다려주세요...</p>
      </div>
    </div>
  );
};
