# 🎵 PitchMatch - AI 기반 음악 추천 서비스

**PitchMatch**는 사용자의 **음역대**를 분석하여 **맞춤 음악을 추천하는 웹 서비스**입니다.  
🎤 사용자가 **마이크로 녹음한 목소리**를 AI 기술로 분석하여 **최고 음역(Highest Note)을 감지**하고, 이를 기반으로 **개인의 음역대에 맞는 음악 목록**을 추천합니다.

## 📌 주요 기능

- 🎙 **음역대 분석**: 사용자가 녹음한 오디오 파일을 AI 모델(PESTO)을 통해 분석하여 최고 음역을 감지하고 결과를 반환합니다.
- 🎼 **맞춤 음악 추천**: 분석된 최고 음역 정보를 바탕으로, 구축된 음악 데이터베이스에서 해당 음역대에 적합한 곡들을 필터링하여 추천 목록을 제공합니다.
- 🎵 **YouTube 연동**: 추천된 음악 목록에서 원하는 곡을 클릭하면, YouTube API를 통해 해당 곡의 관련 영상을 검색하고 감상할 수 있습니다.

## 🛠️ 기술 스택

| 구분 | 사용 기술 | 역할 |
|------|-----------|------|
| **Frontend** | HTML, CSS, JavaScript | 사용자 인터페이스 (녹음, 결과 표시, 음악 재생 요청) |
| **Backend** | FastAPI (Python), Uvicorn | API 서버 구축, 요청 처리, 비즈니스 로직 수행 |
| **AI / 음성 처리** | PESTO, Torchaudio, Vocal Remover | PESTO: 녹음된 음성에서 음높이(Pitch) 및 최고음 추정<br>Torchaudio: 오디오 데이터 처리<br>Vocal Remover: (옵션) 오디오에서 보컬 분리 기능 제공 |
| **Database** | CSV (`music_database.csv`) | 음악 메타데이터 (제목, 아티스트, 장르) 및 곡별 최고음 정보 저장 |
| **API 연동** | YouTube Data API | 추천 곡 관련 YouTube 영상 검색 및 제공 |
|           | OpenAI GPT-4 API |
| **Hosting** | Uvicorn | 개발 및 테스트 환경에서의 웹 서버 실행 |

## 📁 프로젝트 구조

```
├── ai/                   
│   ├── pesto/            # PESTO 모델의 핵심 구현 또는 관련 유틸리티 (pesto.ipynb)
│   ├── pesto_training/   # PESTO 모델 학습 과정 또는 파인튜닝 코드 (pesto_training.ipynb, pesto-full/)
│   ├── vocal-remover/    # 오디오 파일에서 보컬 음성을 분리하는 기능 (vocal-remover.ipynb)
│   └── pesto_pretrained.ipynb # 사전 학습된 PESTO 모델을 로드하여 음높이 예측을 수행하는 예제 코드
├── backend/              # 백엔드 서버 및 관련 로직
│   ├── frontend/         # 정적 웹 파일 (HTML, CSS, JS) 서빙을 위한 디렉토리
│   ├── __pycache__/      
│   ├── app.py            # FastAPI 애플리케이션의 메인 진입점. API 라우팅
│   ├── music_database.csv # 곡명, 가수, 장르, 최고음 등의 정보가 담긴 데이터 파일
│   ├── recommend_music.py # 사용자의 최고음을 입력받아 music_database.csv를 참조하여 음악을 추천하는 로직 구현
│   └── segment_pitch.py  # 입력된 오디오 파일을 처리 가능한 단위로 분할하고, PESTO 모델을 호출하여 음높이를 분석하는 기능 수행 추정
├── .git/                 
├── .gitignore            
├── README.md             
└── requirements.txt      
```

## ⚙️ 세부 동작 흐름

1.  **사용자**: 프론트엔드(웹 브라우저)에서 마이크 버튼을 눌러 자신의 최고음을 녹음합니다.
2.  **프론트엔드**: 녹음된 오디오 데이터를 Base64 인코딩하여 백엔드의 `/analyze-audio` API로 전송합니다.
3.  **백엔드 (`app.py`)**: 요청을 받아 오디오 데이터를 디코딩하고, `segment_pitch.py` (및 PESTO 모델)를 호출하여 최고음을 분석합니다.
4.  **백엔드**: 분석된 최고음(`highest_note`)을 프론트엔드로 응답합니다.
5.  **프론트엔드**: 분석 결과를 사용자에게 표시하고, `/recommend-music` API 호출을 준비합니다.
6.  **프론트엔드**: 사용자가 추천 요청 시, 분석된 최고음 정보를 `/recommend-music` API로 전송합니다.
7.  **백엔드 (`app.py`)**: 요청을 받아 `recommend_music.py`를 호출합니다.
8.  **백엔드 (`recommend_music.py`)**: `music_database.csv`를 읽어 해당 최고음에 맞는 곡 목록을 필터링하고, 추천 결과를 생성합니다.
9.  **백엔드**: 추천 곡 목록을 프론트엔드로 응답합니다.
10. **프론트엔드**: 추천 곡 목록을 사용자에게 표시합니다. 사용자가 특정 곡 재생을 원하면 YouTube API를 호출하여 관련 영상을 보여줍니다.

## 🚀 시작하기

### 사전 요구 사항

*   Python 3.x 설치
*   (필요시) YouTube Data API 키 발급 ([Google Cloud Console](https://console.cloud.google.com/)) 및 환경 변수 설정 또는 코드 내 반영 (`recommend.js` 참고)
*   (필요시) OpenAI API 키 발급 및 설정 (만약 GPT-4 API를 실제로 사용한다면)

### 1. 저장소 복제 및 가상 환경 생성
```bash
git clone <repository_url> # 저장소 주소를 입력하세요
cd pitch-match-music
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. 의존성 패키지 설치
```bash
pip install -r requirements.txt
```

### 3. FastAPI 서버 실행
프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다. (백엔드 코드가 루트에 있는 `app.py`를 기준으로 작성되었다고 가정)
```bash
uvicorn backend.app:app --host 0.0.0.0 --port 8102 --reload
# 만약 app.py가 루트에 있다면: uvicorn app:app --host 0.0.0.0 --port 8102 --reload
```
* `--reload` 옵션은 개발 중 코드 변경 시 서버 자동 재시작을 지원합니다.

### 4. 서비스 접속
웹 브라우저를 열고 `http://localhost:8102` 또는 `http://<서버 IP>:8102` 로 접속합니다.

## 🌟 사용 방법

1.  **음역대 측정**: 웹 페이지의 '마이크 녹음 시작' 버튼을 클릭하고 안내에 따라 편안하게 가장 높은 소리를 내어 녹음합니다. 녹음 완료 후 '분석하기' 버튼을 누릅니다.
2.  **결과 확인**: 잠시 후 AI가 분석한 사용자의 최고음 결과(예: 'A4', 'C5')가 화면에 표시됩니다.
3.  **음악 추천 받기**: '내 음역대에 맞는 노래 추천받기' 버튼을 클릭합니다.
4.  **추천 목록 확인**: 사용자의 최고음에 맞는 추천 곡 목록(제목, 아티스트, 장르, 원곡 최고음)이 나타납니다.
5.  **음악 감상**: 목록에서 듣고 싶은 곡을 클릭하면 YouTube 검색 결과가 연동되어 관련 영상을 바로 감상할 수 있습니다.

## 📡 API 문서 (FastAPI 기반)

FastAPI 서버 실행 후 `http://localhost:8102/docs` 로 접속하면 Swagger UI를 통해 API 문서를 확인하고 직접 테스트해볼 수 있습니다.

### 1️⃣ 음역대 분석 API
- **엔드포인트**: `/analyze-audio`
- **메서드**: `POST`
- **설명**: Base64로 인코딩된 오디오 데이터를 받아 PESTO 모델을 이용해 최고음을 분석합니다.
- **요청 본문 (Request Body)**:
  ```json
  {
    "audios": [
      {
        "key": "recordedAudio1", 
        "base64_audio": "<Base64 인코딩된 WAV 또는 유사 오디오 데이터>"
      }
    ]
  }
  ```
- **성공 응답 (Success Response)**:
  ```json
  {
    "highest_note": "A4"
  }
  ```
- **실패 응답 (Error Response)**: (예시)
  ```json
  {
    "detail": "Audio processing failed."
  }
  ```

### 2️⃣ 음악 추천 API
- **엔드포인트**: `/recommend-music`
- **메서드**: `POST`
- **설명**: 사용자의 최고음(`highest_note`)을 받아 `music_database.csv`에서 해당 음역대에 맞는 곡들을 추천합니다.
- **요청 본문 (Request Body)**:
  ```json
  {
    "highest_note": "A4"
  }
  ```
- **성공 응답 (Success Response)**:
  ```json
  {
    "recommendations": [
      {
        "title": "뚜두뚜두",
        "artist": "BLACKPINK",
        "genre": "K-POP",
        "highest_note": "A#4"
      },
      // ... 다른 추천 곡들 ...
    ]
  }
  ```
- **실패 응답 (Error Response)**: (예시)
  ```json
  {
    "detail": "No matching songs found for the given note."
  }
  ```

## 🔗 YouTube API 연동

- 추천된 음악을 클릭 시, 프론트엔드 JavaScript (`backend/frontend/recommend.js` 추정) 코드에서 YouTube Data API v3의 `search.list` 엔드포인트를 사용합니다.
- API 요청 시 `q` 파라미터에 `[곡 제목] [아티스트]` 형식으로 검색어를 구성하여 전송합니다.
- **주의**: YouTube API 사용을 위해서는 API 키 발급이 필요하며, 관련 할당량 및 정책을 준수해야 합니다. `recommend.js` 내 `YOUR_YOUTUBE_API_KEY` 부분을 실제 키로 교체하거나, 환경 변수 등을 통해 안전하게 관리해야 합니다.







