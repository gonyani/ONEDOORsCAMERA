const startPage = document.getElementById('start-page');
const cameraPage = document.getElementById('camera-page');
const photoPage = document.getElementById('photo-page');
const video = document.getElementById('video');
const startButton = document.getElementById('start-button');
const switchButton = document.getElementById('switch-button');
const captureButton = document.getElementById('capture-button');
const confirmButton = document.getElementById('confirm-button');
const retakeButton = document.getElementById('retake-button');
const photo = document.getElementById('photo');

let currentStream;
let usingFrontCamera = false;

startButton.addEventListener('click', async () => {
  startPage.style.display = 'none';
  cameraPage.style.display = 'flex';
  await startCamera();
});

switchButton.addEventListener('click', async () => {
  usingFrontCamera = !usingFrontCamera;
  await startCamera();
});

captureButton.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  // 좌우 반전 없이 저장
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageDataUrl = canvas.toDataURL('image/png');
  photo.src = imageDataUrl;

  cameraPage.style.display = 'none';
  photoPage.style.display = 'flex';
});

confirmButton.addEventListener('click', () => {
  alert('꾸미기 페이지로 이동합니다 (아직 미구현)');
});

retakeButton.addEventListener('click', () => {
  photoPage.style.display = 'none';
  cameraPage.style.display = 'flex';
});

async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: {
      facingMode: usingFrontCamera ? 'user' : { exact: 'environment' },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
  } catch (err) {
    alert('카메라를 사용할 수 없습니다: ' + err.message);
  }
}
