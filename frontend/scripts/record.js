document.addEventListener("DOMContentLoaded", function () {
    // 녹음 시작 버튼 선택
    const startButton = document.querySelector(".startButton");
  
    if (startButton) {
      startButton.addEventListener("click", function () {
        startRecordingAndPlayPiano();
      });
    }
  
    let mediaRecorder;
    let audioChunks = [];
  
    async function startRecordingAndPlayPiano() {
      try {
        // 마이크 권한 요청 및 스트림 획득
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
  
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
  
        mediaRecorder.onstop = async () => {
          console.log("녹음이 종료되었습니다.");
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          try {
            // Blob을 Base64 문자열로 변환
            const base64Audio = await blobToBase64(audioBlob);
            // 현재 설정된 옥타브 값 가져오기 (예: "현재 옥타브: 4")
            const octaveElement = document.querySelector('.octave p');
            let currentOctave = "N/A";
            if (octaveElement) {
              const text = octaveElement.textContent;
              const match = text.match(/(\d+)/);
              if (match) {
                currentOctave = match[1];
              }
            }
            // 옥타브 번호를 반영하여 로컬스토리지에 저장 (예: recordedAudio4)
            const storageKey = "recordedAudio" + currentOctave;
            localStorage.setItem(storageKey, base64Audio);
            console.log(`녹음 파일이 localStorage에 '${storageKey}' 키로 저장되었습니다.`);
            alert(`${currentOctave} 옥타브 녹음이 완료되었습니다!`);
          } catch (error) {
            console.error("오디오를 Base64로 변환하는 중 에러 발생:", error);
          }
        };
  
        // 녹음 시작
        mediaRecorder.start();
        console.log("녹음 시작");
  
        // 피아노 자동 연주 시작 (piano.js의 playSequence 함수가 정의되어 있어야 합니다)
        if (typeof playSequence === "function") {
          playSequence();
        } else {
          console.error("playSequence 함수가 정의되어 있지 않습니다.");
        }
  
        // 8초 후 녹음을 종료 (피아노 자동 연주와 함께 진행)
        setTimeout(stopRecording, 8000);
      } catch (error) {
        console.error("마이크 접근 권한이 필요합니다!", error);
      }
    }
  
    function stopRecording() {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log("녹음 종료");
      }
    }
  
    // Blob을 Base64 문자열로 변환하는 함수
    function blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    }
  });
  
  

  