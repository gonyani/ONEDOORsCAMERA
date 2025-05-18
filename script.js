const startBtn = document.getElementById('start-btn');
const cameraScreen = document.getElementById('camera-screen');
const startScreen = document.getElementById('start-screen');
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const snapBtn = document.getElementById('snap');
const switchBtn = document.getElementById('switch-btn');

let currentFacing = "environment"; // 기본: 후면 카메라
let currentStream = null;

// 👉 카메라 시작 함수
async function startCamera(facingMode) {
  if (currentStream) {
    // 기존 스트림 중지
    currentStream.getTracks().forEach(track => track.stop());
  }

  try {
    const constraints = {
      video: { facingMode: { exact: facingMode } },
      audio: false
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    currentStream = stream;
  } catch (err) {
    alert("카메라를 사용할 수 없어요 😢");
    console.error(err);
  }
}

// 👉 시작하기 버튼 누르면 카메라 화면으로 전환
startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  cameraScreen.style.display = 'block';
  startCamera(currentFacing);
});

// 👉 카메라 전환
switchBtn.addEventListener('click', () => {
  currentFacing = (currentFacing === "user") ? "environment" : "user";
  startCamera(currentFacing);
});

// 👉 사진 찍기
snapBtn.addEventListener('click', () => {
  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  // 전면 카메라일 경우 반전 제거
  if (currentFacing === "user") {
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1); // 좌우 반전 제거
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();
  } else {
    ctx.drawImage(video, 0, 0, width, height);
  }
});
