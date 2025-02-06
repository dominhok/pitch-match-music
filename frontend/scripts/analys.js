document.addEventListener("DOMContentLoaded", function () {
  // analysisButton_1 클래스를 가진 요소 선택 (a 태그 또는 버튼 등)
  const analysisButton = document.querySelector(".analysisButton_1");

  if (analysisButton) {
    analysisButton.addEventListener("click", async function (event) {
      // a 태그인 경우 기본 이동 동작 막기
      event.preventDefault();

      // 로컬 스토리지에 저장된 모든 녹음 데이터를 담을 배열 생성
      let audioList = [];
      // localStorage의 모든 키를 순회
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // 키 이름이 "recordedAudio"로 시작하는 경우에만 처리
        if (key.startsWith("recordedAudio")) {
          const base64Audio = localStorage.getItem(key);
          // 객체 형태로 배열에 추가 (필요에 따라 key와 데이터를 함께 보냅니다)
          audioList.push({ key: key, base64_audio: base64Audio });
        }
      }

      if (audioList.length === 0) {
        alert("저장된 녹음 데이터가 없습니다!");
        return;
      }

      try {
        // FastAPI 서버의 /analyze-audio 엔드포인트에 POST 요청 전송
        const response = await fetch("http://localhost:8102/analyze-audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audios: audioList }),
        });

        if (!response.ok) {
          throw new Error("서버에서 에러가 발생했습니다.");
        }

        // 서버로부터 받은 결과(JSON)를 파싱
        const result = await response.json();
        // result는 예를 들어 { "recordedAudio3": "C5", "recordedAudio4": "C5", ... } 형태일 수 있음
        alert("분석 결과: " + JSON.stringify(result));

        // 추가: 결과 페이지로 이동하거나 후속 처리를 할 수 있습니다.
        // 예: window.location.href = "result.html";
      } catch (error) {
        console.error("분석 요청 중 에러 발생:", error);
        alert("분석 요청 중 에러가 발생했습니다.");
      }
    });
  }
});
