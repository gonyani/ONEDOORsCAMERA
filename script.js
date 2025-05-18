const startBtn = document.getElementById('start-btn');
const cameraScreen = document.getElementById('camera-screen');
const startScreen = document.getElementById('start-screen');
const previewScreen = document.getElementById('preview-screen');
const decorateScreen = document.getElementById('decorate-screen');

const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('preview-canvas');
const previewCtx = previewCanvas.getContext('2d');
const decorateCanvas = document.getElementById('decorate-canvas');
const decorateCtx = decorateCanvas.getContext('2d');

const snapBtn = document.getElementById('snap');
const switchBtn = document.getElementById('switch-btn');
const useBtn = document.getElementById('use-photo');
const retakeBtn = document.getElementById('retake-photo');
const finishBtn = document.getElementById('finish-btn');
const stickerButtons = document.querySelectorAll('.sticker-btn');

let currentFacing = "environment";
let currentStream = null;

// 📷 카메라 시작
async function startCamera(facingMode) {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: facingMode } },
      audio: false
    });
    video.srcObject = stream;
    currentStream = stream;

    video.classList.toggle('flip', facingMode === "user");
  } catch (err) {
    alert("카메라를 사용할 수 없어요 😢");
    console.error(err);
  }
}

// ▶ 시작하기
startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  cameraScreen.style.display = 'block';
  startCamera(currentFacing);
});

// 🔄 카메라 전환
switchBtn.addEventListener('click', () => {
  currentFacing = (currentFacing === "user") ? "environment" : "user";
  startCamera(currentFacing);
});

// 📸 사진 찍기
snapBtn.addEventListener('click', () => {
  const width = video.videoWidth;
  const height = video.videoHeight;

  previewCanvas.width = width;
  previewCanvas.height = height;

  if (currentFacing === "user") {
    previewCtx.save();
    previewCtx.translate(width, 0);
    previewCtx.scale(-1, 1);
    previewCtx.drawImage(video, 0, 0, width, height);
    previewCtx.restore();
  } else {
    previewCtx.drawImage(video, 0, 0, width, height);
  }

  cameraScreen.style.display = 'none';
  previewScreen.style.display = 'block';
});

// 🔁 다시 찍기
retakeBtn.addEventListener('click', () => {
  previewScreen.style.display = 'none';
  cameraScreen.style.display = 'block';
  startCamera(currentFacing);
});

// ✅ 사용하기
useBtn.addEventListener('click', () => {
  const width = previewCanvas.width;
  const height = previewCanvas.height;

  decorateCanvas.width = width;
  decorateCanvas.height = height;
  decorateCtx.drawImage(previewCanvas, 0, 0);

  previewScreen.style.display = 'none';
  decorateScreen.style.display = 'block';
});

// ⭐️ 스티커 추가
stickerButtons.forEach(button => {
  button.addEventListener('click', () => {
    const sticker = button.dataset.sticker;
    decorateCtx.font = '64px serif';
    const x = Math.random() * (decorateCanvas.width - 100);
    const y = Math.random() * (decorateCanvas.height - 100);
    decorateCtx.fillText(sticker, x, y);
  });
});

// 🎉 완성!
finishBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'decorated-photo.png';
  link.href = decorateCanvas.toDataURL();
  link.click();
});
