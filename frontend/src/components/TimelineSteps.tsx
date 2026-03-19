import { motion, useScroll, useSpring, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useRef, MouseEvent } from 'react';
import { MapPin, Zap, Brain, Sparkles, ArrowRight } from 'lucide-react';

interface Step {
  id: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  isAction?: boolean;
}

const STEPS: Step[] = [
  {
    id: 1,
    icon: <MapPin size={26} />,
    title: '전국 화장실 실시간 탐색',
    desc: '내 주변 7만 개 공용 화장실 데이터를\n가장 빠르게 찾아보세요.',
    color: '#1B4332',
  },
  {
    id: 2,
    icon: <Zap size={26} />,
    title: '스마트한 배변 기록',
    desc: '다녀온 후 브리스톨 척도로 3초 만에\n나의 컨디션을 기록하세요.',
    color: '#2D6A4F',
  },
  {
    id: 3,
    icon: <Brain size={26} />,
    title: 'AI 건강 리포트 분석',
    desc: '누적된 데이터를 기반으로 AI가\n나의 장 건강 상태를 분석합니다.',
    color: '#40916C', // 좀 더 밝은 녹색
  },
  {
    id: 4,
    icon: <Sparkles size={26} />,
    title: '지금 바로 시작하기',
    desc: '첫 기록부터 AI 건강 어드바이저가\n당신과 함께합니다.',
    color: '#1B4332',
    isAction: true,
  },
];

// ── Spotlight Card Component ──────────────────────────────────────────
function SpotlightCard({ step, index, scrollYProgress }: { step: Step; index: number; scrollYProgress: any }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className={`relative w-full p-8 md:p-14 rounded-[32px] md:rounded-[48px] transition-all duration-500 group overflow-hidden ${
        step.isAction 
          ? 'bg-[#1B4332] text-white shadow-[0_32px_80px_rgba(27,67,50,0.3)]' 
          : 'bg-white shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-gray-100'
      }`}
    >
      {/* Spotlight 배경 (Radial Gradient) */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[48px] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${step.isAction ? 'rgba(255,255,255,0.1)' : step.color + '15'},
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative z-10">
        {/* 단계 번호 및 아이콘 */}
        <div className="flex items-center gap-6 mb-10">
          <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 duration-500 ${step.isAction ? 'bg-white/10' : 'bg-white border border-gray-50'}`} 
            style={{ color: step.isAction ? '#fff' : step.color }}>
            {step.icon}
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-black tracking-[0.3em] uppercase mb-1 ${step.isAction ? 'text-white/30' : 'text-gray-300'}`}>
              Roadmap Step 0{step.id}
            </span>
            <div className={`h-1 w-12 rounded-full ${step.isAction ? 'bg-amber-400/30' : 'bg-gray-100'}`} />
          </div>
        </div>

        {/* 제목 및 설명 */}
        <h3 className={`text-3xl md:text-4xl font-black mb-6 tracking-tight leading-tight ${step.isAction ? 'text-white' : 'text-[#1B4332]'}`}>
          {step.title}
        </h3>
        <p className={`text-lg md:text-xl leading-relaxed whitespace-pre-line mb-8 ${step.isAction ? 'text-white/60' : 'text-gray-500/80 font-medium'}`}>
          {step.desc}
        </p>

        {/* 액션 버튼 (마지막 단계 전용) */}
        {step.isAction && (
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full md:w-auto px-12 py-5 bg-amber-400 text-[#1B4332] font-black rounded-[20px] shadow-xl flex items-center justify-center gap-3 transition-all"
          >
            지금 가입하기
            <ArrowRight size={22} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export function TimelineSteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scrollScale = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const pathLength = useTransform(scrollScale, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative max-w-6xl mx-auto py-12 md:py-32 px-6 md:px-12">
      {/* ── 타임라인 수직 라인 (좌측 배치) ────────────────────────────── */}
      <div className="absolute left-8 md:left-24 top-48 bottom-48 w-[2px] bg-gray-100 transform translate-x-[-1px] hidden md:block" />
      <motion.div 
        className="absolute left-8 md:left-24 top-48 bottom-48 w-[2px] transform translate-x-[-1px] origin-top bg-gradient-to-b from-[#1B4332] via-[#2D6A4F] to-[#40916C] hidden md:block"
        style={{ scaleY: pathLength }}
      />

      <div className="relative flex flex-col gap-12 md:gap-40">
        {STEPS.map((step, i) => (
          <div key={step.id} className="relative pl-0 md:pl-40 flex items-center justify-center md:justify-start">
            {/* 타임라인 도트 indicator */}
            <motion.div 
              className="absolute left-8 md:left-24 transform translate-x-[-50%] w-7 h-7 rounded-full border-[5px] border-white z-20 shadow-[0_12px_24px_rgba(0,0,0,0.15)] ring-4 ring-white/50 hidden md:block"
              style={{ 
                backgroundColor: step.color,
                scale: useTransform(scrollYProgress, [i * 0.25, i * 0.25 + 0.1], [0.85, 1.25])
              }}
            />

            <SpotlightCard step={step} index={i} scrollYProgress={scrollYProgress} />
          </div>
        ))}
      </div>
    </div>
  );
}
