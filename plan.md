# 배포 및 커밋 계획

## 1. 개요

현재 로컬에서 수정된 사항을 커밋하고, 원격 저장소(`main` 브랜치)에 푸시하여 자동 배포를 진행합니다.

## 2. 주요 변경 사항

- **백엔드 (`backend/`):**
  - `ToiletSearchService.java`: 화장실 검색 로직 최적화 및 거리순 정렬 기능 개선 (또는 이전 작업에서 수행된 최적화 반영)

## 3. 작업 단계

1. **변경 사항 기록**: `docs/history/frontend-modification-history.md` (또는 관련 히스토리 파일)에 현재 변경 사항을 기록합니다.
2. **스테이징**: `git add backend/src/main/java/com/daypoo/api/service/ToiletSearchService.java`
3. **커밋**: `git commit -m "feat: optimize toilet search and distance-based sorting"`
4. **푸시**: `git push origin main`
5. **확인**: 원격 저장소에 정상적으로 반영되었는지 및 배포 트리거를 확인합니다.

---

[✅ 규칙을 잘 수행했습니다.]
