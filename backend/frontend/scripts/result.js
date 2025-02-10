document.addEventListener("DOMContentLoaded", async function () {
  const highestNoteElement = document.getElementById("highest_note");
  const noteFill = document.getElementById("note_fill");
  const compareTextElement = document.querySelector(".compare_1"); // 평균과의 비교 텍스트

  // 최고음 정보 가져오기
  let highestNote = localStorage.getItem("highest_note");

  if (highestNote) {
    highestNoteElement.textContent = highestNote;

    // 서버에서 받은 값에 유니코드 샵(♯)이 포함된 경우, 일반 샵(#)으로 변환
    if (highestNote.includes("♯")) {
      highestNote = highestNote.replace(/♯/g, "#");
    }

    // C3 ~ B5 범위에서 막대 길이 비율 계산
    const noteWidthMap = {
      C3: 10,
      "C#3": 13,
      D3: 16,
      "D#3": 19,
      E3: 22,
      F3: 25,
      "F#3": 28,
      G3: 31,
      "G#3": 34,
      A3: 37,
      "A#3": 40,
      B3: 43,
      C4: 46,
      "C#4": 49,
      D4: 52,
      "D#4": 55,
      E4: 58,
      F4: 61,
      "F#4": 64,
      G4: 67,
      "G#4": 70,
      A4: 73,
      "A#4": 76,
      B4: 79,
      C5: 82,
      "C#5": 85,
      D5: 88,
      "D#5": 91,
      E5: 94,
      F5: 97,
      "F#5": 100,
      G5: 103,
      "G#5": 106,
      A5: 109,
      "A#5": 112,
      B5: 115,
    };

    // 최고음에 따른 막대그래프 길이 설정 (기본값: 10, 최소 10%, 최대 100%)
    let widthPercentage = noteWidthMap[highestNote] || 10;
    widthPercentage = Math.min(100, Math.max(10, widthPercentage));
    noteFill.style.width = widthPercentage + "%";

    // ✅ GPT API에 최고음 보내기 및 응답 받아오기
    try {
      const gptResponse = await fetchGPTResponse(highestNote);

      // ✅ \n을 <br> 태그로 변환하여 가독성 향상
      compareTextElement.innerHTML = gptResponse.replace(/\n/g, "<br>");
    } catch (error) {
      console.error("GPT 응답 오류:", error);
      compareTextElement.textContent =
        "평균과의 비교 정보를 가져오는 데 실패했습니다.";
    }
  } else {
    highestNoteElement.textContent = "데이터 없음";
  }
});

// ✅ GPT API 요청 함수 (사용자의 API 키 필요)
async function fetchGPTResponse(highestNote) {
  const apiKey = "APIKEYS"; // 🔥 보안상 서버에서 관리 권장
  const endpoint = "https://api.openai.com/v1/chat/completions";

  const payload = {
    model: "gpt-4-turbo",
    temperature: 0.5,
    max_tokens: 1200,
    messages: [
      {
        role: "system",
        content:
          "당신은 전문 보컬 코치이자 음악 이론 전문가입니다. 사용자의 최고음을 분석하여 강점과 개선점을 제시하고, 남성의 경우와 여성의 경우를 나누어 적절한 음악 장르를 제공하세요. 또한, 응답을 **가독성이 높도록 문장을 문단으로 나누어 작성**하고, **중요한 정보는 줄 바꿈(\n\n)과 구분선(———)을 사용하여 강조**하세요.",
      },
      {
        role: "user",
        content: `나의 최고음은 ${highestNote} 입니다. 일반적인 평균 최고음과 비교하여, 제 음역의 강점과 약점을 분석하고, 제 목소리에 적합한 음악 장르를 추천 부탁드립니다.`,
      },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("GPT 응답 실패");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("GPT API 요청 실패:", error);
    return "GPT 분석 데이터를 가져오는 데 실패했습니다.";
  }
}
