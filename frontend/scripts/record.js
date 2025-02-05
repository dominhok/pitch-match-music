document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.querySelector(".startButton");

    if (startButton) {
        startButton.addEventListener("click", function () {
            startRecording();
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
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = function () {
                    localStorage.setItem("recordedAudio", reader.result);
                    alert("녹음이 저장되었습니다! 음역대 분석 버튼을 눌러주세요.");
                };
            };

            mediaRecorder.start();
            setTimeout(stopRecording, 3000); // 3초 후 자동 종료
        } catch (error) {
            console.error("마이크 접근이 필요합니다!", error);
        }
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    }
});
