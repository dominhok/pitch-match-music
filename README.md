# 🎵 PitchMatch - AI 기반 음악 추천 서비스

**PitchMatch**는 사용자의 **음역대**를 분석하여 **맞춤 음악을 추천하는 서비스**입니다.  
🎤 **마이크로 녹음한 목소리를 분석**하여 최고 음역을 감지하고, **개인화된 음악 추천**을 제공합니다.  

## 📌 주요 기능

- 🎙 **음역대 분석**: 사용자의 최고 음역을 감지하여 분석
- 🎼 **맞춤 음악 추천**: 최고음에 맞는 음악을 추천
- 🎵 **YouTube API 연동**: 추천 음악을 바로 감상 가능

## 🛠️ 기술 스택

| 구분 | 사용 기술 |
|------|----------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | FastAPI (Python) |
| **Database** | CSV (음악 데이터 저장) |
| **API 연동** | YouTube Data API, OpenAI GPT-4 API |
| **Hosting** | FastAPI |

## 🚀 시작하기

### 1. 가상 환경 생성 및 패키지 설치
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. FastAPI 서버 실행
```bash
uvicorn app:app --host 0.0.0.0 --port 8102 --reload
```

### 3. 프론트엔드 실행
브라우저에서 http://localhost:8102/ 접속

## 🌟 사용 방법

### 1️⃣ 음역대 분석
1. 웹사이트에서 마이크 버튼 클릭
2. 자신의 최고 음역을 녹음
3. AI가 음역대를 분석하여 결과 제공

### 2️⃣ 맞춤 음악 추천
1. 음역 분석 결과 확인
2. 최고음에 맞는 노래 추천
3. YouTube API를 통해 직접 재생 가능

## 📡 API 문서 (FastAPI 기반)

### 1️⃣ 음역대 분석 API
**엔드포인트**: `/analyze-audio`  
**메서드**: POST  
**요청 데이터**:
```json
{
  "audios": [
    {
      "key": "recordedAudio1",
      "base64_audio": "<Base64 인코딩된 오디오 데이터>"
    }
  ]
}
```
**응답 데이터**:
```json
{
  "highest_note": "A4"
}
```

### 2️⃣ 음악 추천 API
**엔드포인트**: `/recommend-music`  
**메서드**: POST  
**요청 데이터**:
```json
{
  "highest_note": "A4"
}
```
**응답 데이터**:
```json
{
  "recommendations": [
    {
      "title": "뚜두뚜두",
      "artist": "BLACKPINK",
      "genre": "K-POP",
      "highest_note": "A#4"
    }
  ]
}
```

## 🔗 YouTube API 연동

추천된 음악을 YouTube에서 바로 감상할 수 있습니다

📌 `recommend.js`에서 YouTube 검색 API 사용:
```javascript
const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id&q=${encodeURIComponent(songTitle)}&key=YOUR_YOUTUBE_API_KEY`;
```






