# PictchMatch
=======
# PitchMatch - 음역대 기반 음악 추천 서비스

PitchMatch는 사용자의 음역대를 분석하고, 해당 음역대에 적합한 음악을 추천하는 웹 서비스입니다. Pesto 모델을 활용한 음성 피치 추정(Pitch Estimation) 기능을 기반으로, 사용자의 보컬 특성을 정확하게 파악합니다.

## 주요 기능

- **음역대 분석:** 사용자의 목소리를 분석하여 최적의 음역대를 탐색
- **맞춤형 음악 추천:** 음역대에 맞는 곡 추천 및 연습 곡 제공
- **실시간 피드백:** 사용자가 노래를 부르는 동안 실시간 피드백 제공
- **웹 기반 서비스:** 별도의 설치 없이 브라우저에서 사용 가능

---

## 기술 스택

- **프론트엔드:** React, TailwindCSS
- **백엔드:** FastAPI, Python
- **모델:** Pesto (Pitch Estimation 모델)
- **데이터베이스:** PostgreSQL
- **클라우드:** AWS (S3, EC2, RDS)

---

## 설치 및 실행 방법

### 1. 사전 요구사항

- Python 3.8 이상
- Node.js 16 이상
- Docker (선택사항)

### 2. 프로젝트 클론

```bash
 git clone https://github.com/your-repo/pitchmatch.git
 cd pitchmatch
```

### 3. 백엔드 설정

1. 가상 환경 생성 및 활성화

```bash
 python -m venv venv
 source venv/bin/activate  # (Windows의 경우: venv\Scripts\activate)
```

2. 필수 패키지 설치

```bash
 pip install -r requirements.txt
```

3. 환경 변수 설정 (`.env` 파일 생성)

```
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@localhost:5432/pitchmatch
```

4. 백엔드 서버 실행

```bash
 uvicorn app.main:app --reload
```

### 4. 프론트엔드 설정

1. 프론트엔드 디렉토리로 이동

```bash
 cd frontend
```

2. 패키지 설치 및 실행

```bash
 npm install
 npm run dev
```

웹 브라우저에서 `http://localhost:3000`으로 접속하여 서비스를 확인할 수 있습니다.

---

## 사용 방법

1. 웹사이트에 접속
2. 마이크 접근 권한 허용
3. 간단한 음성 테스트 진행
4. 분석 결과 확인 및 음악 추천 받기

---

## API 엔드포인트

| 메서드 | 엔드포인트          | 설명                |
|--------|-------------------|---------------------|
| POST   | /analyze           | 사용자의 음역대 분석 |
| GET    | /recommendations   | 추천 곡 리스트 조회 |

---

## 프로젝트 구조

```
 pitchmatch/
 ├── backend/
 │   ├── app/
 │   │   ├── main.py
 │   │   ├── routes/
 │   │   ├── models/
 │   │   └── services/
 │   └── requirements.txt
 ├── frontend/
 │   ├── src/
 │   ├── public/
 │   ├── package.json
 │   └── next.config.js
 ├── Dockerfile
 ├── .env.example
 ├── README.md
 └── .gitignore
```

---

## 배포 방법

1. Docker 빌드 및 실행

```bash
 docker-compose up --build
```

2. AWS EC2 배포 (예시)

```bash
 ssh user@your-ec2-instance
 git pull origin main
 docker-compose up -d
```

---

## 기여 방법

1. 이슈 생성 및 할당
2. 새로운 기능 브랜치 생성 (`feature/your-feature`)
3. Pull Request 요청

---

## 라이선스

본 프로젝트는 MIT 라이선스를 따릅니다.

---

## 문의

서비스 관련 문의 및 피드백은 다음 이메일을 통해 연락 바랍니다.

- 이메일: support@pitchmatch.com
- GitHub: [PitchMatch Repository](https://github.com/your-repo/pitchmatch)

---

감사합니다!

>>>>>>> e16379ee6511120c66a01563ab2dc46c79da2bae
