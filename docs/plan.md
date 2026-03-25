# 칭호 시스템 강화 작업 계획 (Titles API Expansion)

## 목적
사용자의 요청에 따라 칭호 해제 API를 추가하고, 유저 정보 및 칭호 목록 응답 데이터에 장착 상태 정보를 포함하도록 백엔드를 수정합니다.

## 작업 상세 내역

### 1. 칭호 해제 API 추가
- **`ShopController`**: `@DeleteMapping("/api/v1/shop/titles/equip")` 엔드포인트 추가.
- **`ShopService`**: `unequipTitle(User user)` 메서드 구현. 현재 장착된 칭호를 `null`로 설정합니다.

### 2. UserResponse에 칭호 정보 추가
- **`UserResponse`**: `equippedTitleId` 필드 추가.
- (선택 사항) `equippedTitleName` 필드 추가. 이를 위해 `UserResponse.from(User user, String titleName)`와 같이 시그니처를 확장하거나 내부 정합성을 고려합니다.

### 3. TitleResponse에 장착 여부 추가
- **`TitleResponse`**: `isEquipped` 필드 추가.
- **`ShopService.getAllTitles`**: 유저의 `equippedTitleId`와 각 칭호의 ID를 비교하여 `isEquipped` 값을 설정하도록 수정합니다.

## 작업 단계

### Step 1: DTO 수정
- `backend/src/main/java/com/daypoo/api/dto/UserResponse.java` 수정 (`equippedTitleId` 필드 추가)
- `backend/src/main/java/com/daypoo/api/dto/TitleResponse.java` 수정 (`isEquipped` 필드 추가)

### Step 2: 서비스(Service) 레이어 수정
- `backend/src/main/java/com/daypoo/api/service/ShopService.java` 수정:
  - `unequipTitle(User user)` 추가
  - `getAllTitles(User user)`에서 `isEquipped` 로직 반영

### Step 3: 컨트롤러(Controller) 레이어 수정
- `backend/src/main/java/com/daypoo/api/controller/ShopController.java` 수정:
  - `@DeleteMapping("/titles/equip")` 추가

### Step 4: 기록 및 반영
- `docs/backend-modification-history.md`에 작업 내역을 기록합니다.
- 변경 사항을 커밋하고 새로운 브랜치(`feat/title-system-expansion`)를 생성하여 푸시합니다.

## 검증 항목
- [ ] 칭호 해제 시 `users` 테이블의 `equipped_title_id`가 `null`이 되는지 확인.
- [ ] 내 정보 조회 시 `equippedTitleId`가 정확하게 포함되는지 확인.
- [ ] 칭호 목록 조회 시 현재 장착된 칭호에 `isEquipped: true`가 표시되는지 확인.

---
[✅ 규칙을 잘 수행했습니다.]
