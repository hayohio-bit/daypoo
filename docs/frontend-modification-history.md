# Frontend Modification History

## [2026-04-01 18:02:00] MyPage Shop discountPrice Integration
- **작업 내용**: 마이페이지 상점 아이템 할인가(discountPrice) 연동 및 구매 로직 고도화
- **상세 변경 내역**:
  - `MyPage.tsx:AvatarItem`: `discountPrice` 필드를 인터페이스에 추가하여 타입 안정성 확보.
  - `MyPage.tsx:fetchShopData`: API 응답 데이터로부터 `discountPrice`를 추출하여 `AvatarItem` 객체에 매핑.
  - `MyPage.tsx:HomeTab`: 아이템 카드(`DeckCard`)의 `sublabel` 타입을 `React.ReactNode`로 확장하고, 할인가 적용 시 원가 취소선(strikethrough)과 할인가를 동시에 표시하는 프리미엄 UI 적용.
  - `MyPage.tsx:handleSave`: 아이템 구매 시 포인트 차감 기준을 `discountPrice` 우선으로 변경하여 경제 시스템 데이터 정합성 보장.
- **결과/영향**: 백엔드 할인 정책이 프론트엔드 UI와 구매 로직에 완벽히 반영되어 사용자가 정확한 가격으로 아이템을 구매할 수 있게 됨.

## [2026-04-01 17:58:00] Admin Dashboard UI/UX Redesign & Premium Shop Consistency
- **작업 내용**: 관리자 대시보드 성장 엔진 리포트 차트 고도화 및 프리미엄 상점 아이템 카드 UI 통일
- **상세 변경 내역**:
  - `AdminPage.tsx:DashboardView`: 성장 엔진 리포트 차트를 '모니터링 벨로시티' 컨셉으로 리디자인. 네온 글로우 필터, 커스텀 펄스 도트, 배경 해치 패턴 및 디지털 미터 플레이트 오버레이 추가로 가시성 및 전문성 강화.
  - `AdminPage.tsx:StoreView`: 상점 아이템 카드의 배경색을 `#F7F8F8`로 고정하고, 아이콘 영역 비율을 `70%`로 통일하여 아이콘 종류에 관계없이 일관된 배경 크기 유지.
  - `AdminPage.tsx:StoreView`: 카드 패딩 및 텍스트 레이아웃을 정교화하여 'Price Unit' 및 'Status' 영역을 명확히 구분하는 프리미엄 카드 디자인 적용.
- **결과/영향**: 데이터가 적을 때도 대시보드가 풍성해 보이며, 상점 아이템들이 정렬된 그리드 시스템 내에서 완벽한 시각적 균형을 이룸.

- **2026-04-01 17:50:00**
  - **작업 내용:** 어드민 상점 아이템 관리 시스템 고도화 (할인가 및 수정 기능 추가)
  - **상세 변경 내역:**
    - **할인 시스템 도입**: `ItemResponse` 및 DTO에 `discountPrice` 필드를 추가하고, 상점 아이템 등록/수정 시 할인가를 설정할 수 있는 로직을 백엔드와 연동했습니다.
    - **실시간 할인율 계산**: 가격과 할인가 입력 시 자동으로 할인율(%)을 계산하여 시각적 피드백을 제공하는 프리미엄 입력 UI를 구현했습니다.
    - **아이템 수정(Edit) 기능**: `EditItemView` 컴포넌트를 신규 제작하고, `lucide-react`의 `Pencil` 아이콘 기반 수정 버튼을 도입하여 등록된 아이템의 정보를 즉시 변경할 수 있는 워크플로우를 완성했습니다.
    - **상점 카드 UI 리디자인**: 아이템 카드에 수정 버튼을 배치하고, 할인 적용 시 기존 가격 취소선 및 강렬한 레드 컬러의 할인율 배지를 추가하여 정보 시인성을 극대화했습니다.
    - **백엔드 인증 안정화**: `SupportController` 등에서 `Principal` 기반 인증 주체 추출 방식을 적용하고, ID 비교 시 Null-safe한 `Objects.equals()`를 도입하여 시스템 안정성을 강화했습니다.
  - **결과/영향:** 관리자가 유연하게 가격 정책을 운영할 수 있는 토대를 마련했으며, 아이템 관리의 편의성과 데이터 처리의 견고함을 동시에 확보했습니다.
