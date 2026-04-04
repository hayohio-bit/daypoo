import { m } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function LoadingPage() {
  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#f8faf9] overflow-hidden font-sans">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#1B4332]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#E8A838]/5 blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Morphing Loader Area */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Outer Glow Overlay */}
          <m.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full bg-[#1B4332]/10 blur-2xl"
          />

          {/* Real Morphing Object */}
          <m.div
            animate={{
              scale: [1, 1.3, 1.3, 1, 1],
              rotate: [0, 0, 270, 270, 0],
              borderRadius: ["20%", "20%", "50%", "50%", "20%"],
              backgroundColor: ["#1B4332", "#40916C", "#E8A838", "#FFC300", "#1B4332"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.2, 0.5, 0.8, 1]
            }}
            className="w-16 h-16 shadow-[0_10px_40px_rgba(27,67,50,0.3)]"
          />

          {/* Floating Sparkles around loader */}
          <m.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
          >
            <m.div 
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-amber-500"
            >
              <Sparkles size={16} />
            </m.div>
          </m.div>
        </div>

        {/* Text Loading */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-['SchoolSafetyNotification'] text-2xl font-bold text-[#1A2B27]">
              Day<span className="text-[#E8A838]">.</span>Poo
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-bold text-[#7a9e8a] tracking-[0.2em]">
              로딩 중!
            </p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <m.div
                  key={i}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-[#1B4332]"
                />
              ))}
            </div>
          </div>
        </m.div>
      </div>

      {/* Bottom Counter/Tip (Optional Premium Touch) */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute bottom-12 text-center px-6"
      >
        <p className="text-[11px] text-[#7a9e8a]/60 font-medium tracking-tight">
          "오늘의 건강은 어제의 기록으로부터 시작됩니다."
        </p>
      </m.div>
    </div>
  );
}
