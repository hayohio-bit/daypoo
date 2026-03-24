import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Lock, TrendingUp, Sparkles, ArrowRight, Utensils, Droplets, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { HighlightReveal } from './HighlightReveal';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const PIE_DATA = [
  { name: 'Healthy', value: 85 },
  { name: 'Remaining', value: 15 },
];

const BAR_DATA = [
  { day: '월', score: 4 },
  { day: '화', score: 3 },
  { day: '수', score: 5 },
  { day: '목', score: 4 },
  { day: '금', score: 2 },
  { day: '토', score: 6 },
  { day: '일', score: 4 },
];

const CARDS_DATA = [
  {
    type: 'main',
    title: '이번 주 쾌변 리포트',
    subtitle: '2026년 3월 3주차',
  },
  {
    type: 'insight',
    icon: <Utensils size={32} className="text-[#1B4332]" />,
    title: '식습관 분석',
    description: '매운 음식 섭취와 장 자극 패턴이 관찰되고 있어요. 지난주 대비 매운 음식을 30% 더 섭취했으며, 이는 브리스톨 척도 2-3형 증가와 연관되어 있습니다.',
    locked: true,
  },
  {
    type: 'insight',
    icon: <Droplets size={32} className="text-[#1B4332]" />,
    title: '수분 섭취 연관성',
    description: '수분이 부족한 날 브리스톨 지수가 낮아지는 경향이 있습니다. 하루 물 섭취량을 1.5L 이상 유지하면 쾌변 점수가 평균 15점 상승합니다.',
    locked: true,
  },
  {
    type: 'insight',
    icon: <Moon size={32} className="text-[#1B4332]" />,
    title: '수면 & 장 리듬',
    description: '수면 패턴과 배변 타이밍 사이에 유의미한 상관관계가 발견되었습니다. 규칙적인 수면 시간이 소화 건강에 긍정적 영향을 미칩니다.',
    locked: true,
  },
];

export function ReportCard({ openAuth }: { openAuth: (mode: 'login' | 'signup') => void }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleReportAction = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/mypage');
    } else {
      openAuth('signup');
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CARDS_DATA.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CARDS_DATA.length) % CARDS_DATA.length);
  };

  const handleDragEnd = (_: any, info: any) => {
    const offset = info.offset.x;
    if (offset > 100) {
      handlePrev();
    } else if (offset < -100) {
      handleNext();
    }
  };

  return (
    <section className="pt-40 pb-64 px-6" style={{ backgroundColor: '#eef5f0' }}>
      <div className="max-w-5xl mx-auto">
        {/* ── 섹션 헤더 ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--green-mid)' }}
          >
            AI HEALTH REPORT
          </p>
          <h2
            className="text-3xl md:text-5xl font-black"
            style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}
          >
            당신의 <HighlightReveal
              text="장이 말하고 있어요"
              highlightColor="#E8A838"
              highlightStyle="underline"
              animationDelay={0.8}
              translateY={8}
            />
          </h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--text-sec)' }}>
            기록만 하면 AI가 알아서 분석합니다
          </p>
        </motion.div>

        {/* ── 캐러셀 컨테이너 ─────────────────────────────── */}
        <div className="relative" ref={containerRef}>
          {/* 네비게이션 버튼 */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              backgroundColor: 'var(--surface)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid var(--border-light)',
            }}
          >
            <ChevronLeft size={24} style={{ color: 'var(--green-mid)' }} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              backgroundColor: 'var(--surface)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid var(--border-light)',
            }}
          >
            <ChevronRight size={24} style={{ color: 'var(--green-mid)' }} />
          </button>

          {/* 캐러셀 트랙 */}
          <div className="overflow-hidden" style={{ perspective: '1200px' }}>
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              style={{ x: dragX }}
              className="flex gap-6 py-8"
            >
              {CARDS_DATA.map((card, i) => {
                const distance = Math.abs(i - currentIndex);
                const isActive = i === currentIndex;

                return (
                  <motion.div
                    key={i}
                    animate={{
                      scale: isActive ? 1 : 0.85,
                      opacity: isActive ? 1 : 0.4,
                      filter: isActive ? 'blur(0px)' : 'blur(3px)',
                      rotateY: isActive ? 0 : (i < currentIndex ? -25 : 25),
                      x: `${(i - currentIndex) * 100}%`,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    className="min-w-full rounded-[40px] overflow-hidden"
                    style={{
                      transformStyle: 'preserve-3d',
                      pointerEvents: isActive ? 'auto' : 'none',
                    }}
                  >
                    {card.type === 'main' ? (
                      // ── 메인 차트 카드 ──
                      <div
                        className="p-10 rounded-[40px] shadow-2xl"
                        style={{
                          backgroundColor: 'var(--surface)',
                          border: '2px solid var(--border-light)',
                          boxShadow: isActive
                            ? '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5)'
                            : '0 10px 30px rgba(0,0,0,0.1)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-sec)' }}>
                              {card.subtitle}
                            </p>
                            <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-main)' }}>
                              {card.title}
                            </h3>
                          </div>
                          <span
                            className="px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2"
                            style={{ backgroundColor: 'rgba(232,168,56,0.12)', color: 'var(--amber)' }}
                          >
                            <Sparkles size={16} /> AI 분석 완료
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-8 items-center">
                          {/* Pie Chart */}
                          <div className="flex flex-col items-center">
                            <div className="w-full h-[220px] relative">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={PIE_DATA}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={6}
                                    dataKey="value"
                                    startAngle={90} endAngle={450}
                                  >
                                    <Cell fill="var(--amber)" />
                                    <Cell fill="var(--border-light)" />
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black" style={{ color: 'var(--text-main)' }}>85</span>
                                <span className="text-sm font-medium mt-1" style={{ color: 'var(--text-sec)' }}>쾌변 점수</span>
                              </div>
                            </div>
                          </div>

                          {/* Bar Chart */}
                          <div className="w-full">
                            <div className="w-full h-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={BAR_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                  <XAxis
                                    dataKey="day"
                                    axisLine={false} tickLine={false}
                                    tick={{ fill: 'var(--text-sec)', fontSize: 12 }}
                                  />
                                  <YAxis hide />
                                  <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                                    contentStyle={{
                                      borderRadius: '12px', border: 'none',
                                      boxShadow: '0 10px 24px rgba(0,0,0,0.1)',
                                    }}
                                    formatter={(v) => [`${v}형`, '브리스톨']}
                                  />
                                  <Bar dataKey="score" fill="var(--green-mid)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <p className="text-center text-xs mt-2" style={{ color: 'var(--text-sec)' }}>
                              7일 브리스톨 척도
                            </p>
                          </div>
                        </div>

                        {/* AI 조언 */}
                        <div
                          className="mt-8 p-6 rounded-3xl flex items-center gap-4"
                          style={{ backgroundColor: 'rgba(232,168,56,0.08)', border: '1px solid rgba(232,168,56,0.2)' }}
                        >
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: 'var(--amber)', color: '#fff' }}
                          >
                            <Sparkles size={22} />
                          </div>
                          <div>
                            <p className="text-xs font-bold mb-1" style={{ color: 'var(--amber)' }}>AI 한줄 조언</p>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                              매운 음식 줄이면 쾌변 점수 더 올라가요. 수분 섭취도 늘려보세요!
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // ── 인사이트 카드 ──
                      <div
                        className="relative p-10 rounded-[40px] shadow-2xl min-h-[500px] flex flex-col justify-center"
                        style={{
                          backgroundColor: 'var(--surface)',
                          border: '2px solid var(--border-light)',
                          boxShadow: isActive
                            ? '0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5)'
                            : '0 10px 30px rgba(0,0,0,0.1)',
                        }}
                      >
                        {/* 잠금 오버레이 */}
                        {card.locked && (
                          <div
                            className="absolute inset-0 flex items-center justify-center z-10 rounded-[40px]"
                            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.6)' }}
                          >
                            <div className="flex flex-col items-center gap-3">
                              <Lock size={32} style={{ color: 'var(--green-mid)' }} />
                              <span className="text-sm font-bold" style={{ color: 'var(--green-mid)' }}>가입 후 확인 가능</span>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col items-center text-center gap-6">
                          <div
                            className="w-20 h-20 rounded-3xl flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(232,168,56,0.1)' }}
                          >
                            {card.icon}
                          </div>
                          <h3 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>
                            {card.title}
                          </h3>
                          <p className="text-base leading-relaxed max-w-md" style={{ color: 'var(--text-sec)' }}>
                            {card.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* 인디케이터 */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {CARDS_DATA.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className="transition-all rounded-full"
                style={{
                  width: i === currentIndex ? '32px' : '8px',
                  height: '8px',
                  backgroundColor: i === currentIndex ? 'var(--amber)' : 'var(--border-light)',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── CTA 버튼 ─────────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReportAction}
          className="w-full max-w-md mx-auto block mt-12 p-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all"
          style={{
            backgroundColor: 'var(--amber)',
            color: '#1B4332',
            boxShadow: '0 8px 32px rgba(232,168,56,0.4)',
          }}
        >
          <TrendingUp size={20} />
          내 건강 리포트 보기
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </section>
  );
}
