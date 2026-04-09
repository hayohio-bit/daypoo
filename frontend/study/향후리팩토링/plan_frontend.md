# 프론트엔드 실시간 랭킹 시스템 리팩토링 스터디 계획서

현재 DayPoo 프론트엔드의 실제 코드 상태(`useState` + `axios fetch`, Recharts 미사용, 5종 Avatar 적용 등)와의 정합성을 철저히 반영하여, **기존의 한계를 짚고 현대적 표준 스택(RTK Query, Recharts 등)으로 전환하기 위한 "실무형 리팩토링 가이드"** 형식으로 스터디 자료를 구성합니다.

---

### ⚠️ 실제 프로젝트 프론트엔드 정합성 체크 포인트
1. **데이터 페칭(Data Fetching):** 현재 `useState` + `useCallback` + API 호출 구조의 한계점(순위 변동 캐싱, 페이지네이션 부족)을 분석하고 **RTK Query**로의 마이그레이션 방안을 제시합니다.
2. **데이터 시각화(Recharts):** 현재 포디움+리스트 UI만 존재하는 상태이므로, Recharts를 새롭게 도입하여 **상위 10명 점수 BarChart** 및 **순위 변동 RankHistory LineChart**를 추가하는 구현 명세서를 제공합니다.
3. **아바타(DiceBear):** 30종이 아닌, 현재 실제 사용 중인 5종(`funEmoji`, `avataaars`, `bottts`, `lorelei`, `pixelArt`) 스타일을 바탕으로 수백 명의 렌더링을 감당할 최적화(Virtualization 등) 방법을 포함합니다.
4. **API 엔드포인트/탭 구조:** 계획서 초안의 일간/주간/월간이 아닌, 실제 서비스되고 있는 **전체 랭킹(global) / 우리동네(region) / 건강왕(health)** 3개 탭 아키텍처를 기반으로 작성합니다.

---

### 📄 생성할 6개 스터디 파일 및 주요 내용 (위치: `frontend/study/frontend_ranking_Refactor/`)

#### 1. `01_랭킹_페이지_컴포넌트_트리_설계.md`
- 현재 `RankingPage`의 단일(Monolithic) 구조에서 모듈화 된 트리 구조로의 전환을 그리는 텍스트 다이어그램
- 탭 전환(전체/동네/건강왕) 및 각 뷰(포디움, 차트, 내 순위, 전체 리스트)의 Props 인터페이스 설계서
- **Refactoring Point:** Prop Drilling 방지 및 유지보수성 향상

#### 2. `02_RTK_Query_도입_및_마이그레이션_설계.md`
- 현재의 Legacy(`useState + fetch`) 코드(미설치 상태)가 가진 단점(메모리 낭비, 동기화 취약점) 분석
- 랭킹 데이터 관리를 위해 RTK Query(`redux-toolkit`)를 새롭게 도입할 때의 `createApi` 작성 및 스토어 설정 가이드
- `getRanking`, `getMyRanking` 엔드포인트 캐시(`tagTypes`) 전략 및 `pollingInterval` 적용 방안
- **Refactoring Point:** 절차적 비동기 페칭에서 선언적 페칭(Declarative Fetching)과 자동 캐싱으로의 전환

#### 3. `03_Recharts_데이터_시각화_상세_구현.md`
- Recharts 라이브러리 추가 적용안
- 상위 랭커 점수 스펙트럼(수평 BarChart) 및 내 점수 변동 이력(수직 Reversed LineChart) 구현 로직
- **Refactoring Point:** 단순 리스트를 넘어선 유저 리텐션 증가 컴포넌트 추가

#### 4. `04_Framer_Motion_랭킹_애니메이션_효과.md`
- 이미 훌륭하게 적용된 `AnimatePresence`, `RankAvatarEffect` 등을 짚어보며, 탭 이동 시 공유 요소 전환(`layoutId`) 및 `staggerChildren`을 사용한 리스트 순차 파도 애니메이션 적용
- **Refactoring Point:** 랭킹의 경쟁을 시각적으로 돋보이게 하는 마이크로 인터랙션 강화

#### 5. `05_DiceBear_아바타_연동_및_성능_최적화.md`
- 실제 사용 중인 5종 스타일(`avataaars`, `bottts` 등) 매핑 방식 확인 및 `toDataUri()` 캐싱
- 대규모 랭킹 스크롤 시의 브라우저 프리징을 막기 위한 Lazy Loading 및 Windowing(Virtual List) 설계 기법
- **Refactoring Point:** 메인 스레드 점유율 최소화 및 렌더링 성능 극대화

#### 6. `06_반응형_레이아웃_및_접근성_가이드.md`
- TailwindCSS 4 버전을 활용한 모바일/태블릿/데스크탑 뷰포트별 차트 노출 및 리스트 레이아웃 분기
- 스크린 리더용 `aria-label`, 포커스 관리, 그리고 동점자 및 랭크 변동의 색맹/색약 대응 UI 팔레트 정리
- **Refactoring Point:** 접근성 표준 만족과 모바일 UX 극한 추구

---
**진행 여부 확인:** 위 내용과 같이 실 사용 스택에 기반하여 기존 한계를 짚고 개선안을 제안하는 방향으로 프론트엔드 리팩토링 스터디 문서를 생성하겠습니다. 승인해 주시면 즉시 6개 파일 작성을 시작합니다!
