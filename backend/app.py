from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import base64
import io
from pydub import AudioSegment  # pydub 사용 (ffmpeg 필요)
import uvicorn

app = FastAPI()

# 각 녹음 데이터 항목 모델
class AudioEntry(BaseModel):
    key: str
    base64_audio: str

# 클라이언트에서 전달하는 전체 데이터 모델
class AudioData(BaseModel):
    audios: List[AudioEntry]

@app.post("/analyze-audio")
async def analyze_audio(audio_data: AudioData):
    results: Dict[str, str] = {}

    for audio_entry in audio_data.audios:
        base64_str = audio_entry.base64_audio
        # data URI 형식일 경우 "data:audio/webm;base64," 부분을 분리
        if base64_str.startswith("data:"):
            try:
                _, base64_str = base64_str.split(",", 1)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"{audio_entry.key}의 데이터 형식이 올바르지 않습니다.")
        
        try:
            audio_bytes = base64.b64decode(base64_str)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"{audio_entry.key}의 Base64 디코딩에 실패했습니다.") from e

        try:
            # BytesIO를 사용해 메모리 내에서 파일처럼 다룸
            audio_file = io.BytesIO(audio_bytes)
            # 여기서는 입력 오디오 포맷을 "webm"으로 가정합니다.
            audio_segment = AudioSegment.from_file(audio_file, format="webm")
            
            # WAV로 변환 (메모리 내 BytesIO에 저장)
            wav_io = io.BytesIO()
            audio_segment.export(wav_io, format="wav")
            wav_io.seek(0)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"{audio_entry.key}의 WAV 변환에 실패했습니다.") from e

        # 4. (생략) 여기서 WAV 파일을 Pesto 모델로 분석하는 로직 추가 가능
        # 예제에서는 각 음원에 대해 dummy 결과 "C5"를 반환합니다.
        results[audio_entry.key] = "C5"

    return results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8102)
