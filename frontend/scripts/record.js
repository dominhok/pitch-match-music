document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.querySelector(".startButton");
  const countdownText = document.querySelector(".countdown-text");
  const recordingStatus = document.querySelector(".recording-status");

  if (startButton) {
    startButton.addEventListener("click", function () {
      startCountdownAndRecord();
    });
  }

  function startCountdownAndRecord() {
    let countdown = 3;

    // 버튼 숨기고 카운트다운 표시 (GIF 없이)
    startButton.style.display = "none";
    countdownText.style.display = "block";
    recordingStatus.style.display = "none"; // 🔥 카운트다운 중에는 GIF 숨김
    countdownText.textContent = `${countdown}초 전`;

    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        countdownText.textContent = `${countdown}초 전`;
      } else {
        clearInterval(countdownInterval);
        countdownText.style.display = "none"; // 🔥 카운트다운 숨김
        recordingStatus.style.display = "flex"; // 🔥 녹음 시작과 함께 GIF 표시

        startRecordingAndPlayPiano(); // 🔥 녹음 시작
      }
    }, 1000);
  }

  let mediaRecorder;
  let audioChunks = [];

  async function startRecordingAndPlayPiano() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("녹음이 종료되었습니다.");
        recordingStatus.style.display = "none"; // 🔥 녹음 끝나면 GIF 숨김
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

      setTimeout(stopRecording, 7000);
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
