import os
import io
import base64
import logging
import csv
import random
import segment_pitch  # segment_pitch 모듈을 가져옵니다.
import recommend_music  # 모듈로부터 음악 추천 기능을 가져옵니다.
import tempfile
from typing import List, Dict
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pydub import AudioSegment
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent
FRONTEND_DIR = BASE_DIR / "frontend"
FAVICON_PATH = FRONTEND_DIR / "favicon.ico"

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    if FAVICON_PATH.exists():
        return FileResponse(FAVICON_PATH)
    raise HTTPException(status_code=404, detail="favicon.ico 파일을 찾을 수 없습니다.")

@app.get("/")
async def serve_home():
    index_file = FRONTEND_DIR / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="index.html 파일을 찾을 수 없습니다.")
    return FileResponse(index_file)

# CSV 파일 경로
CSV_FILE_PATH = "C:\\Users\\minho\\Desktop\\web\\pitch-match-music\\backend\\music_database.csv"

# 오디오 분석 관련 모델
class AudioEntry(BaseModel):
    key: str
    base64_audio: str

class AudioData(BaseModel):
    audios: List[AudioEntry]

# 음악 추천 관련 모델
class MusicRecommendationRequest(BaseModel):
    highest_note: str

def get_pitch(note: str) -> int:
    note = note.replace("♯", "#").replace("♭", "b")
    if len(note) >= 2 and (note[1] == '#' or note[1] == 'b'):
        letter = note[:2]
        octave = int(note[2:])
    else:
        letter = note[0]
        octave = int(note[1:])
    note_mapping = {
        'C': 0, 'C#': 1,
        'D': 2, 'D#': 3,
        'E': 4,
        'F': 5, 'F#': 6,
        'G': 7, 'G#': 8,
        'A': 9, 'A#': 10,
        'B': 11
    }
    return octave * 12 + note_mapping.get(letter, 0)

@app.post("/analyze-audio")
async def analyze_audio(audio_data: AudioData):
    results: Dict[str, str] = {}

    for audio_entry in audio_data.audios:
        base64_str = audio_entry.base64_audio

        if base64_str.startswith("data:"):
            try:
                _, base64_str = base64_str.split(",", 1)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"{audio_entry.key}의 데이터 형식이 올바르지 않습니다."
                )

        try:
            audio_bytes = base64.b64decode(base64_str)
        except Exception:
            raise HTTPException(status_code=400, detail="Base64 디코딩 실패")

        # 임시 파일을 이용하여 WebM 데이터를 저장 및 처리합니다.
        try:
            with tempfile.NamedTemporaryFile(suffix=".webm") as temp_webm:
                temp_webm.write(audio_bytes)
                temp_webm.flush()  # 데이터가 디스크에 기록되도록 flush 처리

                # WebM -> WAV 변환
                try:
                    # AudioSegment.from_file은 파일 경로 또는 파일 객체를 지원합니다.
                    audio_segment = AudioSegment.from_file(temp_webm.name, format="webm")
                except Exception as e:
                    raise HTTPException(status_code=500, detail="WebM 파일 읽기 실패")

                # 변환된 WAV 파일도 임시 파일로 생성합니다.
                with tempfile.NamedTemporaryFile(suffix=".wav") as temp_wav:
                    try:
                        audio_segment.export(temp_wav.name, format="wav")
                        temp_wav.flush()
                    except Exception as e:
                        raise HTTPException(status_code=500, detail="WAV 변환 실패")

                    # 음 높이 분석 (임시 WAV 파일 경로 전달)
                    try:
                        segmented_notes = segment_pitch.get_segmented_notes(temp_wav.name)
                        results[audio_entry.key] = ",".join(segmented_notes)
                    except Exception as e:
                        raise HTTPException(status_code=500, detail="노트 분석 실패")
        except Exception as e:
            logger.exception("오디오 처리 중 오류 발생")
            raise HTTPException(status_code=500, detail="오디오 처리 중 오류 발생")

    # 최고음 판별 (기존 로직 유지)
    sorted_entries = sorted(audio_data.audios, key=lambda x: int(x.key.replace("recordedAudio", "")))
    last_valid_candidate = None
    last_valid_pitch = -1

    for audio_entry in sorted_entries:
        key = audio_entry.key
        octave = int(key.replace("recordedAudio", ""))
        expected_scale = [f"C{octave}", f"D{octave}", f"E{octave}", f"F{octave}", f"G{octave}", f"A{octave}", f"B{octave}"]
        recorded_scale_str = results.get(key, "")
        recorded_scale = recorded_scale_str.split(",") if recorded_scale_str else []

        valid_notes = []
        for exp, rec in zip(expected_scale, recorded_scale):
            if abs(get_pitch(rec) - get_pitch(exp)) <= 1:
                valid_notes.append(rec)
            else:
                break

        if valid_notes:
            candidate = valid_notes[-1]
            pitch = get_pitch(candidate)
            if pitch > last_valid_pitch:
                last_valid_pitch = pitch
                last_valid_candidate = candidate

    results["highest_note"] = last_valid_candidate if last_valid_candidate else "None"
    return results

@app.post("/recommend-music")
async def recommend_music_endpoint(request: MusicRecommendationRequest):
    try:
        normalized_note = request.highest_note.replace("♯", "#").replace("♭", "b")
        recommendations = recommend_music.process_music_data(CSV_FILE_PATH, normalized_note)
        return {"recommendations": recommendations}
    except Exception:
        raise HTTPException(status_code=500, detail="음악 추천 처리 중 에러 발생")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ssl_keyfile = os.path.join(base_dir, "key.pem")
    ssl_certfile = os.path.join(base_dir, "cert.pem")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8102,
        ssl_keyfile=ssl_keyfile,
        ssl_certfile=ssl_certfile
    )











