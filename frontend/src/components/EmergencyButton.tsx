import { motion } from 'framer-motion';
import { useState } from 'react';

interface EmergencyButtonProps {
  onClick: () => void;
}

/**
 * 🍮 Living Coral Liquid Effect Component
 * 우리 서비스의 코랄 팔레트를 기반으로 한 유기적 생명체 효과
 */
const SquishyClayEffect = ({ isHovered }: { isHovered: boolean }) => {
  // 평상시: 정원형에 가까운 은은한 코랄 찹쌀떡
  const baseRadius = [
    "50% 50% 50% 50% / 50% 50% 50% 50%",
    "48% 52% 49% 51% / 51% 49% 52% 48%",
    "50% 50% 50% 50% / 50% 50% 50% 50%"
  ];

  // 호버 시: 코랄 심비오트 변이 (역동적 형태 변화)
  const symbioteRadius = [
    "30% 70% 70% 30% / 30% 30% 70% 70%",
    "60% 40% 30% 70% / 60% 30% 70% 40%",
    "40% 60% 60% 40% / 40% 60% 40% 60%",
    "70% 30% 40% 60% / 30% 70% 30% 70%",
    "30% 70% 70% 30% / 30% 30% 70% 70%"
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* 1. 코랄 유기적 바디 (색상 일원화) */}
      <motion.div
        animate={{
          borderRadius: isHovered ? symbioteRadius : baseRadius,
          scale: isHovered ? [1, 1.2, 0.9, 1.15, 1] : [1, 1.02, 1],
          backgroundColor: isHovered ? "#E85D5D" : "#FDA4AF", // 호버 시 비비드 코랄, 평상시 연한 코랄
          backgroundImage: isHovered 
            ? "radial-gradient(circle at 30% 30%, #FF8A8A 0%, #E85D5D 100%)" 
            : "linear-gradient(135deg, #FFE4E6 0%, #FDA4AF 100%)",
        }}
        transition={{
          borderRadius: { duration: isHovered ? 0.7 : 6, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: isHovered ? 1.2 : 6, repeat: Infinity, ease: "easeInOut" },
          backgroundColor: { duration: 0.5 },
        }}
        className="absolute inset-0 shadow-2xl"
        style={{
          boxShadow: isHovered 
            ? '0 30px 60px rgba(232,93,93,0.4), inset -5px -5px 15px rgba(255,255,255,0.4), inset 5px 5px 15px rgba(0,0,0,0.1)'
            : '0 15px 30px rgba(232,93,93,0.15), inset -5px -5px 10px rgba(0,0,0,0.05), inset 5px 5px 10px rgba(255,255,255,0.5)',
        }}
      >
        {/* 2. 내부 부유물 (생동감) */}
        <motion.div
          animate={{
            scale: isHovered ? [1.2, 0.7, 1.3, 1] : [0.95, 1.05, 0.95],
            opacity: isHovered ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3],
          }}
          transition={{ duration: isHovered ? 1.5 : 8, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-4 rounded-full blur-xl ${isHovered ? 'bg-white/40' : 'bg-white/20'}`}
        />
        
        {/* 3. 코랄 광택 */}
        <motion.div 
          animate={isHovered ? { opacity: [0.5, 0.8, 0.5], y: [-1, 1, -1] } : { opacity: 0.4 }}
          className="absolute top-[10%] left-[15%] w-[40%] h-[25%] bg-gradient-to-b from-white/60 to-transparent blur-sm rounded-[100%]" 
        />
      </motion.div>

      {/* 4. 코랄 심비오트 촉수 분출 (Hover 시) */}
      {isHovered && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0],
                scale: [0.6, 2, 0.6],
                x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
                y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
              }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.12, ease: "anticipate" }}
              className="absolute w-5 h-5 bg-[#E85D5D] blur-[2px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function EmergencyButton({ onClick }: EmergencyButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[900] group">
      <motion.button
        animate={{ 
          y: hovered ? [0, -4, 4, 0] : [0, -10, 0],
          rotate: hovered ? [-1, 1, -1, 1, 0] : 0
        }}
        transition={{
          duration: hovered ? 0.3 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.25 }}
        whileTap={{ scale: 0.82 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onClick}
        className="relative flex flex-col items-center justify-center w-[98px] h-[98px] md:w-[110px] md:h-[110px]"
        style={{
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {/* 🌋 코랄 찹쌀떡 -> 심비오트 배경 */}
        <SquishyClayEffect isHovered={hovered} />

        {/* 아이콘 및 텍스트 레이어 */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <motion.div
            animate={hovered ? {
              scale: [1, 1.4, 0.8, 1.2, 1],
              rotate: [0, -15, 15, -10, 0],
              filter: "brightness(1.1) drop-shadow(0 0 10px rgba(255,255,255,0.7))",
            } : { scale: 1, rotate: 0, filter: "none" }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
            }}
            className="mb-1 text-4xl select-none"
          >
            🚨
          </motion.div>
          <span className="text-[15.5px] font-[1000] tracking-tighter drop-shadow-lg select-none text-white">
            급똥
          </span>
        </div>

        {/* 바닥 글로우 */}
        <div className={`absolute inset-[-35%] blur-[60px] -z-10 transition-all duration-1000 rounded-full ${hovered ? 'bg-[#E85D5D]/25' : 'bg-[#FDA4AF]/15'}`} />
      </motion.button>
    </div>
  );
}
