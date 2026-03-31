# 🚀 배포 오류 해결 및 자동화 최적화 계획

현재 AWS 배포 과정에서 발생한 `docker-compose` 명령어 부재 문제를 해결하고, 전체적인 배포 안정성을 높이기 위한 계획입니다.

## 🎯 목표

- GitHub Actions에서 발생한 `docker-compose: command not found` 오류 해결
- 최신 Docker Compose V2(`docker compose`)로 전환
- 배포 스크립트의 안정성 강화 (set -e 도입 등)
- 최종 배포 후 사이트 정상 작동(504 에러 해결) 확인

## 🛠 분석 결과

- **현상:** GitHub Actions Job 3 (Deploy to EC2)은 성공으로 뜨지만, 실제 EC2 내부 로그에서 `docker-compose` 명령어를 찾지 못해 컨테이너가 갱신되지 않음
- **원인:** 최신 Docker 환경(EC2)에서는 `docker-compose`(독립 바이너리) 대신 Docker 플러그인 형태인 `docker compose`를 권장하며, 기존 명령어가 설치되어 있지 않을 가능성이 높음
- **결과:** 이전 버전의 컨테이너가 떠 있거나, 컨테이너가 죽은 상태에서 갱신되지 않아 CloudFront에서 504 Gateway Timeout 발생

## 📋 작업 단계

### Phase 1: 워크플로우 파일 수정 (`.github/workflows/deploy-aws.yml`)

- [ ] 실행 스크립트 상단에 `set -e` 추가 (명령어 실패 시 즉시 중단 및 에러 보고)
- [ ] 모든 `docker-compose` 명령어를 `docker compose`로 수정
- [ ] 인코딩 문제 방지를 위한 `printf` 구문 점검

### Phase 2: 배포 실행 및 모니터링

- [ ] 수정한 워크플로우를 `main` 브랜치에 푸시
- [ ] GitHub Actions 실행 상태 및 상세 로그 모니터링
- [ ] `docker compose pull` 및 `up -d` 성공 여부 확인

### Phase 3: 최종 검증 (브라우저 확인)

- [ ] 배포 URL(`https://d18knl7kbyubx3.cloudfront.net`) 접속
- [ ] 푸터(Footer) 디자인 수정 사항 반영 여부 확인
- [ ] 랭킹 페이지 등 API 호출이 504에서 벗어나 정상 데이터(200)를 수신하는지 확인

## ⚠️ 주의사항

- 배포 중 다운타임 발생 가능성이 있으나, 수 초 내외로 예상됩니다.
- DB 연결 오류 등 2차적인 장애가 있는지 배포 로그를 세밀히 관찰하겠습니다.

---
[✅ 규칙을 잘 수행했습니다.]
