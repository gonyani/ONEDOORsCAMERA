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
const saveBtn = document.getElementById('save-decorated');
const deleteBtn = document.getElementById('delete-sticker');
const stickerToolbar = document.getElementById('sticker-toolbar');

let currentFacing = "environment";
let currentStream = null;

let stickers = [];
let selectedSticker = null;
let pinchData = null;

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
  stickerToolbar.style.display = 'none';
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
  stickerToolbar.style.display = 'none';
});

// 🔁 다시 찍기
retakeBtn.addEventListener('click', () => {
  previewScreen.style.display = 'none';
  cameraScreen.style.display = 'block';
  startCamera(currentFacing);
  stickerToolbar.style.display = 'none';
});

// ✅ 사용하기
useBtn.addEventListener('click', () => {
  previewScreen.style.display = 'none';
  decorateScreen.style.display = 'block';

  decorateCanvas.width = previewCanvas.width;
  decorateCanvas.height = previewCanvas.height;
  decorateCtx.drawImage(previewCanvas, 0, 0);

  drawAll();
  stickerToolbar.style.display = 'block';
});

// 💾 저장하기
saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'decorated_photo.png';
  link.href = decorateCanvas.toDataURL();
  link.click();
});

// 스티커 등록
const stickerList = [
  'CATBBI_1', 'CATBBI_2',
  'DALRING_1', 'DALRING_2',
  'MYNGMYNG_1', 'MYNGMYNG_2',
  'HANTATPUNG_1', 'HANTATPUNG_2',
  '312_1', '312_2',
  'WOONBABY_1', 'WOONBABY_2'
];

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
      const x = (decorateCanvas.width - width) / 2;
      const y = (decorateCanvas.height - height) / 2;

      const stickerObj = {
        img: sticker,
        x, y,
        width, height,
        rotation: 0,
        dragging: false,
        offsetX: 0,
        offsetY: 0
      };
      stickers.push(stickerObj);
      selectedSticker = stickerObj;
      drawAll();
    };
  });

  stickerToolbar.appendChild(img);
});

// 그리기
function drawAll() {
  decorateCtx.clearRect(0, 0, decorateCanvas.width, decorateCanvas.height);
  decorateCtx.drawImage(previewCanvas, 0, 0);

  stickers.forEach(s => {
    decorateCtx.save();
    decorateCtx.translate(s.x + s.width / 2, s.y + s.height / 2);
    decorateCtx.rotate(s.rotation);
    decorateCtx.drawImage(s.img, -s.width / 2, -s.height / 2, s.width, s.height);
    decorateCtx.restore();
  });
}

// 이벤트 좌표 계산
function getEventPosition(e) {
  const rect = decorateCanvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  return { x, y };
}

// 드래그
function startDrag(e) {
  e.preventDefault();

  if (e.touches && e.touches.length === 2 && selectedSticker) {
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;
    pinchData = {
      initialDistance: Math.hypot(dx, dy),
      initialRotation: Math.atan2(dy, dx),
      startWidth: selectedSticker.width,
      startHeight: selectedSticker.height,
      startAngle: selectedSticker.rotation
    };
    return;
  }

  const pos = getEventPosition(e);
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (
      pos.x >= s.x &&
      pos.x <= s.x + s.width &&
      pos.y >= s.y &&
      pos.y <= s.y + s.height
    ) {
      s.dragging = true;
      s.offsetX = pos.x - s.x;
      s.offsetY = pos.y - s.y;
      selectedSticker = s;
      stickers.push(stickers.splice(i, 1)[0]);
      break;
    }
  }
}

function onDrag(e) {
  const pos = getEventPosition(e);
  stickers.forEach(s => {
    if (s.dragging) {
      s.x = pos.x - s.offsetX;
      s.y = pos.y - s.offsetY;
      drawAll();
    }
  });
}

function endDrag() {
  stickers.forEach(s => s.dragging = false);
  pinchData = null;
}

function onTouchMove(e) {
  if (e.touches.length === 2 && selectedSticker && pinchData) {
    e.preventDefault();
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;

    const newDistance = Math.hypot(dx, dy);
    const scale = newDistance / pinchData.initialDistance;

    selectedSticker.width = pinchData.startWidth * scale;
    selectedSticker.height = pinchData.startHeight * scale;

    const newAngle = Math.atan2(dy, dx);
    selectedSticker.rotation = pinchData.startAngle + (newAngle - pinchData.initialRotation);

    drawAll();
  } else {
    onDrag(e);
  }
}

// 마우스 + 터치 이벤트 등록
decorateCanvas.addEventListener('mousedown', startDrag);
decorateCanvas.addEventListener('mousemove', onDrag);
decorateCanvas.addEventListener('mouseup', endDrag);

decorateCanvas.addEventListener('touchstart', startDrag, { passive: false });
decorateCanvas.addEventListener('touchmove', onTouchMove, { passive: false });
decorateCanvas.addEventListener('touchend', endDrag);

// 삭제
window.addEventListener('keydown', e => {
  if (!selectedSticker) return;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    stickers = stickers.filter(s => s !== selectedSticker);
    selectedSticker = null;
    drawAll();
  }
});

deleteBtn.addEventListener('click', () => {
  if (selectedSticker) {
    stickers = stickers.filter(s => s !== selectedSticker);
    selectedSticker = null;
    drawAll();
  }
});
