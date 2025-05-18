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
const finalCanvas = document.getElementById('final-canvas');
const finalCtx = finalCanvas.getContext('2d');

const snapBtn = document.getElementById('snap');
const switchBtn = document.getElementById('switch-btn');
const useBtn = document.getElementById('use-photo');
const retakeBtn = document.getElementById('retake-photo');
const saveBtn = document.getElementById('save-btn');

let currentFacing = "environment"; // 기본: 후면 카메라
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
  previewScreen.style.display = 'none';
  decorateScreen.style.display = 'block';

  finalCanvas.width = previewCanvas.width;
  finalCanvas.height = previewCanvas.height;
  finalCtx.drawImage(previewCanvas, 0, 0);
});

// 💾 저장하기
saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'decorated_photo.png';
  link.href = finalCanvas.toDataURL();
  link.click();
});

// 🎨 스티커 추가 기능
const stickerList = [
  'CATBBI_1', 'CATBBI_2',
  'DALRING_1', 'DALRING_2',
  'MYNGMYNG_1', 'MYNGMYNG_2',
  'HANTATPUNG_1', 'HANTATPUNG_2',
  '312_1', '312_2',
  'WOONBABY_1', 'WOONBABY_2'
];

const stickerToolbar = document.getElementById('sticker-toolbar');

stickerList.forEach(name => {
  const img = document.createElement('img');
  img.src = `stickers/${name}.png`;
  img.className = 'sticker-preview';
  img.title = name;

  img.addEventListener('click', () => {
    const sticker = new Image();
    sticker.src = img.src;
    sticker.onload = () => {
      const scale = 0.3;
      const width = sticker.width * scale;
      const height = sticker.height * scale;

      const x = (finalCanvas.width - width) / 2;
      const y = (finalCanvas.height - height) / 2;

      const stickerObj = {
        img: sticker,
        x, y, width, height,
        dragging: false,
        offsetX: 0,
        offsetY: 0
      };
      stickers.push(stickerObj);
      drawAll();
    };
  });

  stickerToolbar.appendChild(img);
});

let stickers = [];

function drawAll() {
  finalCtx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
  finalCtx.drawImage(previewCanvas, 0, 0);

  stickers.forEach(s => {
    finalCtx.drawImage(s.img, s.x, s.y, s.width, s.height);
  });
}

finalCanvas.addEventListener('mousedown', e => {
  const rect = finalCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) {
      s.dragging = true;
      s.offsetX = x - s.x;
      s.offsetY = y - s.y;
      stickers.push(stickers.splice(i, 1)[0]); // Bring to front
      break;
    }
  }
});

finalCanvas.addEventListener('mousemove', e => {
  const rect = finalCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  stickers.forEach(s => {
    if (s.dragging) {
      s.x = x - s.offsetX;
      s.y = y - s.offsetY;
      drawAll();
    }
  });
});

finalCanvas.addEventListener('mouseup', () => {
  stickers.forEach(s => s.dragging = false);
});

// ⌨️ 키보드로 스티커 삭제/크기 조절
window.addEventListener('keydown', e => {
  const selected = stickers[stickers.length - 1];
  if (!selected) return;

  if (e.key === 'Delete' || e.key === 'Backspace') {
    stickers.pop();
    drawAll();
  } else if (e.key === '+' || e.key === '=') {
    selected.width *= 1.1;
    selected.height *= 1.1;
    drawAll();
  } else if (e.key === '-' || e.key === '_') {
    selected.width *= 0.9;
    selected.height *= 0.9;
    drawAll();
  }
});
