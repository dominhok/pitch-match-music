document.addEventListener("DOMContentLoaded", function () {
  let recommendations = [];
  try {
    const recStr = localStorage.getItem("recommendations");
    if (recStr) {
      recommendations = JSON.parse(recStr);
    }
  } catch (e) {
    console.error("추천 데이터를 파싱하는 데 실패했습니다:", e);
  }

  const genres = ["발라드", "밴드", "R&B", "K-POP", "POP"];
  const genreGroups = {};
  genres.forEach((genre) => {
    genreGroups[genre] = [];
  });

  recommendations.forEach((item) => {
    if (item.genre && genres.includes(item.genre)) {
      genreGroups[item.genre].push(item);
    }
  });

  const slider = document.getElementById("slider");
  if (!slider) {
    console.error("슬라이더 컨테이너가 없습니다.");
    return;
  }
  slider.innerHTML = "";

  // 슬라이드 생성
  genres.forEach((genre) => {
    const slide = document.createElement("div");
    slide.className = "slide";

    // 장르 제목 추가
    const title = document.createElement("p");
    title.className = "genre-title";
    title.textContent = genre;
    slide.appendChild(title);

    const items = genreGroups[genre];
    if (items.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.textContent = "추천 항목이 없습니다.";
      slide.appendChild(emptyMsg);
    } else {
      items.forEach((item) => {
        const songCard = document.createElement("div");
        songCard.className = "song-card";

        // 노래 제목 & 가수 정보
        const songInfo = document.createElement("div");
        const songTitle = document.createElement("p");
        songTitle.className = "song-title";
        songTitle.textContent = item.title;

        const songArtist = document.createElement("p");
        songArtist.className = "song-artist";
        songArtist.textContent = item.artist;

        songInfo.appendChild(songTitle);
        songInfo.appendChild(songArtist);

        // 최고음 표시
        const highestNote = document.createElement("span");
        highestNote.className = "highest-note";
        highestNote.textContent = `최고음 : ${item.highest_note}`;

        // song-card에 정보 추가
        songCard.appendChild(songInfo);
        songCard.appendChild(highestNote);
        slide.appendChild(songCard);
      });
    }
    slider.appendChild(slide);
  });

  const totalSlides = genres.length;
  let currentIndex = 0;
  const slideWidth = 600;

  function updateSlider() {
    slider.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    updateIndicator();
  }

  function updateIndicator() {
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  document.getElementById("prevBtn").addEventListener("click", function () {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateSlider();
  });

  document.getElementById("nextBtn").addEventListener("click", function () {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateSlider();
  });

  updateSlider();
});

document
  .getElementById("playAllBtn")
  .addEventListener("click", async function () {
    // 로컬스토리지에서 추천 데이터를 가져옴
    let recommendations = [];
    try {
      const recStr = localStorage.getItem("recommendations");
      if (recStr) {
        recommendations = JSON.parse(recStr);
      }
    } catch (e) {
      console.error("추천 데이터를 파싱하는 데 실패했습니다:", e);
    }

    if (!recommendations.length) {
      alert("추천 곡이 없습니다.");
      return;
    }

    // YouTube Data API 키 (본인의 키로 교체)
    const apiKey = "APIKEYS";
    const videoIds = [];

    // 모든 추천 곡에 대해 YouTube에서 영상 ID를 가져옴
    await Promise.all(
      recommendations.map(async (item) => {
        const query = `${item.title} ${item.artist}`;
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q=${encodeURIComponent(
          query
        )}&key=${apiKey}`;
        try {
          const response = await fetch(searchUrl);
          const data = await response.json();
          if (data.items && data.items.length > 0 && data.items[0].id.videoId) {
            videoIds.push(data.items[0].id.videoId);
          }
        } catch (err) {
          console.error(`YouTube 검색 실패: ${query}`, err);
        }
      })
    );

    if (videoIds.length === 0) {
      alert("YouTube에서 영상을 찾지 못했습니다.");
      return;
    }

    // YouTube의 watch_videos 파라미터를 사용해 플레이리스트 URL 생성
    const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(
      ","
    )}`;

    // 새 창(또는 새 탭)에서 플레이리스트를 엽니다.
    window.open(playlistUrl, "_blank");
  });
