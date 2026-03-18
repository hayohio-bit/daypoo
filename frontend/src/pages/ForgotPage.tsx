import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, KeyRound, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';

// ── 타입 ──────────────────────────────────────────────────────────────
type ForgotMode = 'password' | 'email';
type Step = 'input' | 'verify' | 'done';

// ── 상단 헤더 (Navbar Style) ──────────────────────────────────────────
function PageHeader() {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center mb-10">
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center bg-[#1A2B27] rounded-full px-8 py-3 shadow-2xl gap-5"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Link
          to="/main"
          className="font-black text-white no-underline text-xl tracking-tighter"
          style={{ fontFamily: 'SchoolSafetyNotification, sans-serif' }}
        >
          Day<span style={{ color: '#E8A838' }}>.</span>Poo
        </Link>
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.15)' }} />
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-bold text-white/60 transition-all hover:text-white cursor-pointer"
          style={{ background: 'none', border: 'none' }}
        >
          <ArrowLeft size={14} />
          뒤로
        </button>
      </motion.nav>
    </div>
  );
}

// ── 애니메이션 빔 배경 ──────────────────────────────────────────────────
function AnimatedBeamBackground() {
  const paths = [
    "M-100,200 C150,150 350,450 500,300 C650,150 850,450 1100,200",
    "M1100,800 C850,750 650,950 500,800 C350,650 150,850 -100,800",
    "M200,-100 C150,150 450,350 300,500 C150,650 450,850 200,1100",
    "M800,1100 C750,850 950,650 800,500 C650,350 850,150 800,-100",
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
      <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B4332" stopOpacity="0" />
            <stop offset="30%" stopColor="#52B788" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#E8A838" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1B4332" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {paths.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="rgba(27,67,50,0.04)" strokeWidth="1.5" />
            <motion.path
              d={d}
              fill="none"
              stroke="url(#beam-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0.15, 0.25, 0.15],
                pathOffset: [0, 1],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 7 + i * 2,
                repeat: Infinity,
                delay: i * 2.5,
                ease: "linear"
              }}
            />
          </g>
        ))}
      </svg>
      
      {/* 기존 글로우 효과 (색감 보강) */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: '45vw', height: '45vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(82,183,136,0.06) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,168,56,0.06) 0%, transparent 70%)',
      }} />
    </div>
  );
}

// ── 공통 Input ────────────────────────────────────────────────────────
function InputField({
  label, type = 'text', value, onChange, placeholder,
  error, hint, autoComplete, rightEl,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  error?: string; hint?: string; autoComplete?: string;
  rightEl?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold" style={{ color: '#5a7a6a', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <div
        className="relative flex items-center rounded-xl transition-all duration-200"
        style={{
          background: focused ? '#fff' : '#f4faf6',
          border: error
            ? '1.5px solid rgba(232,93,93,0.55)'
            : focused
            ? '1.5px solid #1B4332'
            : '1.5px solid #d4e8db',
          boxShadow: focused ? '0 0 0 3px rgba(27,67,50,0.06)' : 'none',
        }}
      >
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent outline-none text-sm font-medium px-4 py-3.5"
          style={{ color: '#1a2b22', caretColor: '#1B4332' }}
        />
        {rightEl && <div className="pr-3.5 flex-shrink-0">{rightEl}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs" style={{ color: '#E85D5D' }}>
            <AlertCircle size={11} />{error}
          </motion.p>
        )}
        {!error && hint && (
          <p className="text-xs" style={{ color: '#7a9e8a' }}>{hint}</p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── OTP 인풋 (6자리) ──────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  const handleChange = (idx: number, v: string) => {
    const clean = v.replace(/\D/g, '').slice(-1);
    const arr = [...value.padEnd(6, ' ')].map((c, i) => (i === idx ? clean : c));
    onChange(arr.join('').trimEnd());
    // 자동 포커스 이동
    if (clean && idx < 5) {
      const next = document.getElementById(`otp-${idx + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`);
      prev?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-12 rounded-xl text-center text-lg font-black outline-none transition-all duration-200"
          style={{
            background: d.trim() ? '#fff' : '#f4faf6',
            border: d.trim() ? '1.5px solid #1B4332' : '1.5px solid #d4e8db',
            color: '#1B4332',
            boxShadow: d.trim() ? '0 0 0 3px rgba(27,67,50,0.06)' : 'none',
            caretColor: '#1B4332',
          }}
        />
      ))}
    </div>
  );
}

// ── 비밀번호 찾기 폼 ─────────────────────────────────────────────────
function PasswordForgot({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const validateEmail = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = '이메일을 입력해주세요';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = '올바른 이메일 형식이 아니에요';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateOtp = () => {
    const e: Record<string, string> = {};
    if (otp.trim().length < 6) e.otp = '6자리 코드를 모두 입력해주세요';
    if (!newPw) e.newPw = '새 비밀번호를 입력해주세요';
    else if (newPw.length < 8) e.newPw = '8자 이상 입력해주세요';
    if (newPw !== newPwConfirm) e.newPwConfirm = '비밀번호가 일치하지 않아요';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSend = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // TODO: API
    setLoading(false);
    setStep('verify');
  };

  const handleVerify = async () => {
    if (!validateOtp()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900)); // TODO: API
    setLoading(false);
    setStep('done');
  };

  const handleResend = async () => {
    setResendCount((c) => c + 1);
    setOtp('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
  };

  const slideVar = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  return (
    <AnimatePresence mode="wait">

      {/* ── STEP: input ── */}
      {step === 'input' && (
        <motion.div key="input" variants={slideVar} initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#e8f3ec' }}>
              <KeyRound size={20} style={{ color: '#1B4332' }} />
            </div>
            <div>
              <h2 className="font-black text-lg" style={{ color: '#1a2b22', letterSpacing: '-0.03em' }}>
                비밀번호 찾기
              </h2>
              <p className="text-sm" style={{ color: '#7a9e8a' }}>
                가입한 이메일로 인증코드를 보내드려요
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <InputField label="이메일" type="email" value={email} onChange={setEmail}
              placeholder="가입한 이메일 주소" error={errors.email} autoComplete="email" />

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSend} disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2"
              style={{
                background: loading ? 'rgba(27,67,50,0.4)' : 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
                color: '#fff',
                boxShadow: loading ? 'none' : '0 4px 18px rgba(27,67,50,0.22)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading
                ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', fontSize: '16px' }}>💩</motion.span>
                : <>인증코드 받기 <ArrowRight size={14} /></>}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── STEP: verify ── */}
      {step === 'verify' && (
        <motion.div key="verify" variants={slideVar} initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#e8f3ec' }}>
              <Mail size={20} style={{ color: '#1B4332' }} />
            </div>
            <div>
              <h2 className="font-black text-lg" style={{ color: '#1a2b22', letterSpacing: '-0.03em' }}>
                인증코드 확인
              </h2>
              <p className="text-sm" style={{ color: '#7a9e8a' }}>
                <span className="font-semibold" style={{ color: '#1B4332' }}>{email}</span>으로 보냈어요
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* OTP */}
            <div>
              <label className="text-xs font-bold block mb-3" style={{ color: '#5a7a6a', letterSpacing: '0.06em' }}>
                6자리 인증코드
              </label>
              <OtpInput value={otp} onChange={setOtp} />
              <AnimatePresence>
                {errors.otp && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-1.5 text-xs mt-2" style={{ color: '#E85D5D' }}>
                    <AlertCircle size={11} />{errors.otp}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="flex justify-center mt-3">
                <button onClick={handleResend}
                  className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  style={{ color: '#7a9e8a' }}>
                  <RotateCcw size={11} />
                  코드 재발송{resendCount > 0 && ` (${resendCount}회)`}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 */}
            <InputField label="새 비밀번호" type="password" value={newPw} onChange={setNewPw}
              placeholder="8자 이상" error={errors.newPw} autoComplete="new-password" />
            <InputField label="새 비밀번호 확인" type="password" value={newPwConfirm} onChange={setNewPwConfirm}
              placeholder="비밀번호 재입력" error={errors.newPwConfirm} autoComplete="new-password"
              rightEl={
                newPwConfirm && newPw === newPwConfirm
                  ? <CheckCircle2 size={15} color="#52b788" />
                  : null
              }
            />

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleVerify} disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2"
              style={{
                background: loading ? 'rgba(27,67,50,0.4)' : 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
                color: '#fff',
                boxShadow: loading ? 'none' : '0 4px 18px rgba(27,67,50,0.22)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              {loading
                ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', fontSize: '16px' }}>💩</motion.span>
                : <>비밀번호 변경하기 ✓</>}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── STEP: done ── */}
      {step === 'done' && (
        <motion.div key="done" variants={slideVar} initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center py-4">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: '#e8f3ec' }}>
            <CheckCircle2 size={32} style={{ color: '#1B4332' }} />
          </motion.div>
          <h2 className="font-black text-xl mb-2" style={{ color: '#1a2b22', letterSpacing: '-0.03em' }}>
            비밀번호 변경 완료!
          </h2>
          <p className="text-sm mb-6" style={{ color: '#7a9e8a', lineHeight: 1.7 }}>
            새 비밀번호로 로그인해보세요.<br />안전하게 장 건강을 기록하세요 💩
          </p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/main')}
            className="w-full py-3.5 rounded-xl font-black text-sm"
            style={{
              background: 'linear-gradient(135deg, #E8A838 0%, #d4922a 100%)',
              color: '#1B4332',
              boxShadow: '0 4px 18px rgba(232,168,56,0.28)',
            }}>
            로그인하러 가기 →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 이메일 찾기 폼 ───────────────────────────────────────────────────
function EmailForgot({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [nickname, setNickname] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [foundEmail, setFoundEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nickname.trim()) e.nickname = '닉네임을 입력해주세요';
    const y = parseInt(birthYear), m = parseInt(birthMonth), d = parseInt(birthDay);
    if (!birthYear || !birthMonth || !birthDay) e.birth = '생년월일을 모두 입력해주세요';
    else if (y < 1900 || y > new Date().getFullYear()) e.birth = '올바른 연도를 입력해주세요';
    else if (m < 1 || m > 12) e.birth = '올바른 월을 입력해주세요';
    else if (d < 1 || d > 31) e.birth = '올바른 일을 입력해주세요';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleFind = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900)); // TODO: API
    setLoading(false);
    setFoundEmail('he***@example.com'); // TODO: 실제 마스킹된 이메일
    setStep('done');
  };

  const [focusedBirth, setFocusedBirth] = useState<number | null>(null);

  const slideVar = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  return (
    <AnimatePresence mode="wait">

      {/* ── STEP: input ── */}
      {step === 'input' && (
        <motion.div key="input" variants={slideVar} initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#fdf3de' }}>
              <Mail size={20} style={{ color: '#b5810f' }} />
            </div>
            <div>
              <h2 className="font-black text-lg" style={{ color: '#1a2b22', letterSpacing: '-0.03em' }}>
                이메일 찾기
              </h2>
              <p className="text-sm" style={{ color: '#7a9e8a' }}>
                닉네임과 생년월일로 이메일을 찾아드려요
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <InputField label="닉네임" value={nickname} onChange={setNickname}
              placeholder="가입 시 등록한 닉네임" error={errors.nickname} />

            {/* 생년월일 */}
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: '#5a7a6a', letterSpacing: '0.06em' }}>
                생년월일
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: birthYear, onChange: setBirthYear, placeholder: '1990', label: '년', idx: 0 },
                  { value: birthMonth, onChange: setBirthMonth, placeholder: '01', label: '월', idx: 1 },
                  { value: birthDay, onChange: setBirthDay, placeholder: '01', label: '일', idx: 2 },
                ].map((f) => (
                  <div key={f.idx} className="relative">
                    <input
                      type="number" value={f.value}
                      onChange={(e) => f.onChange(e.target.value)}
                      onFocus={() => setFocusedBirth(f.idx)}
                      onBlur={() => setFocusedBirth(null)}
                      placeholder={f.placeholder}
                      className="w-full bg-transparent outline-none text-sm font-medium px-3 py-3 rounded-xl text-center"
                      style={{
                        color: '#1a2b22', caretColor: '#1B4332',
                        background: focusedBirth === f.idx ? '#fff' : '#f4faf6',
                        border: focusedBirth === f.idx ? '1.5px solid #1B4332' : '1.5px solid #d4e8db',
                        boxShadow: focusedBirth === f.idx ? '0 0 0 3px rgba(27,67,50,0.06)' : 'none',
                        MozAppearance: 'textfield',
                      }}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold pointer-events-none"
                      style={{ color: '#7a9e8a' }}>{f.label}</span>
                  </div>
                ))}
              </div>
              <AnimatePresence>
                {errors.birth && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: '#E85D5D' }}>
                    <AlertCircle size={11} />{errors.birth}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleFind} disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2"
              style={{
                background: loading ? 'rgba(27,67,50,0.4)' : 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
                color: '#fff',
                boxShadow: loading ? 'none' : '0 4px 18px rgba(27,67,50,0.22)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              {loading
                ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', fontSize: '16px' }}>💩</motion.span>
                : <>이메일 찾기 <ArrowRight size={14} /></>}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── STEP: done ── */}
      {step === 'done' && (
        <motion.div key="done" variants={slideVar} initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center py-4">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: '#fdf3de' }}>
            <Mail size={28} style={{ color: '#b5810f' }} />
          </motion.div>
          <h2 className="font-black text-xl mb-2" style={{ color: '#1a2b22', letterSpacing: '-0.03em' }}>
            이메일을 찾았어요!
          </h2>
          <p className="text-sm mb-2" style={{ color: '#7a9e8a' }}>
            가입한 이메일 주소예요
          </p>

          {/* 이메일 표시 */}
          <div className="w-full px-5 py-4 rounded-2xl mb-6"
            style={{ background: '#f4faf6', border: '1.5px solid #d4e8db' }}>
            <p className="font-black text-lg" style={{ color: '#1B4332', letterSpacing: '-0.02em' }}>
              {foundEmail}
            </p>
            <p className="text-xs mt-1" style={{ color: '#7a9e8a' }}>
              보안을 위해 일부 정보가 가려졌어요
            </p>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/main')}
              className="w-full py-3.5 rounded-xl font-black text-sm"
              style={{
                background: 'linear-gradient(135deg, #E8A838 0%, #d4922a 100%)',
                color: '#1B4332',
                boxShadow: '0 4px 18px rgba(232,168,56,0.28)',
              }}>
              로그인하러 가기 →
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setStep('input'); setNickname(''); setBirthYear(''); setBirthMonth(''); setBirthDay(''); }}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: '#f4faf6', color: '#5a7a6a', border: '1.5px solid #d4e8db' }}>
              다시 찾기
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────
export function ForgotPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ForgotMode>('email');
  const [modeDir, setModeDir] = useState(1);

  const switchMode = (next: ForgotMode) => {
    setModeDir(next === 'email' ? -1 : 1);
    setMode(next);
  };

  const modeVar = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#F8FAF9' }}
    >
      {/* 배경 장식 */}
      <AnimatedBeamBackground />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full"
        style={{ maxWidth: '540px' }}
      >
        <PageHeader />
        {/* 카드 */}
        <div
          className="rounded-[28px] p-8"
          style={{
            background: '#fff',
            border: '1px solid #d4e8db',
            boxShadow: '0 8px 40px rgba(27,67,50,0.09)',
          }}
        >
          {/* 탭 전환 */}
          <div
            className="flex rounded-2xl p-1 mb-5"
            style={{ background: '#f4faf6', border: '1px solid #d4e8db' }}
          >
            {([
              { key: 'email',    label: '📧 이메일 찾기' },
              { key: 'password', label: '🔑 비밀번호 찾기' },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => switchMode(t.key)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all relative"
                style={{ color: mode === t.key ? '#1B4332' : '#7a9e8a' }}
              >
                {mode === t.key && (
                  <motion.div
                    layoutId="tabBg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: '#fff', border: '1px solid #d4e8db', boxShadow: '0 2px 8px rgba(27,67,50,0.08)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>

          {/* 폼 전환 */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={modeDir}>
              <motion.div
                key={mode}
                custom={modeDir}
                variants={modeVar}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {mode === 'password'
                  ? <PasswordForgot onBack={() => navigate(-1)} />
                  : <EmailForgot onBack={() => navigate(-1)} />
                }
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 하단 안내 */}
        <p className="text-center mt-4 text-sm" style={{ color: '#7a9e8a' }}>
          계정이 기억나셨나요?{' '}
          <Link to="/main"
            className="font-bold transition-colors"
            style={{ color: '#1B4332', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#2D6A4F')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#1B4332')}
          >
            로그인하기
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
