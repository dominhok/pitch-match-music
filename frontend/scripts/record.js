document.addEventListener("DOMContentLoaded", function () {
    // 녹음 시작 버튼과 로드 버튼 선택
    const startButton = document.querySelector(".startButton");
    const loadButton = document.querySelector(".loadButton");
  
    if (startButton) {
      startButton.addEventListener("click", function () {
        startRecording();
      });
    }
  
    if (loadButton) {
      loadButton.addEventListener("click", function () {
        loadRecording();
      });
    }
  
    let mediaRecorder;
    let audioChunks = [];
  
    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
  
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
  
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          try {
            // Blob을 Base64 문자열로 변환 (Promise 사용)
            const base64Audio = await blobToBase64(audioBlob);
            localStorage.setItem("recordedAudio", base64Audio);
            console.log("녹음 파일이 localStorage에 저장되었습니다.");
            alert("녹음이 저장되었습니다! 음역대 분석 버튼을 눌러주세요.");
          } catch (error) {
            console.error("오디오를 Base64로 변환하는 중 에러 발생:", error);
          }
        };
  
        mediaRecorder.start();
        setTimeout(stopRecording, 8000); // 3초 후 녹음 자동 종료
      } catch (error) {
        console.error("마이크 접근 권한이 필요합니다!", error);
      }
    }
  
    function stopRecording() {
      if (mediaRecorder) {
        mediaRecorder.stop();
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
  
    // 로컬스토리지에서 녹음 파일을 불러와서 오디오 플레이어로 표시하는 함수
    function loadRecording() {
      const storedAudio = localStorage.getItem("recordedAudio");
      if (storedAudio) {
        // 기존에 추가된 오디오 요소가 있으면 삭제 (중복 추가 방지)
        const existingAudio = document.getElementById("loadedAudio");
        if (existingAudio) {
          existingAudio.remove();
        }
        // 새 오디오 요소 생성 및 속성 설정
        const audioPlayer = document.createElement("audio");
        audioPlayer.id = "loadedAudio";
        audioPlayer.controls = true;
        audioPlayer.src = storedAudio;
        document.body.appendChild(audioPlayer);
        console.log("녹음 파일이 로컬스토리지에서 로드되었습니다.");
      } else {
        alert("저장된 녹음 파일이 없습니다.");
      }
    }
  });
  
  