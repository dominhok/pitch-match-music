document.addEventListener("DOMContentLoaded", function () {
  // 기존 요소 선택
  const startButton = document.querySelector(".startButton");
  const countdownText = document.querySelector(".countdown-text");
  const recordingStatus = document.querySelector(".recording-status");
  const analysisButton = document.querySelector(".analysisButton_1");
  // analysisButton이 <a> 태그 내부에 있으므로 해당 링크도 가져옵니다.
  const analysisLink = analysisButton.closest("a");

  // localStorage에 녹음된 파일이 존재하는지 확인 (키가 "recordedAudio"로 시작하는지)
  let hasRecordedAudio = false;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith("recordedAudio")) {
      hasRecordedAudio = true;
      break;
    }
  }

  // 녹음된 파일이 있으면 active 버튼, 없으면 비활성화
  if (hasRecordedAudio) {
    analysisButton.src = "pictures/analyzebutton.svg";
    if (analysisLink) {
      analysisLink.setAttribute("href", "result.html");
      analysisLink.style.pointerEvents = "auto";
      analysisLink.style.cursor = "pointer";
    }
  } else {
    if (analysisLink) {
      analysisLink.removeAttribute("href");
      analysisLink.style.pointerEvents = "none";
      analysisLink.style.cursor = "default";
    }
  }

  // 시작 버튼 이벤트 리스너
  if (startButton) {
    startButton.addEventListener("click", function () {
      startCountdownAndRecord();
    });
  }

  function startCountdownAndRecord() {
    let countdown = 3;
    startButton.style.display = "none"; // 버튼 숨기기
    countdownText.style.display = "block";
    recordingStatus.style.display = "none"; // 녹음 전 GIF 숨김
    countdownText.textContent = `${countdown}초 전`;

    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        countdownText.textContent = `${countdown}초 전`;
      } else {
        clearInterval(countdownInterval);
        countdownText.style.display = "none"; // 카운트다운 숨김
        recordingStatus.style.display = "flex"; // 녹음 시작과 동시에 GIF 표시
        startRecordingAndPlayPiano();
      }
    }, 1000);
  }

  let mediaRecorder;
  let audioChunks = [];

  async function startRecordingAndPlayPiano() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
        },
      });

      const options = {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000,
      };

      mediaRecorder = new MediaRecorder(stream, options);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("녹음이 종료되었습니다.");
        recordingStatus.style.display = "none"; // 녹음 종료 시 GIF 숨김
        startButton.style.display = "block"; // 녹음 종료 후 시작 버튼 다시 표시

        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        try {
          const base64Audio = await blobToBase64(audioBlob);
          const octaveElement = document.querySelector(".octave p");
          let currentOctave = "N/A";

          if (octaveElement) {
            const text = octaveElement.textContent;
            const match = text.match(/(\d+)/);
            if (match) {
              currentOctave = match[1];
            }
          }

          const storageKey = "recordedAudio" + currentOctave;
          localStorage.setItem(storageKey, base64Audio);
          console.log(
            `녹음 파일이 localStorage에 '${storageKey}' 키로 저장되었습니다.`
          );
          alert(`${currentOctave} 옥타브 녹음이 완료되었습니다!`);

          // 녹음 후에는 analysis 버튼을 활성화 처리합니다.
          if (analysisLink) {
            analysisButton.src = "pictures/analyzebutton.svg";
            analysisLink.setAttribute("href", "result.html");
            analysisLink.style.pointerEvents = "auto";
            analysisLink.style.cursor = "pointer";
          }
        } catch (error) {
          console.error("오디오를 Base64로 변환하는 중 에러 발생:", error);
        }
      };

      mediaRecorder.start();
      console.log("녹음 시작");

      if (typeof playSequence === "function") {
        playSequence();
      } else {
        console.error("playSequence 함수가 정의되어 있지 않습니다.");
      }

      // 14초 후 녹음 종료
      setTimeout(stopRecording, 14000);
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
