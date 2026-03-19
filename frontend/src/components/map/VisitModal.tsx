import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, AlertTriangle } from 'lucide-react';
import {
  ToiletData, VisitRecord, PoopColor, ConditionTag, FoodTag,
  BRISTOL_TYPES, POOP_COLORS, CONDITION_TAGS, FOOD_TAGS,
} from '../../types/toilet';

interface VisitModalProps {
  toilet: ToiletData;
  onClose: () => void;
  onComplete: (record: VisitRecord) => void;
}

const STEPS = ['브리스톨 척도', '색상 선택', '컨디션 태그', '먹은 음식'];

export function VisitModal({ toilet, onClose, onComplete }: VisitModalProps) {
  const [step, setStep] = useState(0);
  const [bristolType, setBristolType] = useState<number | null>(null);
  const [color, setColor] = useState<PoopColor | null>(null);
  const [conditions, setConditions] = useState<ConditionTag[]>([]);
  const [foods, setFoods] = useState<FoodTag[]>([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      onComplete({
        toiletId: toilet.id,
        bristolType: bristolType!,
        color: color!,
        conditionTags: conditions,
        foodTags: foods,
        createdAt: new Date().toISOString(),
      });
    }
  };

  // ★ 백드롭 클릭 시 확인 후 닫기 (실수 방지)
  const handleBackdropClick = () => {
    if (step > 0 || bristolType !== null) {
      // 이미 작성 중이면 확인 모달 표시
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* 백드롭/오버레이 — 실수 방지: 작성 중이면 확인 후 닫기 */}
      <motion.div
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* 모달 본체 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-[480px] bg-white rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
        style={{ maxHeight: 'calc(100vh - 80px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#eef5f0]">
          <div>
            <p className="text-[10px] font-bold text-[#7a9e8a] uppercase tracking-wider">{toilet.name}</p>
            <h2 className="font-black text-xl text-[#1a2b22]">방문 인증 💩</h2>
          </div>
          <button onClick={handleBackdropClick} className="w-10 h-10 rounded-full bg-[#f4faf6] text-[#7a9e8a] flex items-center justify-center hover:bg-[#e8f3ec] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* 스텝 게이지 */}
        <div className="flex items-center px-6 py-4 gap-1.5 bg-[#fcfdfc] border-b border-[#eef5f0]">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#eef5f0]">
              <motion.div 
                initial={false}
                animate={{ width: i <= step ? '100%' : '0%' }}
                className="h-full bg-[#1B4332]"
              />
            </div>
          ))}
        </div>

        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar" style={{ minHeight: '320px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <p className="font-black text-lg text-[#1a2b22]">오늘의 💩 모양은?</p>
                    <p className="text-xs text-[#7a9e8a] mt-1">브리스톨 척도 1~7번 중 선택해주세요.</p>
                  </div>
                  <div className="grid gap-2.5 pb-2">
                    {BRISTOL_TYPES.map((b) => (
                      <button
                        key={b.type}
                        onClick={() => setBristolType(b.type)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                          bristolType === b.type ? 'border-[#1B4332] bg-[#f4faf6]' : 'border-[#eef5f0] bg-white'
                        }`}
                      >
                        <span className="text-3xl">{b.emoji}</span>
                        <div className="text-left flex-1">
                          <p className={`text-sm font-bold ${bristolType === b.type ? 'text-[#1B4332]' : 'text-[#1a2b22]'}`}>
                            {b.type}형 · {b.label}
                          </p>
                          <p className="text-[11px] text-[#7a9e8a] leading-tight mt-0.5">{b.desc}</p>
                        </div>
                        {bristolType === b.type && <Check size={18} className="text-[#1B4332]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <p className="font-black text-lg text-[#1a2b22]">색상을 골라주세요</p>
                    <p className="text-xs text-[#7a9e8a] mt-1">가장 가까운 색 하나를 선택합니다.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(Object.entries(POOP_COLORS) as [PoopColor, { hex: string; label: string }][]).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setColor(key)}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          color === key ? 'border-[#1B4332] bg-[#f4faf6]' : 'border-[#eef5f0] bg-white'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full shadow-inner" style={{ background: val.hex }} />
                        <span className="text-sm font-bold text-[#1a2b22]">{val.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <p className="font-black text-lg text-[#1a2b22]">상태는 어떠셨나요?</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CONDITION_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setConditions(prev => prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag])}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                          conditions.includes(tag) ? 'bg-[#1B4332] border-[#1B4332] text-white' : 'bg-white border-[#eef5f0] text-[#1B4332]'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <p className="font-black text-lg text-[#1a2b22]">최근 드신 음식은?</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FOOD_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setFoods(prev => prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag])}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                          foods.includes(tag) ? 'bg-[#E8A838] border-[#E8A838] text-white' : 'bg-white border-[#eef5f0] text-[#b5810f]'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 푸터 버튼 */}
        <div className="px-6 py-6 bg-[#fcfdfc] border-t border-[#eef5f0] flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center justify-center w-14 h-14 rounded-2xl border-2 border-[#eef5f0] text-[#7a9e8a] hover:bg-[#f4faf6]"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={step === 0 ? !bristolType : step === 1 ? !color : false}
            className="flex-1 py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
            style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}
          >
            {step === 3 ? '인증 완료하기 ✨' : '다음 단계로'}
          </button>
        </div>
      </motion.div>

      {/* ★ 닫기 확인 모달 (실수로 밖을 터치했을 때) */}
      <AnimatePresence>
        {showCloseConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCloseConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-[320px] w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-[#FFF3E0] flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-[#E8A838]" />
              </div>
              <h3 className="font-black text-lg text-[#1a2b22] mb-2">작성을 중단할까요?</h3>
              <p className="text-sm text-[#7a9e8a] mb-6">
                지금까지 입력한 내용이 사라집니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 border-[#eef5f0] text-[#1a2b22] hover:bg-[#f4faf6]"
                >
                  계속 작성
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ background: '#E85D5D' }}
                >
                  나가기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eef5f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
