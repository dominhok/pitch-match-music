// Web Audio API 초기화
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 현재 옥타브 (기본값 4)
let currentOctave = 4;

// 음의 반음 오프셋 (C4를 기준으로)
const noteOffsets = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

// 현재 옥타브 값에 따라 해당 음의 주파수를 계산하는 함수

function getFrequency(note) {
  let octave = currentOctave;
  const offset = noteOffsets[note];
  if (offset === undefined) return null;
  
  const frequency = 261.63 * Math.pow(2, octave - 4 + offset / 12);
  return frequency;
}


// 사인파로 음을 재생하는 함수 (페이드 인/아웃 적용)
function playSine(note, duration = 0.5) {
  const frequency = getFrequency(note);
  if (!frequency) return;

  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  const gainNode = audioContext.createGain();
  const initialVolume = 0.3; // 기존 0.5보다 낮은 볼륨

  // 페이드 인: 시작 시 0에서 initialVolume까지 0.1초 동안 선형 증가
  const fadeInTime = 0.1;
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    initialVolume,
    audioContext.currentTime + fadeInTime
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();

  // 페이드 아웃: 음 끝나기 0.1초 전부터 볼륨을 0으로 선형 감소
  const fadeOutTime = 0.1;
  const fadeOutStart = audioContext.currentTime + duration - fadeOutTime;
  gainNode.gain.setValueAtTime(initialVolume, fadeOutStart);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

  oscillator.stop(audioContext.currentTime + duration);
}

// HTML의 건반 요소 선택
const keys = document.querySelectorAll(".white-key, .black-key");

// 피아노 음 순서 (자동 연주용)
const noteSequence = ["C", "D", "E", "F", "G", "A", "B"];

// 모든 건반 클릭 이벤트 추가
keys.forEach((key) => {
  key.addEventListener("click", function () {
    const note = this.dataset.note;
    console.log(`Clicked note: ${note}`);

    this.classList.add("active");
    playSine(note, 0.5);
    setTimeout(() => {
      this.classList.remove("active");
    }, 150);

    // 첫 번째 건반(C)이 클릭되면 자동 연주 시작
    if (note === "C") {
      playSequence();
    }
  });
});

// 자동 연주 함수
function playSequence() {
  noteSequence.forEach((note, index) => {
    setTimeout(() => {
      let key = document.querySelector(`[data-note="${note}"]`);
      if (key) {
        key.classList.add("active");
        playSine(note, 1.8);
        setTimeout(() => key.classList.remove("active"), 300);
      }
    }, index * 2000);
  });
}

// 옥타브 조정을 위한 이벤트 리스너 (예: .octave 요소 클릭 시)
const octaveContainer = document.querySelector(".octave");
if (octaveContainer) {
  octaveContainer.addEventListener("click", function () {
    // 예시로 옥타브를 3, 4, 5 순환
    if (currentOctave >= 5) {
      currentOctave = 3;
    } else {
      currentOctave++;
    }
    // 화면에 표시된 옥타브 값을 업데이트
    const p = this.querySelector("p");
    if (p) {
      p.textContent = `현재 옥타브: ${currentOctave}`;
    }
    console.log(`옥타브가 ${currentOctave}로 변경되었습니다.`);
  });
}
