import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, TrendingUp, Sparkles, ArrowRight, Utensils, Droplets, Moon } from 'lucide-react';
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

const LOCKED_INSIGHTS = [
  {
    icon: <Utensils size={20} className="text-[#1B4332]" />,
    label: '식습관 분석',
    preview: '매운 음식 섭취와 장 자극 패턴 관찰',
  },
  {
    icon: <Droplets size={20} className="text-[#1B4332]" />,
    label: '수분 섭취',
    preview: '수분 부족 시 브리스톨 지수 하락',
  },
  {
    icon: <Moon size={20} className="text-[#1B4332]" />,
    label: '수면 리듬',
    preview: '수면 패턴과 배변 타이밍 상관관계',
  },
];

export function ReportCard({ openAuth }: { openAuth: (mode: 'login' | 'signup') => void }) {
  const navigate = useNavigate();

  const handleReportAction = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/mypage');
    } else {
      openAuth('signup');
    }
  };

  return (
    <section className="pt-40 pb-64 px-6" style={{ backgroundColor: '#eef5f0' }}>
      <div className="max-w-7xl mx-auto">
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

        {/* ── Bento Grid 레이아웃 ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[180px]">

          {/* 1. 메인 차트 카드 (큰 카드) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4, rotateX: 2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4 md:row-span-2 p-8 rounded-3xl shadow-lg overflow-hidden relative group"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-light)',
            }}
          >
            {/* 배경 그라데이션 */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: 'radial-gradient(circle at top right, rgba(232,168,56,0.08), transparent 60%)',
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-sec)' }}>
                    2026년 3월 3주차
                  </p>
                  <h3 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-main)' }}>
                    이번 주 쾌변 리포트
                  </h3>
                </div>
                <span
                  className="px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2"
                  style={{ backgroundColor: 'rgba(232,168,56,0.12)', color: 'var(--amber)' }}
                >
                  <Sparkles size={16} /> AI 분석 완료
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-[180px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={PIE_DATA}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={70}
                          paddingAngle={8}
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
                  <div className="w-full h-[180px]">
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
            </div>
          </motion.div>

          {/* 2. AI 조언 카드 (넓은 카드) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-2 md:row-span-1 p-6 rounded-3xl shadow-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(232,168,56,0.1), rgba(232,168,56,0.05))',
              border: '1px solid rgba(232,168,56,0.3)',
            }}
          >
            <div className="flex items-start gap-4 h-full">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--amber)', color: '#fff' }}
              >
                <Sparkles size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--amber)' }}>AI 한줄 조언</p>
                <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-main)' }}>
                  매운 음식 줄이면 쾌변 점수 더 올라가요. 수분 섭취도 늘려보세요!
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3-5. 잠긴 인사이트 카드들 (작은 카드) */}
          {LOCKED_INSIGHTS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="relative md:col-span-2 lg:col-span-1 md:row-span-1 p-5 rounded-3xl shadow-lg overflow-hidden group"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-light)',
              }}
            >
              {/* 잠금 오버레이 */}
              <div
                className="absolute inset-0 flex items-center justify-center z-10 rounded-3xl backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
              >
                <div className="flex flex-col items-center gap-1">
                  <Lock size={18} style={{ color: 'var(--green-mid)' }} />
                  <span className="text-[10px] font-bold" style={{ color: 'var(--green-mid)' }}>가입 후 확인</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span>{item.icon}</span>
                <div>
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-main)' }}>{item.label}</p>
                  <p className="text-[10px] leading-tight" style={{ color: 'var(--text-sec)' }}>{item.preview}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* 6. CTA 버튼 카드 */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReportAction}
            className="md:col-span-2 lg:col-span-3 md:row-span-1 p-6 rounded-3xl shadow-lg overflow-hidden flex flex-col items-center justify-center gap-3 font-bold transition-all"
            style={{
              backgroundColor: 'var(--amber)',
              color: '#1B4332',
              boxShadow: '0 8px 32px rgba(232,168,56,0.4)',
            }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={20} />
              <span className="text-base">내 건강 리포트 보기</span>
              <ArrowRight size={18} />
            </div>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
