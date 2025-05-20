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

// 새로 정의된 final-canvas
const decorateCanvas = document.getElementById('decorate-canvas');
const decorateCtx = decorateCanvas.getContext('2d');

const snapBtn = document.getElementById('snap');
const switchBtn = document.getElementById('switch-btn');
const useBtn = document.getElementById('use-photo');
const retakeBtn = document.getElementById('retake-photo');
const saveBtn = document.getElementById('save-decorated');
const deleteBtn = document.getElementById('delete-sticker');
const uploadInput = document.getElementById('sticker-upload');

let currentFacing = "environment";
let currentStream = null;

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

  decorateCanvas.width = previewCanvas.width;
  decorateCanvas.height = previewCanvas.height;
  decorateCtx.drawImage(previewCanvas, 0, 0);
});

// 💾 저장하기
saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'decorated_photo.png';
  link.href = decorateCanvas.toDataURL();
  link.click();
});

// 🖼 스티커 처리
let stickers = [];
let selectedSticker = null;

function drawAll() {
  decorateCtx.clearRect(0, 0, decorateCanvas.width, decorateCanvas.height);
  decorateCtx.drawImage(previewCanvas, 0, 0);

  stickers.forEach(s => {
    decorateCtx.drawImage(s.img, s.x, s.y, s.width, s.height);
    if (s === selectedSticker) {
      decorateCtx.strokeStyle = 'red';
      decorateCtx.lineWidth = 2;
      decorateCtx.strokeRect(s.x, s.y, s.width, s.height);
    }
  });
}

function createSticker(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    const scale = 0.3;
    const width = img.width * scale;
    const height = img.height * scale;
    const x = (decorateCanvas.width - width) / 2;
    const y = (decorateCanvas.height - height) / 2;

    const sticker = { img, x, y, width, height, dragging: false, offsetX: 0, offsetY: 0 };
    stickers.push(sticker);
    selectedSticker = sticker;
    drawAll();
  };
}

// 📦 내장 스티커 등록
const stickerList = [
  'CATBBI_1', 'CATBBI_2',
  'DALRING_1', 'DALRING_2',
  'MYNGMYNG_1', 'MYNGMYNG_2',
  'HANTATPUNG_1', 'HANTATPUNG_2',
  '312_1', '312_2',
  'WOONBABY_1', 'WOONBABY_2'
];

stickerList.forEach(name => {
  const img = new Image();
  img.src = `stickers/${name}.png`;
  img.className = 'sticker-preview';
  img.title = name;
  img.style.width = '60px';
  img.style.margin = '5px';
  img.style.cursor = 'pointer';

  img.addEventListener('click', () => createSticker(img.src));

  document.body.appendChild(img); // 원하는 위치로 옮겨도 됨
});

// 📥 사용자 업로드 스티커
uploadInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => createSticker(reader.result);
  reader.readAsDataURL(file);
});

// 🗑️ 삭제 버튼
deleteBtn.addEventListener('click', () => {
  if (selectedSticker) {
    stickers = stickers.filter(s => s !== selectedSticker);
    selectedSticker = null;
    drawAll();
  }
});

// 🖱 PC 이벤트
decorateCanvas.addEventListener('mousedown', e => {
  const { x, y } = getCanvasPos(e);
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) {
      s.dragging = true;
      s.offsetX = x - s.x;
      s.offsetY = y - s.y;
      selectedSticker = s;
      stickers.push(stickers.splice(i, 1)[0]);
      drawAll();
      break;
    }
  }
});

decorateCanvas.addEventListener('mousemove', e => {
  const { x, y } = getCanvasPos(e);
  stickers.forEach(s => {
    if (s.dragging) {
      s.x = x - s.offsetX;
      s.y = y - s.offsetY;
      drawAll();
    }
  });
});

decorateCanvas.addEventListener('mouseup', () => {
  stickers.forEach(s => s.dragging = false);
});

// 📱 모바일 터치 지원
decorateCanvas.addEventListener('touchstart', e => {
  const touch = e.touches[0];
  const { x, y } = getCanvasPos(touch);
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) {
      s.dragging = true;
      s.offsetX = x - s.x;
      s.offsetY = y - s.y;
      selectedSticker = s;
      stickers.push(stickers.splice(i, 1)[0]);
      drawAll();
      break;
    }
  }
});

decorateCanvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const touch = e.touches[0];
  const { x, y } = getCanvasPos(touch);
  stickers.forEach(s => {
    if (s.dragging) {
      s.x = x - s.offsetX;
      s.y = y - s.offsetY;
      drawAll();
    }
  });
}, { passive: false });

decorateCanvas.addEventListener('touchend', () => {
  stickers.forEach(s => s.dragging = false);
});

// 🔍 크기 조절 키보드 (PC만 가능)
window.addEventListener('keydown', e => {
  if (!selectedSticker) return;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    stickers = stickers.filter(s => s !== selectedSticker);
    selectedSticker = null;
  } else if (e.key === '+' || e.key === '=') {
    selectedSticker.width *= 1.1;
    selectedSticker.height *= 1.1;
  } else if (e.key === '-' || e.key === '_') {
    selectedSticker.width *= 0.9;
    selectedSticker.height *= 0.9;
  }
  drawAll();
});

// 🧠 유틸: 좌표 계산
function getCanvasPos(e) {
  const rect = decorateCanvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}
