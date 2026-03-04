<div align="center">

# 🗺️ PoopMap (대똥여지도)

**대한민국 공중화장실 커뮤니티 지도 서비스**

_React · Spring Boot · Python/FastAPI · Monorepo_

[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com)
[![Frontend](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=white)](./frontend)
[![Backend](https://img.shields.io/badge/Backend-Spring_Boot_3.2-6DB33F?logo=springboot&logoColor=white)](./backend)
[![AI](https://img.shields.io/badge/AI_Service-FastAPI-009688?logo=fastapi&logoColor=white)](./ai-service)
[![License](https://img.shields.io/badge/License-ISC-yellow)](./LICENSE)

</div>

---

## 📖 프로젝트 소개

**PoopMap(대똥여지도)** 는 대한민국 화장실 정보를 지도 위에 시각화하고, 사용자들이 직접 화장실 정보를 리뷰하고 공유할 수 있는 **커뮤니티 지도 서비스**입니다.

프론트엔드(React), 백엔드(Spring Boot), AI 서비스(Python/FastAPI)가 통합된 **Monorepo** 환경으로 구성되어 있습니다.

---

## 🏗️ 시스템 아키텍처

```
poopmap/ (Monorepo)
├── frontend/          # React 19 + Vite + Zustand + React Router
├── backend/           # Spring Boot 3.2 + Java 21 + JPA + MySQL
├── ai-service/        # Python + FastAPI (AI 추천 서비스)
├── .github/           # GitHub Actions CI/CD, PR/Issue 템플릿
├── .husky/            # Git Hook (Lint-staged, Commitlint)
└── docs/              # 온보딩 가이드, 아키텍처 문서
```

---

## 🛠️ 기술 스택

| 파트           | 기술                                    | 버전    |
| -------------- | --------------------------------------- | ------- |
| **Frontend**   | React                                   | 19.x    |
|                | Vite                                    | 7.x     |
|                | React Router                            | 7.x     |
|                | Zustand (상태관리)                      | 5.x     |
|                | Axios                                   | 1.x     |
|                | Lucide React (아이콘)                   | 0.576.x |
| **Backend**    | Spring Boot                             | 3.2.3   |
|                | Java                                    | 21      |
|                | Spring Data JPA                         | -       |
|                | MySQL                                   | -       |
|                | Lombok                                  | -       |
| **AI Service** | Python                                  | 3.11    |
|                | FastAPI                                 | -       |
| **DevOps**     | GitHub Actions                          | -       |
|                | Docker / Docker Compose                 | -       |
| **코드 품질**  | ESLint + Prettier (Frontend)            | -       |
|                | Spotless / Google Java Format (Backend) | -       |
|                | Flake8 + Black + isort (AI Service)     | -       |
|                | Husky + Lint-staged                     | -       |
|                | Commitlint (Conventional Commits)       | -       |

---

## 🚀 팀원 시작하기 (Getting Started)

### 사전 준비 (Prerequisites)

- **Node.js** 20 이상
- **Java JDK 21**
- **Python 3.11**
- **MySQL** (또는 Docker)
- **Git**

---

### 1단계: 저장소 Fork & Clone

> 우리 프로젝트는 **Fork 기반 협업 방식**을 사용합니다. 자세한 워크플로우는 [fork_workflow.md](./docs/onboarding/fork_workflow.md)를 꼭 먼저 읽어주세요!

```bash
# 1. 본인의 GitHub 계정으로 이 저장소를 Fork 합니다.

# 2. Fork한 저장소를 로컬에 Clone 합니다.
git clone https://github.com/<내-깃허브-계정>/poopmap.git
cd poopmap

# 3. 원본 저장소(upstream)를 등록합니다.
git remote add upstream https://github.com/<Organization>/poopmap.git
```

---

### 2단계: 루트 의존성 설치 (Git Hook 활성화)

> **반드시 루트 폴더에서 먼저 실행**해야 Husky(커밋 봇)가 정상 작동합니다!

```bash
# 루트 폴더에서 실행 (최초 1회)
npm install
```

---

### 3단계: 각 파트별 개발 환경 세팅

#### ⚛️ Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

#### ☕ Backend

```bash
cd backend

# 환경 변수 설정 (.env 또는 application-local.yml 참고)
# DB_URL, DB_USERNAME, DB_PASSWORD 등

./gradlew bootRun  # http://localhost:8080  (Windows: gradlew.bat bootRun)
```

#### 🐍 AI Service

```bash
cd ai-service

# 가상환경 생성 및 활성화
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
uvicorn main:app --reload     # http://localhost:8000
```

#### 🐳 Docker로 한 번에 실행 (선택)

```bash
# 루트 폴더에서
docker-compose up -d
```

---

## 🤝 협업 규칙 (Collaboration Rules)

> 전체 규칙은 [rules_guide.md](./docs/onboarding/rules_guide.md)를 참고하세요.

### 커밋 메시지 규칙 (Commitlint)

커밋 메시지는 반드시 `타입: 제목` 형식을 따라야 합니다. 어기면 **커밋 자체가 거부**됩니다.

```bash
# ✅ 올바른 예시
git commit -m "feat: 카카오맵 화장실 마커 렌더링 추가"
git commit -m "fix: 로그인 토큰 만료 오류 수정"
git commit -m "docs: README.md 아키텍처 다이어그램 업데이트"

# ❌ 틀린 예시 (커밋 실패)
git commit -m "로그인 추가"            # 타입 없음
git commit -m "Feat: 로그인 추가"     # 타입은 소문자
```

**사용 가능한 타입:**

| 타입       | 용도                    |
| ---------- | ----------------------- |
| `feat`     | 새로운 기능 추가        |
| `fix`      | 버그 수정               |
| `docs`     | 문서 변경               |
| `style`    | UI/CSS 변경 (로직 무관) |
| `refactor` | 코드 리팩토링           |
| `test`     | 테스트 코드             |
| `chore`    | 빌드/패키지 설정 변경   |

### 브랜치 전략

```
main                    # 운영 브랜치 (직접 push 금지)
└── feature/<기능명>    # 기능 개발 (권장)
└── hotfix/<버그명>     # 긴급 버그 수정 (권장)
```

### 코드 자동 포맷팅

`git commit` 시 **Husky + Lint-staged**가 자동으로 작동합니다:

| 파트                  | 도구                          |
| --------------------- | ----------------------------- |
| Frontend (JS/JSX/CSS) | ESLint + Prettier             |
| Backend (Java)        | Spotless (Google Java Format) |
| AI Service (Python)   | Black + isort + Flake8        |

---

## 📁 디렉토리 구조 상세

```
poopmap/
├── .github/
│   ├── workflows/             # CI/CD (GitHub Actions)
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── auto-push-pr.yml
│   └── ISSUE_TEMPLATE/        # 이슈/PR 템플릿
├── .husky/                    # Git Hook 설정
├── frontend/
│   ├── src/
│   │   ├── components/        # 재사용 UI 컴포넌트
│   │   ├── pages/             # 라우팅 페이지
│   │   ├── store/             # Zustand 상태 관리
│   │   └── api/               # Axios API 모듈
│   └── vite.config.js
├── backend/
│   └── src/main/java/com/ddmap/
│       ├── controller/        # REST API 컨트롤러
│       ├── service/           # 비즈니스 로직
│       ├── domain/            # 엔티티 모델
│       └── repository/        # JPA 리포지토리
├── ai-service/
│   ├── main.py                # FastAPI 엔트리포인트
│   └── requirements.txt
├── docs/
│   ├── onboarding/
│   │   ├── fork_workflow.md   # Fork 기반 협업 가이드
│   │   ├── rules_guide.md     # 커밋/린트 규칙 가이드
│   │   └── initial_setup_plan.md
│   └── architecture/          # 아키텍처 다이어그램
├── docker-compose.yml
├── commitlint.config.js
└── package.json               # 루트 (Husky/Commitlint 관리)
```

---

## 📅 프로젝트 히스토리

### 🚀 2026년 3월 4일 - Phase 1: 초기 개발 환경 세팅 완료

본격적인 기능 구현(Phase 2)에 앞서 팀원들과의 원활한 협업을 위한 **초기 환경 세팅 및 공통 가이드**가 완료되었습니다.

- **✅ 각 파트별 스캐폴딩 및 Lint 구축**
  - **Frontend** (`/frontend`): React 19 + Vite 초기화 및 ESLint, Prettier 설정 완료
  - **Backend** (`/backend`): Spring Boot 3.2 + Java 21 초기화 및 Spotless (Google Java Format) 설정 완료
  - **AI 서비스** (`/ai-service`): Python 3.11 가상환경 세팅 및 Flake8, Black, isort 설정 완료
- **✅ 중앙 집중형 협업 시스템 (Git Hook) 도입**
  - **Husky + Lint-staged**: 커밋 시 변경 파일 위치를 감지해 알맞은 포매터를 자동 실행
  - **Commitlint**: Conventional Commits 양식 강제 (PR 시 일관된 히스토리 유지)
- **✅ 팀원 협업 온보딩 가이드라인 가동**
  - `fork_workflow.md`: Fork 및 PR 기반 협업 사이클 5단계 가이드
  - `rules_guide.md`: 커밋 양식 예시 및 린트 규칙 설명
  - GitHub Issue/PR 템플릿 연결 완료

---

## 📄 라이선스

이 프로젝트는 [ISC License](./LICENSE)를 따릅니다.
