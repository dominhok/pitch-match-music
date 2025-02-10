document.addEventListener("DOMContentLoaded", function () {
  // discoverButton는 <img class="discoverButton"> 요소를 선택합니다.
  const discoverButton = document.querySelector(".discoverButton");
  if (!discoverButton) {
    console.error("Discover 버튼을 찾을 수 없습니다.");
    return;
  }

  discoverButton.addEventListener("click", function (event) {
    // 기본 링크 이동 동작을 막습니다.
    event.preventDefault();

    // 로컬 스토리지에서 최고음을 가져옵니다.
    const highestNote = localStorage.getItem("highest_note");
    if (!highestNote) {
      alert("저장된 최고음이 없습니다.");
      return;
    }

    // 서버의 음악 추천 endpoint (/recommend-music)로 POST 요청을 보냅니다.
    fetch("https://Endpoint:8102/recommend-music", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ highest_note: highestNote }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("서버에서 오류가 발생했습니다.");
        }
        return response.json();
      })
      .then((data) => {
        // 추천 데이터를 장르별로 그룹화하여 문자열로 구성합니다.
        const recommendations = data.recommendations;
        const grouped = {};
        recommendations.forEach((item) => {
          // item.genre가 존재한다고 가정 (없으면 '기타' 처리)
          const genre = item.genre || "기타";
          if (!grouped[genre]) {
            grouped[genre] = [];
          }
          grouped[genre].push(item);
        });

        // 각 장르별 추천 항목을 문자열로 구성합니다.
        let message = "음악 추천 결과:\n";
        for (const genre in grouped) {
          message += `\n[${genre}]\n`;
          grouped[genre].forEach((item) => {
            // item.title과 item.artist가 존재한다고 가정합니다.
            const title = item.title || "제목 없음";
            const artist = item.artist ? " - " + item.artist : "";
            message += `${title}${artist}\n`;
          });
        }
        // 알림창에 추천 결과를 표시합니다.
        alert(message);

        // 서버로부터 받은 추천 값을 로컬스토리지에 저장합니다.
        localStorage.setItem(
          "recommendations",
          JSON.stringify(recommendations)
        );
        // recommend.html 페이지로 자동으로 이동합니다.
        window.location.href = "recommend.html";
      })
      .catch((error) => {
        console.error("음악 추천 요청 실패:", error);
        alert("음악 추천을 불러오는 중 오류가 발생했습니다.");
      });
  });
});
