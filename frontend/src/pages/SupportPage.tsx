import { useState, useRef, useEffect, useCallback } from 'react';
import type React from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { api } from '../services/apiClient';
import { ChevronDown, Plus, MessageSquare, Clock, CheckCircle, Send, ChevronLeft, ChevronRight } from 'lucide-react';

// ── 타입 ──────────────────────────────────────────────────────────────
type SupportTab = 'faq' | 'inquiry' | 'myinquiry';
type FaqCategory = '전체' | '건강/AI분석' | '이용방법' | '결제/아바타' | '계정/보안';
type InquiryStatus = '답변 대기' | '답변 완료';
type InquiryCategory = '화장실 정보 오류' | '결제/아이템 문의' | '건강 분석 오류' | '기타';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, '전체'>;
  q: string;
  a: string;
  num: string;
}

interface Inquiry {
  id: string;
  category: InquiryCategory;
  title: string;
  content: string;
  status: InquiryStatus;
  createdAt: string;
  answer?: { content: string; createdAt: string };
}

// ── FAQ 데이터 ────────────────────────────────────────────────────────
const FAQ_DATA: FaqItem[] = [
  {
    id:'f1', num:'01', category:'건강/AI분석',
    q:'AI 건강 분석 결과는 의학적으로 정확한가요?',
    a:'본 서비스의 AI 분석은 사용자가 입력한 데이터를 바탕으로 한 일반적인 가이드일 뿐, 전문적인 의학적 진단을 대신할 수 없습니다. 증상이 지속되면 반드시 전문의와 상담하세요.',
  },
  {
    id:'f2', num:'02', category:'건강/AI분석',
    q:'브리스톨 척도란 무엇인가요?',
    a:'브리스톨 척도(Bristol Stool Scale)는 대변의 형태를 7가지 유형으로 분류한 의학적 기준입니다. 1~2형은 변비, 3~4형은 정상, 5~7형은 설사에 해당합니다. Day.Poo에서는 이를 기반으로 장 건강을 분석합니다.',
  },
  {
    id:'f3', num:'03', category:'이용방법',
    q:'화장실 정보가 틀린데 어떻게 수정하나요?',
    a:'해당 화장실 상세 페이지의 \'정보 수정 요청\' 버튼을 누르거나 1:1 문의를 남겨주세요. 검토 후 빠르게 수정해 드리겠습니다.',
  },
  {
    id:'f4', num:'04', category:'이용방법',
    q:'방문 인증은 어떻게 하나요?',
    a:'지도 페이지에서 원하는 화장실을 선택한 후 \'방문 인증하기\' 버튼을 누르세요. 브리스톨 척도, 색상, 컨디션 태그를 입력하면 인증이 완료됩니다. 인증 후 화장실 마커가 💩으로 바뀝니다.',
  },
  {
    id:'f5', num:'05', category:'결제/아바타',
    q:'획득한 칭호는 어떻게 적용하나요?',
    a:'마이페이지의 \'컬렉션\' 탭에서 보유 중인 칭호를 클릭하면 닉네임 앞에 표시됩니다. 획득하지 않은 칭호는 잠금 표시로 표시되며 인증 횟수를 달성하면 자동으로 해제됩니다.',
  },
  {
    id:'f6', num:'06', category:'결제/아바타',
    q:'아이템 구매 후 환불이 가능한가요?',
    a:'디지털 아이템 특성상 구매 완료 후에는 환불이 어렵습니다. 단, 결제 오류나 시스템 문제로 인한 경우 1:1 문의를 통해 처리해 드립니다.',
  },
  {
    id:'f7', num:'07', category:'계정/보안',
    q:'비밀번호를 잊어버렸어요.',
    a:'로그인 화면의 \'비밀번호를 잊으셨나요?\' 링크를 통해 이메일 인증으로 비밀번호를 재설정할 수 있습니다.',
  },
  {
    id:'f8', num:'08', category:'계정/보안',
    q:'카카오/구글 계정으로 가입하면 이메일 로그인도 가능한가요?',
    a:'소셜 계정으로 가입하신 경우 동일한 소셜 계정으로만 로그인이 가능합니다. 이메일/비밀번호 로그인을 원하시면 별도로 회원가입을 진행해 주세요.',
  },
];

// ── Mock 문의 내역 ────────────────────────────────────────────────────
const MOCK_INQUIRIES: Inquiry[] = [
  {
    id:'q1', category:'이용방법', title:'화장실 위치가 잘못 표시되어 있어요',
    content:'강남구청 공중화장실 위치가 실제와 50m 정도 차이가 납니다. 수정 부탁드립니다.',
    status:'답변 완료', createdAt:'2026-03-14',
    answer:{ content:'안녕하세요! 신고해 주셔서 감사합니다. 해당 화장실의 좌표를 수정 완료했습니다. 앞으로도 불편한 점이 있으시면 언제든지 문의해 주세요 😊', createdAt:'2026-03-15' },
  },
  {
    id:'q2', category:'결제/아이템 문의', title:'아이템 구매 후 인벤토리에 없어요',
    content:'황금 왕관 아이템을 구매했는데 인벤토리에 반영이 안 됩니다. 확인 부탁드립니다.',
    status:'답변 대기', createdAt:'2026-03-17',
  },
];

// ── 공통 variants ─────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const } },
});
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

// ══════════════════════════════════════════════════════════════════════
// ① GRAVITY PARTICLES  (Framer "Gravity Particles" 포팅)
//    Canvas rAF: 파티클들이 서로 끌어당기며 부유
//    마우스 근처 반발(repel), 파티클 간 인력 + 연결선
// ══════════════════════════════════════════════════════════════════════
function GravityParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const rafRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#52b788','#2D6A4F','#E8A838','#1B4332','#d4922a'];
    type P = { x:number; y:number; vx:number; vy:number; r:number; color:string; alpha:number; ta:number };

    const pts: P[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 3.2 + 1.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.22 + 0.05,
      ta: Math.random() * 0.22 + 0.05,
    }));

    const draw = () => {
      const W = window.innerWidth, H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);

      pts.forEach((p, i) => {
        const dx = p.x - mouseRef.current.x, dy = p.y - mouseRef.current.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 110 && d > 0) {
          const f = (110-d)/110*0.55;
          p.vx += (dx/d)*f; p.vy += (dy/d)*f;
        }
        for (let j = i+1; j < pts.length; j++) {
          const q = pts[j];
          const ex = q.x-p.x, ey = q.y-p.y;
          const ed = Math.sqrt(ex*ex+ey*ey);
          if (ed < 160 && ed > 0) {
            const f = 0.0028/ed;
            p.vx+=ex*f; p.vy+=ey*f; q.vx-=ex*f; q.vy-=ey*f;
          }
          if (ed < 95) {
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
            ctx.strokeStyle=`rgba(82,183,136,${(1-ed/95)*0.065})`; ctx.lineWidth=0.5; ctx.stroke();
          }
        }
        p.vx*=0.978; p.vy*=0.978; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0){p.x=0;p.vx*=-1;} if(p.x>W){p.x=W;p.vx*=-1;}
        if(p.y<0){p.y=0;p.vy*=-1;} if(p.y>H){p.y=H;p.vy*=-1;}
        p.alpha += (p.ta-p.alpha)*0.03;
        if(Math.abs(p.alpha-p.ta)<0.005) p.ta=Math.random()*0.2+0.04;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.color; ctx.globalAlpha=p.alpha; ctx.fill(); ctx.globalAlpha=1;
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    const onMove  = (e: MouseEvent) => { mouseRef.current = { x:e.clientX, y:e.clientY }; };
    const onLeave = () => { mouseRef.current = { x:-9999, y:-9999 }; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />;
}

// ══════════════════════════════════════════════════════════════════════
// ② INTERACTIVE GRADIENT CARD  (Framer "Interactive Gradient" 포팅)
//    마우스 위치 → radial-gradient 중심 이동, useSpring 부드럽게
//    + SpectraNoise 스타일 SVG feTurbulence 노이즈 텍스처 오버레이
// ══════════════════════════════════════════════════════════════════════
function InteractiveGradientCard({
  children, watermark, className='', style={},
}: { children: React.ReactNode; watermark: string; className?: string; style?: React.CSSProperties }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0.5), rawY = useMotionValue(0.5);
  const spX  = useSpring(rawX,{ stiffness:75, damping:20 });
  const spY  = useSpring(rawY,{ stiffness:75, damping:20 });
  const [grad, setGrad] = useState(
    'radial-gradient(ellipse 62% 58% at 30% 40%, rgba(82,183,136,0.18) 0%, rgba(27,67,50,0.06) 48%, transparent 78%)'
  );

  useEffect(() => {
    const u = () => {
      const sx=spX.get(), sy=spY.get();
      setGrad(`radial-gradient(ellipse 66% 62% at ${sx*100}% ${sy*100}%, rgba(82,183,136,0.22) 0%, rgba(27,67,50,0.07) 44%, transparent 74%)`);
    };
    const u1=spX.on('change',u), u2=spY.on('change',u);
    return () => { u1(); u2(); };
  }, [spX, spY]);

  const onMove  = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect(); if(!r) return;
    rawX.set((e.clientX-r.left)/r.width); rawY.set((e.clientY-r.top)/r.height);
  }, [rawX, rawY]);
  const onLeave = useCallback(() => { rawX.set(0.5); rawY.set(0.3); }, [rawX, rawY]);

  return (
    <div ref={cardRef} onMouseMove={onMove} onMouseLeave={onLeave}
      className={`relative overflow-hidden ${className}`}
      style={{ background:'#f9fafb', border:'1px solid rgba(26,43,39,0.08)', ...style }}>
      <div style={{ position:'absolute', inset:0, background:'#f9fafb', zIndex:0, pointerEvents:'none' }} />
      <div style={{
        position:'absolute', inset:0, opacity:0.032, zIndex:1, pointerEvents:'none',
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat:'repeat', backgroundSize:'250px 250px',
      }} />
      <div className="absolute pointer-events-none select-none" style={{
        bottom:'-28px', right:'16px',
        fontSize:'clamp(90px, 15vw, 170px)', fontWeight:900, letterSpacing:'-0.05em', lineHeight:1, zIndex:2,
        background:'linear-gradient(0deg, rgba(210,214,219,0) 0%, rgba(210,214,219,0.42) 100%)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
      }}>{watermark}</div>
      <div className="relative" style={{ zIndex:3 }}>{children}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ③ ANIMATED BLOB  (Framer "Animated Gradient" + "Conic Animation" 조합)
//    SVG feGaussianBlur + feColorMatrix goo 필터
//    blob 3개가 독립 타이밍으로 부유
// ══════════════════════════════════════════════════════════════════════
function AnimatedBlob() {
  return (
    <div className="absolute pointer-events-none overflow-hidden" style={{ inset:0, zIndex:0 }} aria-hidden>
      <svg style={{ position:'absolute', width:0, height:0 }}>
        <defs>
          <filter id="gooBlob">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
          </filter>
        </defs>
      </svg>
      <div style={{ position:'absolute', inset:0, filter:'url(#gooBlob)' }}>
        <motion.div animate={{ x:[0,45,-25,0], y:[0,-32,22,0], scale:[1,1.14,0.96,1] }}
          transition={{ duration:10, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', top:'-35%', left:'-12%', width:'60%', height:'60%', borderRadius:'50%', background:'rgba(82,183,136,0.14)' }} />
        <motion.div animate={{ x:[0,-55,35,0], y:[0,28,-18,0], scale:[1,0.88,1.12,1] }}
          transition={{ duration:12, repeat:Infinity, ease:'easeInOut', delay:2.5 }}
          style={{ position:'absolute', top:'-22%', right:'-8%', width:'46%', height:'46%', borderRadius:'50%', background:'rgba(232,168,56,0.09)' }} />
        <motion.div animate={{ x:[0,28,-38,0], y:[0,-22,32,0], scale:[1,1.18,0.9,1] }}
          transition={{ duration:14, repeat:Infinity, ease:'easeInOut', delay:5 }}
          style={{ position:'absolute', bottom:'-28%', left:'28%', width:'38%', height:'38%', borderRadius:'50%', background:'rgba(27,67,50,0.1)' }} />
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'55%', background:'linear-gradient(to bottom, transparent, #f8faf9)', zIndex:1 }} />
    </div>
  );
}

// ── FAQ 아코디언 아이템 ───────────────────────────────────────────────
function FaqAccordionItem({ item, isOpen, onToggle }: {
  item: FaqItem; isOpen: boolean; onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="overflow-hidden rounded-2xl"
      style={{
        background: isOpen ? '#fff' : hovered ? 'rgba(27,67,50,0.03)' : 'rgba(26,43,39,0.02)',
        border: isOpen ? '1.5px solid rgba(27,67,50,0.15)' : hovered ? '1px solid rgba(27,67,50,0.12)' : '1px solid rgba(26,43,39,0.07)',
        boxShadow: isOpen ? '0 4px 24px rgba(27,67,50,0.08)' : hovered ? '0 2px 12px rgba(27,67,50,0.05)' : 'none',
        transition: 'background .2s, border .2s, box-shadow .2s',
      }}
    >
      <motion.button onClick={onToggle} whileTap={{ scale: 0.997 }}
        className="w-full flex items-center gap-4 px-5 py-4 text-left">
        {/* 번호 — 열릴 때 앰버 */}
        <motion.span
          animate={{ color: isOpen ? '#E8A838' : 'rgba(26,43,39,0.2)' }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 text-xs font-black"
          style={{ letterSpacing: '0.06em', minWidth: '24px' }}>
          {item.num}
        </motion.span>
        <span className="flex-1 text-sm font-bold leading-snug"
          style={{ color: isOpen ? '#1A2B27' : 'rgba(26,43,39,0.7)' }}>
          {item.q}
        </span>
        {/* 플러스 → X 45도 */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0, color: isOpen ? '#1B4332' : 'rgba(26,43,39,0.3)' }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="flex-shrink-0">
          <Plus size={18} />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div key="ans"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}>
            <div style={{ borderTop: '1px solid rgba(26,43,39,0.06)' }}>
              <div className="flex gap-3 px-5 pb-5 pt-4">
                {/* 좌측 그린 액센트 바 */}
                <motion.div
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    width: '3px', borderRadius: '2px', flexShrink: 0,
                    alignSelf: 'stretch', transformOrigin: 'top',
                    background: 'rgba(26,43,39,0.1)',
                  }} />
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(26,43,39,0.65)' }}>
                  {item.a}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── FAQ 섹션 ──────────────────────────────────────────────────────────
function FaqSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>(FAQ_DATA);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('전체');
  const [openId, setOpenId] = useState<string | null>('f1');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const data = await api.get('/support/faqs');
        if (data && Array.isArray(data) && data.length > 0) setFaqs(data);
      } catch (err) {
        console.error('FAQs 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const CATEGORIES: FaqCategory[] = ['전체', '건강/AI분석', '이용방법', '결제/아바타', '계정/보안'];

  const filtered = activeCategory === '전체'
    ? faqs
    : faqs.filter((f) => f.category === activeCategory);

  return (
    <motion.div
      ref={ref}
      variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'}
    >
      {/* ── ★ Interactive Gradient 헤더 카드 ── */}
      <motion.div
        variants={fadeUp(0)}
        className="relative overflow-hidden rounded-[32px] mb-3"
      >
        <InteractiveGradientCard watermark="FAQ" className="rounded-[32px]" style={{ padding: '48px' }}>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="max-w-xs">
            <motion.h2
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-black leading-tight mb-3"
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                letterSpacing: '-0.04em',
                background: 'linear-gradient(0deg, #1B4332 0%, #1A2B27 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              자주 묻는 질문
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm leading-relaxed"
              style={{ color: 'rgba(26,43,39,0.55)' }}
            >
              원하는 답변을 찾지 못하셨나요?<br />
              1:1 문의를 남겨주시면 빠르게 답변해 드릴게요.
            </motion.p>
          </div>

          {/* 카테고리 필터 — 우측 */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.25, ease: [0.12, 0.23, 0, 1] }}
            className="flex flex-wrap gap-2"
          >
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenId(null); }}
                whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
                className="relative px-3.5 py-2 rounded-xl text-xs font-bold"
                style={{
                  background: activeCategory === cat ? '#1B4332' : '#fff',
                  color: activeCategory === cat ? '#fff' : 'rgba(26,43,39,0.5)',
                  border: activeCategory === cat ? '1px solid #1B4332' : '1px solid rgba(26,43,39,0.1)',
                  boxShadow: activeCategory === cat ? '0 4px 14px rgba(27,67,50,0.22)' : '0 1px 4px rgba(26,43,39,0.06)',
                  transition: 'background .18s, color .18s, box-shadow .18s',
                }}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </div>
        </InteractiveGradientCard>
      </motion.div>

      {/* ── 아코디언 리스트 ── */}
      <motion.div layout className="flex flex-col gap-2.5">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <FaqAccordionItem
                item={item}
                isOpen={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── 1:1 문의 섹션 ─────────────────────────────────────────────────────
function InquirySection({ onSubmitSuccess }: { onSubmitSuccess: () => void }) {
  const [category, setCategory] = useState<InquiryCategory>('화장실 정보 오류');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const CATEGORIES: InquiryCategory[] = ['화장실 정보 오류', '결제/아이템 문의', '건강 분석 오류', '기타'];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = '제목을 입력해주세요';
    if (content.trim().length < 10) e.content = '내용을 10자 이상 입력해주세요';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/support/inquiries', {
        category,
        title,
        content,
      });
      setTitle(''); setContent('');
      onSubmitSuccess();
    } catch (err: any) {
      console.error('문의 등록 실패:', err);
      // 서버 에러 메시지가 있으면 표시, 없으면 기본 메시지
      const msg = err.response?.data?.message || err.message || '문의 등록 중 오류가 발생했습니다.';
      setErrors({ content: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string, hasError: boolean) => ({
    width: '100%',
    background: focusedField === field ? '#fff' : '#f9faf9',
    border: hasError
      ? '1.5px solid rgba(232,93,93,0.55)'
      : focusedField === field
      ? '1.5px solid #1B4332'
      : '1.5px solid rgba(26,43,39,0.08)',
    borderRadius: '14px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#1A2B27',
    outline: 'none',
    caretColor: '#1B4332',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(27,67,50,0.06)' : 'none',
    transition: 'all .2s',
  });

  return (
    <motion.div
      ref={ref}
      variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'}
      className="flex flex-col gap-2"
    >
      {/* 섹션 헤더 */}
      <motion.div variants={fadeUp(0)}>
        <InteractiveGradientCard watermark="ASK" className="rounded-[28px]" style={{ padding: '40px', minHeight: '160px' }}>
          <div className="relative z-10">
            <h2 className="font-black mb-2"
              style={{
                fontSize: 'clamp(22px, 3.5vw, 30px)', letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #1A2B27 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
              1:1 문의하기
            </h2>
            <p className="text-sm" style={{ color: 'rgba(26,43,39,0.5)' }}>
              평일 09:00 ~ 18:00 · 보통 24시간 이내 답변
            </p>
          </div>
        </InteractiveGradientCard>
      </motion.div>

      {/* 문의 폼 카드 */}
      <motion.div variants={fadeUp(0.08)} className="rounded-[24px] p-6"
        style={{ background: '#fff', border: '1px solid rgba(26,43,39,0.08)', boxShadow: '0 4px 24px rgba(26,43,39,0.05)' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* 문의 유형 */}
          <div>
            <label className="text-xs font-bold block mb-2" style={{ color: 'rgba(26,43,39,0.45)', letterSpacing: '0.06em' }}>
              문의 유형
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat} type="button"
                  onClick={() => setCategory(cat)}
                  whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold"
                  style={{
                    background: category === cat ? 'rgba(27,67,50,0.08)' : 'rgba(26,43,39,0.03)',
                    color: category === cat ? '#1B4332' : 'rgba(26,43,39,0.4)',
                    border: category === cat ? '1.5px solid rgba(27,67,50,0.2)' : '1px solid rgba(26,43,39,0.07)',
                    boxShadow: category === cat ? '0 2px 8px rgba(27,67,50,0.1)' : 'none',
                    transition: 'all .15s',
                  }}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="text-xs font-bold block mb-2" style={{ color: 'rgba(26,43,39,0.45)', letterSpacing: '0.06em' }}>
              제목
            </label>
            <input
              type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
              placeholder="핵심 내용을 간략히 적어주세요"
              style={inputStyle('title', !!errors.title)}
            />
            <AnimatePresence>
              {errors.title && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs mt-1.5" style={{ color: '#E85D5D' }}>
                  {errors.title}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* 내용 */}
          <div>
            <label className="text-xs font-bold block mb-2" style={{ color: 'rgba(26,43,39,0.45)', letterSpacing: '0.06em' }}>
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocusedField('content')}
              onBlur={() => setFocusedField(null)}
              placeholder="구체적인 상황을 설명해주세요 (최소 10자)"
              rows={5}
              style={{ ...inputStyle('content', !!errors.content), resize: 'none', lineHeight: '1.7' }}
            />
            <div className="flex items-center justify-between mt-1.5">
              <AnimatePresence>
                {errors.content && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-xs" style={{ color: '#E85D5D' }}>
                    {errors.content}
                  </motion.p>
                )}
              </AnimatePresence>
              <span className="text-xs ml-auto" style={{ color: content.length < 10 ? 'rgba(26,43,39,0.3)' : '#52b788' }}>
                {content.length}자
              </span>
            </div>
          </div>

          {/* 제출 버튼 */}
          <motion.button
            type="submit" disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm mt-2"
            style={{
              background: loading ? 'rgba(27,67,50,0.3)' : 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
              color: '#fff',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(27,67,50,0.22)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', fontSize: '16px' }}>💩</motion.span>
              : <><Send size={15} /> 문의 등록하기</>}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── 내 문의 내역 섹션 ─────────────────────────────────────────────────
function MyInquirySection() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      try {
        const data = await api.get('/support/inquiries');
        if (data && Array.isArray(data)) setInquiries(data);
      } catch (err) {
        console.error('문의 내역 로드 실패 (로그인 필요):', err);
        // 목업 데이터로 폴백해둘 수도 있음 (테스트용)
        setInquiries(MOCK_INQUIRIES);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const totalPages = Math.ceil(inquiries.length / PER_PAGE);
  const paginated = inquiries.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const StatusBadge = ({ status }: { status: InquiryStatus }) => (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
      style={{
        background: status === '답변 완료' ? 'rgba(82,183,136,0.1)' : 'rgba(232,168,56,0.1)',
        color: status === '답변 완료' ? '#52b788' : '#b5810f',
        border: `1px solid ${status === '답변 완료' ? 'rgba(82,183,136,0.2)' : 'rgba(232,168,56,0.2)'}`,
      }}
    >
      {status === '답변 완료' ? <CheckCircle size={9} /> : <Clock size={9} />}
      {status}
    </span>
  );

  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'}
      className="flex flex-col gap-2">

      {/* ★ 섹션 헤더 카드 — InteractiveGradientCard */}
      <motion.div variants={fadeUp(0)}>
        <InteractiveGradientCard watermark="HISTORY" className="rounded-[28px]" style={{ padding: '40px', minHeight: '140px' }}>
          <h2 className="font-black mb-2"
            style={{
              fontSize: 'clamp(22px, 3.5vw, 30px)', letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #1A2B27 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
            내 문의 내역
          </h2>
          <p className="text-sm" style={{ color: 'rgba(26,43,39,0.5)' }}>
            총 {inquiries.length}건의 문의
          </p>
        </InteractiveGradientCard>
      </motion.div>

      {/* 문의 목록 */}
      {paginated.length === 0 ? (
        <motion.div variants={fadeUp(0.08)}
          className="flex flex-col items-center justify-center py-16 rounded-[24px]"
          style={{ background: '#fff', border: '1px solid rgba(26,43,39,0.07)' }}>
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-4xl mb-3">💬</motion.span>
          <p className="font-bold text-sm" style={{ color: 'rgba(26,43,39,0.4)' }}>아직 문의 내역이 없어요</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {paginated.map((inq, i) => (
            <motion.div
              key={inq.id}
              variants={fadeUp(i * 0.06)}
              className="rounded-[20px] overflow-hidden"
              style={{
                background: '#fff',
                border: openId === inq.id ? '1.5px solid rgba(27,67,50,0.15)' : '1px solid rgba(26,43,39,0.07)',
                boxShadow: openId === inq.id ? '0 4px 20px rgba(27,67,50,0.07)' : 'none',
              }}
            >
              {/* 문의 헤더 */}
              <button
                onClick={() => setOpenId(openId === inq.id ? null : inq.id)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left"
              >
                <MessageSquare size={16} style={{ color: 'rgba(26,43,39,0.3)', flexShrink: 0, marginTop: '2px' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(26,43,39,0.05)', color: 'rgba(26,43,39,0.45)' }}>
                      {inq.category}
                    </span>
                    <StatusBadge status={inq.status} />
                  </div>
                  <p className="text-sm font-bold truncate" style={{ color: '#1A2B27' }}>{inq.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(26,43,39,0.35)' }}>{inq.createdAt}</p>
                </div>
                <motion.div
                  animate={{ rotate: openId === inq.id ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="flex-shrink-0 mt-1"
                  style={{ color: 'rgba(26,43,39,0.3)' }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>

              {/* 문의 상세 */}
              <AnimatePresence initial={false}>
                {openId === inq.id && (
                  <motion.div
                    key="detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ borderTop: '1px solid rgba(26,43,39,0.06)' }}>
                      {/* 내 문의 내용 */}
                      <div className="px-5 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
                          style={{ color: 'rgba(26,43,39,0.3)' }}>문의 내용</p>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(26,43,39,0.65)' }}>
                          {inq.content}
                        </p>
                      </div>

                      {/* 답변 영역 */}
                      {inq.answer ? (
                        <div className="mx-4 mb-4 rounded-2xl p-4"
                          style={{ background: 'rgba(27,67,50,0.04)', border: '1px solid rgba(27,67,50,0.1)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(27,67,50,0.1)', color: '#1B4332' }}>
                              관리자 답변
                            </span>
                            <span className="text-[10px]" style={{ color: 'rgba(26,43,39,0.35)' }}>
                              {inq.answer.createdAt}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: 'rgba(26,43,39,0.7)' }}>
                            {inq.answer.content}
                          </p>
                        </div>
                      ) : (
                        <div className="mx-4 mb-4 rounded-2xl p-4 flex items-center gap-3"
                          style={{ background: 'rgba(232,168,56,0.06)', border: '1px solid rgba(232,168,56,0.15)' }}>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                            <Clock size={14} style={{ color: '#b5810f' }} />
                          </motion.div>
                          <p className="text-xs" style={{ color: '#b5810f' }}>
                            검토 중입니다. 보통 24시간 이내 답변 드려요.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <motion.div variants={fadeUp(0.1)} className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: 'rgba(26,43,39,0.04)', border: '1px solid rgba(26,43,39,0.08)',
              color: page === 1 ? 'rgba(26,43,39,0.2)' : 'rgba(26,43,39,0.5)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: page === i + 1 ? '#1B4332' : 'rgba(26,43,39,0.04)',
                color: page === i + 1 ? '#fff' : 'rgba(26,43,39,0.4)',
                border: page === i + 1 ? '1px solid #1B4332' : '1px solid rgba(26,43,39,0.08)',
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: 'rgba(26,43,39,0.04)', border: '1px solid rgba(26,43,39,0.08)',
              color: page === totalPages ? 'rgba(26,43,39,0.2)' : 'rgba(26,43,39,0.5)',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── SupportPage 메인 ──────────────────────────────────────────────────
export function SupportPage({ openAuth }: { openAuth: (mode: 'login' | 'signup') => void }) {
  const [activeTab, setActiveTab] = useState<SupportTab>('faq');
  const [prevTab, setPrevTab] = useState<SupportTab>('faq');

  const TAB_ORDER: SupportTab[] = ['faq', 'inquiry', 'myinquiry'];
  const tabDir = TAB_ORDER.indexOf(activeTab) >= TAB_ORDER.indexOf(prevTab) ? 1 : -1;

  const TABS: { key: SupportTab; label: string; icon: string }[] = [
    { key: 'faq',       label: '자주 묻는 질문', icon: '💬' },
    { key: 'inquiry',   label: '1:1 문의',        icon: '✉️' },
    { key: 'myinquiry', label: '내 문의 내역',     icon: '📋' },
  ];

  const handleTabChange = (k: SupportTab) => {
    // 문의하기나 내역 확인은 로그인 체크
    if (k !== 'faq') {
      const token = localStorage.getItem('accessToken');
      if (!token || token === 'undefined' || token === 'null') {
        openAuth?.('login');
        return;
      }
    }
    
    setPrevTab(activeTab);
    setActiveTab(k);
  };

  const slideVar = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 36 : -36 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -36 : 36 }),
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8faf9', position: 'relative' }}>

      {/* ★ ① Gravity Particles — fixed 배경 */}
      <GravityParticles />

      <Navbar openAuth={openAuth} />

      {/* 페이지 헤더 — ★ ③ Animated Blob 배경 */}
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="relative overflow-hidden" style={{ paddingTop: '140px', paddingBottom: '56px' }}>
          {/* ★ Animated Blob */}
          <AnimatedBlob />

          <div className="relative max-w-3xl mx-auto px-6" style={{ zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6"
            >
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.02em' }}
                animate={{ opacity: 1, letterSpacing: '0.1em' }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-xs font-bold uppercase mb-2"
                style={{ color: 'rgba(26,43,39,0.35)' }}>
                SUPPORT CENTER
              </motion.p>

              <div style={{ overflow: 'hidden' }}>
                <motion.h1
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="font-black leading-tight"
                  style={{
                    fontSize: 'clamp(28px, 5vw, 44px)',
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #E8A838 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                  무엇을 도와드릴까요?
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-sm mt-3" style={{ color: 'rgba(26,43,39,0.5)' }}>
                FAQ에서 빠르게 찾거나, 1:1 문의로 답변받아보세요
              </motion.p>
            </motion.div>

            {/* 탭 바 — 글라스모피즘 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-1 p-1 rounded-2xl mb-8"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(26,43,39,0.08)',
                boxShadow: '0 4px 20px rgba(26,43,39,0.07)',
              }}
            >
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                  style={{ color: activeTab === t.key ? '#1B4332' : 'rgba(26,43,39,0.4)' }}
                >
                  {activeTab === t.key && (
                    <motion.div
                      layoutId="supportTabBg"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: '#fff', border: '1px solid rgba(26,43,39,0.08)', boxShadow: '0 2px 8px rgba(26,43,39,0.06)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span style={{ fontSize: '13px' }}>{t.icon}</span>
                    {t.label}
                  </span>
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="max-w-3xl mx-auto px-6 pb-20 overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait" custom={tabDir}>
          <motion.div
            key={activeTab}
            custom={tabDir}
            variants={slideVar}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'faq' && <FaqSection />}
            {activeTab === 'inquiry' && (
              <InquirySection onSubmitSuccess={() => handleTabChange('myinquiry')} />
            )}
            {activeTab === 'myinquiry' && <MyInquirySection />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <div style={{ transform: 'rotate(180deg)', marginBottom: '-1px' }}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M0 120L60 112.5C120 105 240 90 360 82.5C480 75 600 75 720 82.5C840 90 960 105 1080 112.5C1200 120 1320 120 1380 120H1440V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V120Z" fill="#111E18" />
          </svg>
        </div>
        <Footer />
      </div>
    </div>
  );
}
