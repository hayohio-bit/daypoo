import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, MapPin, MessageSquare,
  ShoppingBag, Settings, ChevronRight, ChevronLeft,
  TrendingUp, AlertTriangle, Activity, DollarSign,
  LogOut, Bell, RefreshCw, Plus, Shield, Zap, Search, Clock, Calendar,
  Navigation,
  Star,
  Maximize2,
  X
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { useToilets } from '../hooks/useToilets';
import { ToiletData, MOCK_TOILETS } from '../types/toilet';

// ── Shared Constants & Types ──────────────────────────────────────────
type AdminTab = 'dashboard' | 'users' | 'toilets' | 'cs' | 'store' | 'system' | 'add-item' | 'logs';

const COLORS = {
  primary: '#1B4332',
  secondary: '#2D6A4F',
  accent: '#E8A838',
  error: '#FF4B4B',
  warning: '#F4A261',
  info: '#3B82F6',
  surface: '#FFFFFF',
  background: '#f8faf9',
  border: 'rgba(26,43,39,0.08)',
  textPrimary: '#1A2B27',
  textSecondary: 'rgba(26,43,39,0.5)',
};

// ── Sub-Components: Common Elements ──────────────────────────────────
const GlassCard = ({ children, className = '', glowColor = 'rgba(27,67,50,0.05)', onClick }: { children: React.ReactNode, className?: string, glowColor?: string, onClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, boxShadow: `0 20px 40px ${glowColor}` }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-[24px] p-6 ${className}`}
    style={{
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${COLORS.border}`,
      boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
    }}
  >
    {children}
  </motion.div>
);

const StatWidget = ({ title, value, trend, isUp, icon: Icon, color }: any) => (
  <GlassCard glowColor={`${color}15`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-[18px]" style={{ background: `${color}12`, color }}>
        <Icon size={22} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        <TrendingUp size={12} className={isUp ? '' : 'rotate-180'} />
        {trend}
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: COLORS.textSecondary }}>{title}</span>
      <span className="text-3xl font-black" style={{ color: COLORS.textPrimary, letterSpacing: '-0.04em' }}>{value}</span>
    </div>
    <div className="mt-4 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: '70%' }} 
        transition={{ duration: 1, ease: 'easeInOut' }}
        className="h-full rounded-full" 
        style={{ background: color }} 
      />
    </div>
  </GlassCard>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 rounded-2xl shadow-2xl border bg-white/90 backdrop-blur-md" style={{ borderColor: COLORS.border }}>
        <p className="text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: COLORS.textSecondary }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 mb-1">
            <span className="text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="text-sm font-black" style={{ color: COLORS.textPrimary }}>
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ── Screen: Dashboard (Overview) ──────────────────────────────────────
const DashboardView = ({ setActiveTab }: { setActiveTab: (tab: AdminTab) => void }) => {
  const [liveUsers, setLiveUsers] = useState(342);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => Math.max(300, prev + Math.floor(Math.random() * 7 - 3)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const trendData = [
    { name: '03.17', users: 1200, sales: 450 },
    { name: '03.18', users: 1500, sales: 620 },
    { name: '03.19', users: 1800, sales: 840 },
    { name: '03.20', users: 2400, sales: 1100 },
    { name: '03.21', users: 2100, sales: 950 },
    { name: '03.22', users: 2900, sales: 1350 },
    { name: '03.23', users: 3400, sales: 1620 },
  ];

  const pieData = [
    { name: '프리미엄 (PRO)', value: 400, color: COLORS.primary },
    { name: '베이직', value: 300, color: '#52b788' },
    { name: '무료', value: 300, color: COLORS.accent },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="cursor-pointer" onClick={() => setActiveTab('users')}>
          <StatWidget title="현재 접속자" value={liveUsers} trend="+12.5%" isUp color={COLORS.primary} icon={Activity} />
        </div>
        <div className="cursor-pointer" onClick={() => setActiveTab('users')}>
          <StatWidget title="누적 가입자" value="82.4K" trend="+4.3%" isUp color={COLORS.accent} icon={Users} />
        </div>
        <div className="cursor-pointer" onClick={() => setActiveTab('store')}>
          <StatWidget title="최근 수익" value="₩2.4M" trend="+18.2%" isUp color={COLORS.secondary} icon={DollarSign} />
        </div>
        <div className="cursor-pointer" onClick={() => setActiveTab('system')}>
          <StatWidget title="시스템 경고" value="3건" trend="-2%" isUp={false} color={COLORS.error} icon={AlertTriangle} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-black" style={{ letterSpacing: '-0.03em' }}>성장 지표 시각화</h3>
              <p className="text-sm font-bold text-black/50">가입 유저 및 상점 매출 추세</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#333' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#333' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" name="신규 방문" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="sales" name="매출 건수" stroke={COLORS.accent} strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
           <h3 className="text-xl font-black mb-1 text-black" style={{ letterSpacing: '-0.03em' }}>멤버십 세그먼트</h3>
           <p className="text-sm mb-6 font-bold text-black/50">사용자 티어 분포 비율</p>
           <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-[10px] font-black uppercase text-black/40">총 유저</span>
                 <span className="text-2xl font-black text-black">1.0K</span>
              </div>
           </div>
           <div className="mt-6 space-y-3">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs font-bold text-black/70">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-black">{((item.value / 1000) * 100).toFixed(0)}%</span>
                </div>
              ))}
           </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-black">실시간 시스템 로그</h3>
            <button 
              onClick={() => setActiveTab('logs')}
              className="text-xs font-bold text-[#1B4332] hover:underline flex items-center gap-1"
            >
              전체 보기 <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { id: 1, type: '보안', msg: '신규 관리자 "DayPoo_Admin" IP 접속 허용', time: '방금 전', color: COLORS.primary, icon: Shield },
              { id: 2, type: '결제', msg: '프리미엄 상점 황금 변기 아이템 결제 건수 증가', time: '5분 전', color: COLORS.accent, icon: ShoppingBag },
              { id: 3, type: '경고', msg: '마포구 인근 공중화장실 데이터 동기화 지연', time: '14분 전', color: COLORS.error, icon: AlertTriangle },
              { id: 4, type: '시스템', msg: '자동화 백업 및 AI 추천 로그 캐시 초기화 완료', time: '45분 전', color: COLORS.info, icon: RefreshCw },
            ].map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl bg-black/[0.02] border border-black/[0.03] transition-colors hover:bg-black/[0.04]">
                <div className="p-2.5 rounded-xl border" style={{ borderColor: `${log.color}20`, color: log.color, background: `${log.color}08` }}>
                  <log.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: log.color }}>{log.type}</span>
                    <span className="text-[10px] text-black/30 font-bold">{log.time}</span>
                  </div>
                  <p className="text-sm font-bold text-black/80 truncate">{log.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-6">
           <GlassCard 
             onClick={() => setActiveTab('add-item')}
             className="flex flex-col items-center justify-center text-center group cursor-pointer" glowColor={`${COLORS.primary}20`}
           >
              <div className="w-16 h-16 rounded-3xl bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-6">
                 <Plus size={32} />
              </div>
              <h4 className="font-black text-lg text-black">상점 아이템 추가</h4>
              <p className="text-xs text-black/50 font-bold mt-1 leading-tight">새로운 칭호나 아바타를<br/>단독 카탈로그에 등록하세요</p>
           </GlassCard>
           
           <GlassCard 
             onClick={() => setActiveTab('toilets')}
             className="flex flex-col items-center justify-center text-center group cursor-pointer" glowColor={`${COLORS.error}20`}
           >
              <div className="w-16 h-16 rounded-3xl bg-[#FF4B4B]/10 text-[#FF4B4B] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:-rotate-6">
                 <AlertTriangle size={32} />
              </div>
              <h4 className="font-black text-lg text-black">신고 현황 확인</h4>
              <p className="text-xs text-black/50 font-bold mt-1 leading-tight">대기 중인 12건의<br/>화장실 신고를 긴급 처리하세요</p>
           </GlassCard>

           <div className="col-span-2 p-6 rounded-[24px] bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white overflow-hidden relative shadow-xl shadow-green-900/30">
              <div className="relative z-10">
                <h4 className="text-xl font-black mb-1">시스템 최적화 점검</h4>
                <p className="text-sm text-white font-bold mb-6">현재 리소스 캐싱 사용률이 높습니다.<br/>정리하여 퍼포먼스를 극대화하세요.</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('system')}
                  className="px-6 py-3 rounded-2xl bg-white text-[#1B4332] font-black text-xs shadow-xl"
                >
                  지금 즉시 최적화 실행
                </motion.button>
              </div>
              <Zap className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
           </div>
        </div>
      </div>
    </div>
  );
};

// ── Screen: Users Management ─────────────────────────────────────────
const UsersView = () => {
  const users = [
    { id: 1, nick: '황금변기왕', email: 'king@poop.com', joined: '2024.03.15', points: '12,500', status: '정상', badge: 'PRO' },
    { id: 2, nick: '변비탈출러', email: 'escape@drain.com', joined: '2024.03.20', points: '8,200', status: '주의', badge: 'FREE' },
    { id: 3, nick: '새벽배변러', email: 'dawn@morning.com', joined: '2024.03.22', points: '14,900', status: '정지', badge: 'BASE' },
    { id: 4, nick: '급똥전문가', email: 'expert@urgent.com', joined: '2024.03.23', points: '2,100', status: '정상', badge: 'PRO' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-black">유저 데이터 센터</h3>
          <p className="text-sm text-black/60 font-bold">글로벌 사용자 현황 및 계정 규제 관리</p>
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-2.5 rounded-2xl bg-black text-white font-black text-xs shadow-lg">사용자 리포트 추출</button>
        </div>
      </div>

      <GlassCard className="p-0 border-none bg-transparent shadow-none">
        <div className="overflow-x-auto rounded-[28px] border bg-white/50 backdrop-blur-xl" style={{ borderColor: COLORS.border }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b" style={{ borderColor: COLORS.border }}>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40">사용자 정보</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40">가입일</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40">포인트</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40">계정 상태</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b transition-colors hover:bg-black/[0.01]" style={{ borderColor: COLORS.border }}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-black/[0.05] flex items-center justify-center font-black text-black/60">{u.id}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#1B4332]">{u.nick}</span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-black/5 text-black/40">{u.badge}</span>
                        </div>
                        <p className="text-xs text-black/30 font-bold">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-black/60">{u.joined}</td>
                  <td className="px-8 py-5 font-black text-[#E8A838]">{u.points} P</td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${u.status === '정상' ? 'bg-green-100 text-green-700' : u.status === '주의' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 rounded-xl hover:bg-black/5 text-black/20 hover:text-black/60 transition-colors">
                      <Settings size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

// ── Screen: Map & Toilets Management ──────────────────────────────────
const ToiletsView = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedToilet, setSelectedToilet] = useState<ToiletData | null>(null);
  const [mapScale, setMapScale] = useState(3);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5172, lng: 127.0473 }); // 강남구청 중심 소폭 조절

  const { toilets: apiToilets, loading } = useToilets({
    lat: mapCenter.lat,
    lng: mapCenter.lng,
    radius: 1000,
    level: mapScale
  });

  // API 실패 시 fallback으로 MOCK_TOILETS 사용 (UI 깨짐 방지)
  const toilets = apiToilets.length > 0 ? apiToilets : MOCK_TOILETS;

  // 1. 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    const { kakao } = window as any;
    if (!kakao) return;

    kakao.maps.load(() => {
      const options = {
        center: new kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
        level: mapScale
      };
      const map = new kakao.maps.Map(mapContainerRef.current, options);
      mapRef.current = map;

      // 지도 이동 시 센터 업데이트 (useToilets 훅 트리거)
      kakao.maps.event.addListener(map, 'idle', () => {
        const center = map.getCenter();
        setMapCenter({ lat: center.getLat(), lng: center.getLng() });
        setMapScale(map.getLevel());
      });
    });
  }, []);

  // 2. 마كر 업데이트
  useEffect(() => {
    if (!mapRef.current || !toilets) return;
    const { kakao } = window as any;

    // 기존 마커 제거
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // 신규 마커 추가
    const newMarkers = toilets.map((t) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(t.lat, t.lng),
        map: mapRef.current,
        title: t.name
      });

      kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedToilet(t);
      });

      return marker;
    });

    markersRef.current = newMarkers;
  }, [toilets]);

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
              <div className="relative h-[750px] rounded-[32px] overflow-hidden border-4 border-white shadow-2xl">
                {/* Real Kakao Map Container */}
                <div id="map" ref={mapContainerRef} className="w-full h-full" />
                
                {/* Map Overlay Controls (Custom Style) */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                   <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl border shadow-xl flex flex-col gap-1">
                      <button onClick={() => mapRef.current?.setLevel(mapRef.current.getLevel() - 1)} className="p-2 rounded-xl hover:bg-black/5 transition-colors text-[#1B4332]"><Plus size={18} /></button>
                      <button onClick={() => mapRef.current?.setLevel(mapRef.current.getLevel() + 1)} className="p-2 rounded-xl hover:bg-black/5 transition-colors font-black text-lg text-[#1B4332]" style={{ lineHeight: 1 }}>-</button>
                   </div>
                   <button onClick={() => {
                     if (navigator.geolocation) {
                       navigator.geolocation.getCurrentPosition((pos) => {
                         const latlng = new (window as any).kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                         mapRef.current?.setCenter(latlng);
                       });
                     }
                   }} className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border shadow-xl hover:bg-white transition-colors">
                      <Navigation size={18} className="text-[#1B4332]" />
                   </button>
                </div>

                {/* Status Overlay */}
                <div className="absolute bottom-6 left-6 right-6 z-10">
                   <GlassCard className="bg-white/95 py-4 px-6">
                      <div className="flex items-center justify-between">
                         <div className="flex gap-4">
                            <div className="p-2.5 rounded-2xl bg-green-50 text-green-600">
                               <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </div>
                            <div>
                               <p className="text-xs font-black text-black/70">실시간 데이터 스트림</p>
                               <p className="text-sm font-black tracking-tight text-black">현재 영역 {toilets.length}개 노드 활성</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-amber-400' : 'bg-green-500'} animate-pulse`} />
                            <span className="text-[10px] font-black uppercase text-black/60">{loading ? 'Syncing...' : 'Sync OK'}</span>
                         </div>
                      </div>
                   </GlassCard>
                </div>
             </div>

             {/* Selected Toilet Detail (Admin View) */}
             <AnimatePresence>
               {selectedToilet && (
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 20 }}
                 >
                   <GlassCard className="border-2 border-[#E8A838]/30">
                     <div className="flex justify-between items-start mb-6">
                       <div className="flex gap-4">
                         <div className="w-16 h-16 rounded-[24px] bg-[#1B4332]/5 flex items-center justify-center text-3xl">
                           💩
                         </div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <h4 className="text-lg font-black">{selectedToilet.name}</h4>
                             <span className="text-[10px] bg-black/5 px-2 py-0.5 rounded-md font-bold text-black/40">ID: {selectedToilet.id}</span>
                           </div>
                           <p className="text-sm text-black/40 font-bold">{selectedToilet.roadAddress}</p>
                           <div className="flex items-center gap-2 mt-2">
                             <div className="flex gap-0.5 text-[#E8A838]">
                               <Star size={14} fill="currentColor" />
                               <span className="text-xs font-black ml-1">{selectedToilet.rating || 0}</span>
                             </div>
                             <span className="text-[10px] text-black/20 font-black uppercase italic tracking-widest">Global Master Data</span>
                           </div>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <button className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-black shadow-lg shadow-green-900/20">수정</button>
                         <button onClick={() => setSelectedToilet(null)} className="p-2 rounded-xl hover:bg-black/5"><X size={18} /></button>
                       </div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="p-4 rounded-2xl bg-black/[0.02] border">
                         <p className="text-[10px] font-black text-black/30 mb-1">개방 시간</p>
                         <p className="text-xs font-black">{selectedToilet.openTime || '24시간'}</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-black/[0.02] border">
                         <p className="text-[10px] font-black text-black/30 mb-1">방문 횟수</p>
                         <p className="text-xs font-black">{(selectedToilet.reviewCount || 0) * 12}회 (추산)</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-black/[0.02] border">
                         <p className="text-[10px] font-black text-black/30 mb-1">상태</p>
                         <p className="text-xs font-black text-green-500 italic">Operating Normal</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-black/[0.02] border">
                         <p className="text-[10px] font-black text-black/30 mb-1">신고 지수</p>
                         <p className="text-xs font-black text-red-500">가중치 0.02</p>
                       </div>
                     </div>
                   </GlassCard>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="space-y-6">
             <GlassCard className="h-full">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="text-xl font-black text-black">긴급 이슈 큐</h4>
                   <button className="text-[10px] font-black uppercase tracking-widest text-[#1B4332] opacity-70 hover:opacity-100">Refresh</button>
                </div>
                <div className="space-y-4">
                   {[
                     { id: 1, loc: '강남구청 공중화장실', type: '위치 오차', time: '2시간 전', urgent: true, desc: '실제 입구 위치가 지도상 12m 남쪽에 있음' },
                     { id: 2, loc: '서울숲 중앙 화장실', type: '데이터 중복', time: '5시간 전', urgent: false, desc: 'T-102 노드와 동일한 장소로 추정' },
                     { id: 3, loc: '홍대 레드로드 지하', type: '폐쇄 신고', time: '1일 전', urgent: false, desc: '리모델링 공사로 인한 임시 폐쇄' },
                   ].map((issue) => (
                     <div key={issue.id} className="p-5 rounded-[28px] border transition-all hover:border-[#1B4332]/20 hover:bg-[#1B4332]/[0.02]" style={{ borderColor: COLORS.border }}>
                        <div className="flex items-center justify-between mb-2">
                           <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${issue.urgent ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                              {issue.type}
                           </span>
                           <span className="text-[10px] text-black/50 font-bold italic">{issue.time}</span>
                        </div>
                        <p className="font-black text-sm mb-1 leading-tight text-black">{issue.loc}</p>
                        <p className="text-[11px] font-bold text-black/60 mb-4">{issue.desc}</p>
                        <div className="flex gap-2">
                           <button className="flex-1 py-3 rounded-xl bg-black text-white text-[10px] font-black shadow-lg shadow-black/10">승인</button>
                           <button className="flex-1 py-3 rounded-xl border bg-red-50 text-[#FF4B4B] text-[10px] font-black hover:bg-red-100 transition-colors">거부</button>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="mt-8 pt-6 border-t border-dashed">
                   <button className="w-full py-4 rounded-2xl border-2 border-dashed border-black/10 text-[11px] font-black text-black/30 hover:bg-black/[0.02] transition-colors">
                      과거 해결된 이슈 아카이브 보기
                   </button>
                </div>
             </GlassCard>
          </div>
       </div>
    </div>
  );
};

// ── Screen: Customer Service ──────────────────────────────────────────
const CsView = () => {
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-black text-black">미답변 1:1 문의</h4>
                <span className="text-xs font-black text-red-500">12건 대기 중</span>
             </div>
             <div className="space-y-3">
                {[
                  { id: 1, title: '포인트 결제 오류가 발생했습니다', user: '급똥러12', date: '12분 전' },
                  { id: 2, title: '화장실 정보 수정이 안돼요', user: '데이터헌터', date: '45분 전' },
                  { id: 3, title: '계정이 갑자기 정지되었습니다', user: '억울한시민', date: '1시간 전' },
                ].map((q) => (
                  <div key={q.id} className="p-5 rounded-[24px] border border-black/[0.03] bg-black/[0.01] group cursor-pointer hover:bg-black/[0.04] transition-colors">
                     <p className="text-sm font-black mb-1 group-hover:text-[#1B4332] transition-colors text-black">{q.title}</p>
                     <div className="flex items-center gap-2 text-[11px] font-bold text-black/50">
                        <span>{q.user}</span>
                        <span className="w-1 h-1 rounded-full bg-black/20" />
                        <span>{q.date}</span>
                     </div>
                  </div>
                ))}
             </div>
          </GlassCard>

          <GlassCard className="bg-[#1B4332]/5 border-[#1B4332]/10 overflow-hidden">
             <div className="relative z-10 h-full flex flex-col">
                <h4 className="text-xl font-black mb-6 text-black">AI 답변 도우미</h4>
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2">
                   <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm ml-8 text-sm font-bold text-black/80">
                      사용자의 결제 로그를 분석한 결과, 03:15경 토스페이먼츠 통신 타임아웃이 확인되었습니다. 자동 환불 처리를 제안할까요?
                   </div>
                   <div className="bg-[#1B4332] p-4 rounded-2xl rounded-tl-none shadow-xl mr-8 text-sm font-bold text-white">
                      네, 사용자에게 알림톡을 발송하고 포인트를 전액 복구하세요.
                   </div>
                </div>
                <div className="mt-6 flex gap-2">
                   <input className="flex-1 bg-white border px-4 py-3 rounded-2xl text-xs font-bold outline-none ring-[#1B4332]/20 focus:ring-4 transition-all" placeholder="명령어를 입력하세요..." />
                   <button className="p-3 bg-[#1B4332] text-white rounded-2xl shadow-lg shadow-green-900/30"><Zap size={20} /></button>
                </div>
             </div>
             <div className="absolute top-0 right-0 p-8">
                <Activity className="w-32 h-32 opacity-[0.03] text-[#1B4332]" />
             </div>
          </GlassCard>
       </div>
    </div>
  );
};

// ── Screen: Store & Items Management ──────────────────────────────────
const StoreView = ({ setActiveTab }: { setActiveTab: (tab: AdminTab) => void }) => {
  const items = [
    { id: 1, name: '황금 변기 칭호', price: '5,000 P', sales: 124, status: '판매 중', color: '#E8A838' },
    { id: 2, name: '다이아 마커 아이콘', price: '12,000 P', sales: 86, status: '일시 품절', color: '#3B82F6' },
    { id: 3, name: '무지개 오라 이펙트', price: '8,000 P', sales: 42, status: '판매 중', color: '#52b788' },
    { id: 4, name: '투명 날개 액세서리', price: '15,000 P', sales: 12, status: '한정 판매', color: '#FF4B4B' },
  ];

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
             <GlassCard className="py-2 px-4 shadow-none border-dashed bg-transparent" glowColor="transparent">
                <span className="text-[10px] font-black uppercase text-[#1B4332]/50 mr-2">총 아이템</span>
                <span className="font-black text-[#E8A838]">124개</span>
             </GlassCard>
             <GlassCard className="py-2 px-4 shadow-none border-dashed bg-transparent" glowColor="transparent">
                <span className="text-[10px] font-black uppercase text-black/30 mr-2">이달의 매출</span>
                <span className="font-black text-[#1B4332]">₩ 4,284,000</span>
             </GlassCard>
          </div>
          <button onClick={() => setActiveTab('add-item')} className="flex items-center gap-2 px-6 py-3 bg-[#1B4332] text-white rounded-2xl font-black text-xs shadow-xl shadow-green-900/20">
             <Plus size={16} /> 신규 아이템 등록
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {items.map((item) => (
             <GlassCard key={item.id} className="group cursor-pointer">
                <div className="w-full aspect-square rounded-[24px] mb-4 bg-black/[0.02] flex items-center justify-center relative overflow-hidden">
                   <div className="w-16 h-16 rounded-full blur-3xl opacity-20 absolute" style={{ background: item.color }} />
                   <div className="p-6 transition-transform group-hover:scale-110 duration-500">
                      <ShoppingBag size={48} style={{ color: item.color }} />
                   </div>
                   <div className="absolute top-3 right-3">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white border text-black/40">ID {item.id}</span>
                   </div>
                </div>
                <h5 className="font-black text-sm mb-1 text-black">{item.name}</h5>
                <p className="font-black text-lg mb-4" style={{ color: item.color }}>{item.price}</p>
                <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: COLORS.border }}>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-black/40 uppercase tracking-widest">누적 판매</span>
                      <span className="text-sm font-black text-black/80">{item.sales} 건</span>
                   </div>
                   <span className={`text-[10px] font-black italic ${item.status === '판매 중' ? 'text-green-500' : 'text-red-500'}`}>{item.status}</span>
                </div>
             </GlassCard>
          ))}
       </div>
    </div>
  );
};

// ── Screen: System Settings ───────────────────────────────────────────
const SystemView = () => {
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <GlassCard>
                <h4 className="text-xl font-black mb-6 text-black">서버 리소스 인프라 필터</h4>
                <div className="h-[240px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                         { name: 'Node 1', val: 78, color: '#1B4332' },
                         { name: 'Node 2', val: 92, color: '#FF4B4B' },
                         { name: 'Node 3', val: 45, color: '#E8A838' },
                         { name: 'Redis', val: 88, color: '#3B82F6' },
                         { name: 'PostGIS', val: 65, color: '#52b788' },
                      ]}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontStyle: 'italic', fontWeight: 'bold' }} />
                         <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                               return (
                                  <div className="bg-white p-3 rounded-xl border-4 border-black/5 shadow-2xl font-black text-xs text-black">
                                     {payload[0].value}% 부하 발생 중
                                  </div>
                               );
                            }
                            return null;
                         }} />
                         <Bar dataKey="val" radius={[8, 8, 8, 8]} barSize={40}>
                            {
                               [1, 2, 3, 4, 5].map((_, i) => (
                                  <Cell key={`cell-${i}`} fillOpacity={0.8} fill={['#1B4332', '#FF4B4B', '#E8A838', '#3B82F6', '#52b788'][i]} />
                               ))
                            }
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </GlassCard>

             <GlassCard>
                <h4 className="text-xl font-black mb-6 text-black">보안 프로토콜 제어</h4>
                <div className="divide-y" style={{ borderColor: COLORS.border }}>
                   {[
                      { label: '2단계 인증(MFA) 강제 적용', desc: '모든 관리자 로그인 시 모바일 인증 필수', active: true },
                      { label: 'IP 화이트리스트 필터링', desc: '사내 지정 IP 대역 외 접근 전면 차단', active: false },
                      { label: '데이터 자동 백업 주기', desc: '매일 새벽 04:00 증분 백업 실행 중', active: true },
                   ].map((item, i) => (
                      <div key={i} className="py-5 flex items-center justify-between">
                         <div>
                            <p className="font-black text-sm text-black">{item.label}</p>
                            <p className="text-xs text-black/60 font-bold">{item.desc}</p>
                         </div>
                         <div className={`w-12 h-6 rounded-full transition-all relative ${item.active ? 'bg-[#1B4332]' : 'bg-black/10'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                         </div>
                      </div>
                   ))}
                </div>
             </GlassCard>
          </div>

          <div className="space-y-6">
             <GlassCard className="border shadow-[0_20px_50px_rgba(27,67,50,0.1)]">
                <div className="mb-8 p-4 rounded-2xl bg-[#1B4332]/5 inline-block">
                   <Shield size={32} className="text-[#E8A838]" />
                </div>
                <h4 className="text-2xl font-black mb-2 tracking-tighter text-[#1B4332]">System Health</h4>
                <p className="text-[#2D6A4F] text-sm font-bold mb-8">모든 서비스 엔진이 정상 범주 내에서 응답하고 있습니다.</p>
                <div className="space-y-4">
                   <div className="p-4 rounded-2xl bg-[#1B4332]/5 border border-[#1B4332]/10">
                      <p className="text-[10px] font-black uppercase text-[#E8A838] mb-2 tracking-widest">Uptime</p>
                      <p className="text-3xl font-black tracking-tighter text-[#1B4332]">99.98<span className="text-sm font-bold ml-1 text-[#2D6A4F]">%</span></p>
                   </div>
                   <div className="p-4 rounded-2xl bg-[#1B4332]/5 border border-[#1B4332]/10">
                      <p className="text-[10px] font-black uppercase text-[#E8A838] mb-2 tracking-widest">Latent Response</p>
                      <p className="text-3xl font-black tracking-tighter text-[#1B4332]">14<span className="text-sm font-bold ml-1 text-[#2D6A4F]">ms</span></p>
                   </div>
                </div>
             </GlassCard>
          </div>
       </div>
    </div>
  );
};


// ── Screen: Add Item Form ─────────────────────────────────────────────
const AddItemView = ({ setActiveTab }: { setActiveTab: (tab: AdminTab) => void }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setActiveTab('store')} className="p-2 rounded-xl hover:bg-black/5 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h3 className="text-2xl font-black text-black">신규 상점 아이템 등록</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <GlassCard className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-black/10 bg-black/[0.01]">
            <ShoppingBag size={48} className="text-black/10 mb-4" />
            <p className="text-xs font-black text-black/30">이미지 업로드 (PNG/GIF)</p>
          </GlassCard>
        </div>
        <div className="md:col-span-2 space-y-6">
          <GlassCard>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-black/40 mb-2 block">아이템 명칭</label>
                <input className="w-full bg-black/[0.02] border border-black/5 px-5 py-4 rounded-2xl text-sm font-bold focus:ring-4 ring-[#1B4332]/10 outline-none transition-all text-black" placeholder="예: 황금 변기 칭호" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-black/40 mb-2 block">가격 (POOP POINT)</label>
                  <input className="w-full bg-black/[0.02] border border-black/5 px-5 py-4 rounded-2xl text-sm font-bold text-black" placeholder="5,000" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-black/40 mb-2 block">카테고리</label>
                  <select className="w-full bg-black/[0.02] border border-black/5 px-5 py-4 rounded-2xl text-sm font-bold text-black">
                    <option>칭호</option>
                    <option>아바타 아이콘</option>
                    <option>특수 이펙트</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-black/40 mb-2 block">아이템 설명</label>
                <textarea className="w-full bg-black/[0.02] border border-black/5 px-5 py-4 rounded-2xl text-sm font-bold h-32 resize-none text-black" placeholder="아이템에 대한 상세 설명을 입력하세요..." />
              </div>
              <div className="pt-4 flex gap-4">
                <button className="flex-1 py-4 bg-[#1B4332] text-white rounded-2xl font-black shadow-xl shadow-green-900/20">등록 완료</button>
                <button onClick={() => setActiveTab('store')} className="flex-1 py-4 bg-black/5 text-black/60 rounded-2xl font-black">취소</button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// ── Screen: System Logs View ──────────────────────────────────────────
const LogsView = () => {
  // TODO: 백엔드 로그 API 연동 시 실제 데이터로 교체 필요 (현재 UI 데모용 mock 데이터)
  const logs = [
    { id: 1, type: 'SECURITY', msg: 'Admin login detected from 192.168.0.1', time: '15:02:11', status: 'OK' },
    { id: 2, type: 'API', msg: 'GET /api/v1/toilets response 200', time: '15:01:45', status: 'OK' },
    { id: 3, type: 'DB', msg: 'PostGIS query took 42ms', time: '15:01:30', status: 'SLOW' },
    { id: 4, type: 'AUTH', msg: 'JWT Token refreshed for user id: 402', time: '15:00:55', status: 'OK' },
    { id: 5, type: 'WARN', msg: 'Cache hit rate dropped below 80%', time: '14:58:22', status: 'WARN' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-black">실시간 시스템 로그</h3>
          <p className="text-sm font-bold text-black/40">백엔드 및 인프라 엔진의 모든 런타임 이벤트를 모니터링합니다.</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-black text-white font-black text-[10px] uppercase shadow-lg">Export CSV</button>
      </div>
      <GlassCard className="p-0 border-none bg-transparent shadow-none">
        <div className="overflow-x-auto rounded-[28px] border bg-white/50 backdrop-blur-xl" style={{ borderColor: COLORS.border }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b" style={{ borderColor: COLORS.border }}>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40">Timestamp</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40">Type</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40">Message</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-black/40 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b transition-colors hover:bg-black/[0.01]" style={{ borderColor: COLORS.border }}>
                  <td className="px-8 py-5 text-xs font-bold text-black/60">{log.time}</td>
                  <td className="px-8 py-5 text-[10px] font-black text-black/30 tracking-widest">{log.type}</td>
                  <td className="px-8 py-5 text-sm font-black text-black">{log.msg}</td>
                  <td className="px-8 py-5 text-right flex justify-end">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${log.status === 'OK' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

// ── Main Page Layout: Admin Dashboard ─────────────────────────────────
export function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f8faf9] text-[#1B4332] font-black tracking-widest text-xl">LOADING ENGINE...</div>;
  if (!user || (user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN')) {
    return <Navigate to="/404-not-found-unauthorized" replace />;
  }

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'users', label: '유저 관리', icon: Users, badge: 12 },
    { id: 'toilets', label: '화장실 관리', icon: MapPin, badge: 4 },
    { id: 'cs', label: '고객 지원', icon: MessageSquare, badge: 7 },
    { id: 'store', label: '프리미엄 상점', icon: ShoppingBag },
    { id: 'system', label: '시스템 설정', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-['Pretendard']" style={{ background: COLORS.background }}>
      
      {/* 🔮 Sidebar Navigation */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 96 : 300 }}
        className="h-full border-r bg-white/80 backdrop-blur-3xl z-30 transition-all flex flex-col py-8"
        style={{ borderColor: COLORS.border }}
      >
        <div className={`mb-12 px-6 flex items-center justify-between ${sidebarCollapsed ? 'justify-center mx-auto' : ''}`}>
          {!sidebarCollapsed && (
             <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-black" style={{ fontFamily: "'SchoolSafetyNotification'", color: COLORS.primary, letterSpacing: '-0.05em' }}>
               Day<span style={{ color: COLORS.accent }}>.</span>Poo
               <span className="ml-2 px-2 py-0.5 text-[9px] bg-[#E8A838]/20 text-[#E8A838] rounded-lg">ADMIN</span>
             </motion.span>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-xl hover:bg-black/5 transition-colors">
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 w-full space-y-2 px-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className="group relative w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all overflow-hidden"
              style={{ color: activeTab === item.id ? COLORS.primary : COLORS.textSecondary }}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-[#1B4332]/5 border-r-[4px] border-[#1B4332]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <div className={`relative z-10 p-1.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#1B4332] text-white shadow-lg shadow-green-900/20' : 'group-hover:bg-black/5'}`}>
                <item.icon size={20} />
              </div>
              {!sidebarCollapsed && (
                <span className="relative z-10 text-sm font-black tracking-tight flex-1 text-left">{item.label}</span>
              )}
              {item.badge && !sidebarCollapsed && (
                <span className="relative z-10 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#FF4B4B] text-white">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="w-full px-4 mt-auto">
           <button className="w-full py-4 rounded-2xl flex items-center gap-4 px-4 transition-colors hover:bg-red-50 text-red-500 font-bold text-sm">
             <div className="p-1.5 rounded-xl bg-red-100"><LogOut size={20} /></div>
             {!sidebarCollapsed && <span>로그아웃</span>}
           </button>
        </div>
      </motion.aside>

      {/* 🚀 Main Content Shell */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative flex flex-col">
          
          {/* 🧩 Header / TopBar */}
          <header className={`sticky top-0 z-20 px-8 py-5 flex items-center justify-between transition-all backdrop-blur-md border-b bg-white/40`} style={{ borderColor: COLORS.border }}>
             <div className="flex items-center gap-4">
               <div className="p-2.5 rounded-2xl bg-white shadow-sm border" style={{ borderColor: COLORS.border }}>
                  {activeTab === 'dashboard' ? <LayoutDashboard size={20} style={{ color: COLORS.primary }} /> : 
                   activeTab === 'users' ? <Users size={20} style={{ color: COLORS.primary }} /> :
                   activeTab === 'toilets' ? <MapPin size={20} style={{ color: COLORS.primary }} /> :
                   activeTab === 'cs' ? <MessageSquare size={20} style={{ color: COLORS.primary }} /> :
                   activeTab === 'store' ? <ShoppingBag size={20} style={{ color: COLORS.primary }} /> :
                   <Settings size={20} style={{ color: COLORS.primary }} />}
               </div>
               <div className="flex flex-col">
                     <h2 className="text-sm font-black text-black/90 uppercase tracking-widest">
                       {activeTab === 'dashboard' ? '관리자 대시보드' : 
                        activeTab === 'users' ? '유저 제어 센터' :
                        activeTab === 'toilets' ? '맵 엔진 관제' :
                        activeTab === 'cs' ? '고객 통합 지원' :
                        activeTab === 'store' ? '프리미엄 샵 관리' :
                        activeTab === 'add-item' ? '신규 아이템 카탈로그' :
                        activeTab === 'logs' ? '시스템 런타임 로그' :
                        '시스템 인프라 설정'}
                     </h2>
                 <div className="flex items-center gap-2 text-[11px] text-black/40 font-bold">
                    <Calendar size={12} /> {currentTime.toLocaleDateString()}
                    <Clock size={12} className="ml-2" /> {currentTime.toLocaleTimeString()}
                 </div>
               </div>
             </div>

             <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center bg-black/[0.03] border px-4 py-2.5 rounded-2xl gap-2 focus-within:bg-white focus-within:ring-2 ring-[#1B4332]/20 transition-all" style={{ borderColor: COLORS.border }}>
                   <Search size={16} className="text-black/30" />
                   <input type="text" placeholder="통합 검색 (유저/신고/상점)" className="bg-transparent border-none outline-none text-xs font-bold w-56" />
                </div>
                
                <div className="flex items-center gap-3 pr-4 border-r" style={{ borderColor: COLORS.border }}>
                   <button className="p-2.5 rounded-2xl hover:bg-black/5 transition-colors relative">
                      <Bell size={20} className="text-black/50" />
                      <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#FF4B4B] rounded-full ring-2 ring-white"></span>
                   </button>
                </div>

                <div className="flex items-center gap-3 group cursor-pointer pl-2">
                   <div className="text-right hidden sm:block">
                      <p className="text-sm font-black text-black/80 leading-none">시스템 마스터</p>
                      <p className="text-[10px] font-bold text-black/30 mt-1 uppercase tracking-tighter">최고 관리자 계정</p>
                   </div>
                   <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden shadow-md border-2 border-[#1B4332]/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                      <span className="text-xl">💩</span>
                   </div>
                </div>
             </div>
          </header>

          {/* 🌈 View Container */}
          <section className="flex-1 p-8">
             <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
                  {activeTab === 'users' && <UsersView />}
                  {activeTab === 'toilets' && <ToiletsView />}
                  {activeTab === 'cs' && <CsView />}
                  {activeTab === 'store' && <StoreView setActiveTab={setActiveTab} />}
                  {activeTab === 'system' && <SystemView />}
                  {activeTab === 'add-item' && <AddItemView setActiveTab={setActiveTab} />}
                  {activeTab === 'logs' && <LogsView />}
                </motion.div>
             </AnimatePresence>
          </section>

      </main>

      {/* 🎇 Background Decoration */}
      <div className="fixed top-0 right-0 -z-10 w-[800px] h-[800px] bg-[#1B4332]/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-[#E8A838]/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
    </div>
  );
}
