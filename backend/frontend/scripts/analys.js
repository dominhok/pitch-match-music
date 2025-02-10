document.addEventListener("DOMContentLoaded", function () {
  const analysisButton = document.querySelector(".analysisButton_1");
  const recordButtonsContainer = document.querySelector(".record_buttons"); // 버튼이 있는 부모 컨테이너

  if (analysisButton) {
    analysisButton.addEventListener("click", async function (event) {
      event.preventDefault();

      // 버튼 숨기기
      analysisButton.style.display = "none";

      // 로고 이미지를 제거하고, 텍스트에 애니메이션 효과를 주기 위해 p 요소 생성
      const loadingMessage = document.createElement("p");
      loadingMessage.style.fontSize = "18px";
      loadingMessage.style.color = "#ff7c98";
      loadingMessage.style.fontWeight = "bold";
      loadingMessage.style.marginTop = "15px";
      recordButtonsContainer.appendChild(loadingMessage);

      // 기본 텍스트와 애니메이션 처리 (점이 늘었다 줄었다)
      const baseText = "음역대를 분석하는 중입니다";
      let dotCount = 0;
      loadingMessage.textContent = baseText;
      const intervalId = setInterval(() => {
        dotCount = (dotCount + 1) % 4; // 0 ~ 3 사이의 숫자를 순환
        loadingMessage.textContent = baseText + ".".repeat(dotCount);
      }, 500); // 500ms마다 업데이트

      // localStorage에서 "recordedAudio"로 시작하는 모든 녹음 데이터를 수집
      let audioList = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("recordedAudio")) {
          const base64Audio = localStorage.getItem(key);
          audioList.push({ key: key, base64_audio: base64Audio });
        }
      }

      console.log("전송할 audioList:", audioList);

      if (audioList.length === 0) {
        alert("저장된 녹음 데이터가 없습니다!");
        clearInterval(intervalId);
        loadingMessage.remove();
        analysisButton.style.display = "inline-block";
        return;
      }

      const payload = { audios: audioList };
      console.log("서버로 전송할 payload:", payload);

      try {
        console.log("서버에 POST 요청을 전송합니다...");
        const response = await fetch("https://Endpoint:8102/analyze-audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log("서버 응답 상태:", response.status);

        if (!response.ok) {
          throw new Error("서버에서 에러가 발생했습니다.");
        }

        // 서버로부터 JSON 응답 받음
        const result = await response.json();
        console.log("서버로부터 받은 결과:", result);

        let message = "분석 결과:\n";
        let highestNote = null;
        for (let key in result) {
          if (key === "highest_note") {
            highestNote = result[key];
            message += `최고음: ${highestNote}\n`;
          } else {
            message += `${key}: ${result[key]}\n`;
          }
        }

        alert(message);

        // 최고음(highest_note)을 localStorage에 저장
        if (highestNote) {
          localStorage.setItem("highest_note", highestNote);
          console.log(
            `최고음 '${highestNote}'이 localStorage에 저장되었습니다.`
          );
        }

        // 결과 페이지로 이동
        window.location.href = "result.html";
      } catch (error) {
        console.error("분석 요청 중 에러 발생:", error);
        alert("분석 요청 중 에러가 발생했습니다.");
      } finally {
        // 애니메이션 인터벌 클리어 및 로딩 메시지 제거, 버튼 복구
        clearInterval(intervalId);
        loadingMessage.remove();
        analysisButton.style.display = "inline-block";
      }
    });
  }
});
