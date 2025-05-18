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

const decorateContainer = document.getElementById('decorate-container');
const uploadInput = document.getElementById('sticker-upload');
const deleteBtn = document.getElementById('delete-sticker');
const saveBtn = document.getElementById('save-decorated');

let currentFacing = "environment";
let currentStream = null;
let selectedStickerEl = null;

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

// ✅ 사용하기 (꾸미기 화면으로 전환)
useBtn.addEventListener('click', () => {
  previewScreen.style.display = 'none';
  decorateScreen.style.display = 'block';

  const width = previewCanvas.width;
  const height = previewCanvas.height;
  decorateCanvas.width = width;
  decorateCanvas.height = height;

  decorateCtx.drawImage(previewCanvas, 0, 0);
});

// 🖼️ 스티커 업로드
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = document.createElement('img');
  img.classList.add('sticker');
  img.src = URL.createObjectURL(file);
  img.style.left = '50px';
  img.style.top = '50px';
  img.style.width = '100px';

  img.addEventListener('click', (ev) => {
    ev.stopPropagation();
    selectSticker(img);
  });

  makeDraggable(img);
  decorateContainer.appendChild(img);
});

// 🔴 선택 / 해제
function selectSticker(el) {
  if (selectedStickerEl) {
    selectedStickerEl.classList.remove('selected');
  }
  selectedStickerEl = el;
  selectedStickerEl.classList.add('selected');
}

decorateContainer.addEventListener('click', () => {
  if (selectedStickerEl) {
    selectedStickerEl.classList.remove('selected');
    selectedStickerEl = null;
  }
});

// 🗑️ 스티커 삭제
deleteBtn.addEventListener('click', () => {
  if (selectedStickerEl) {
    selectedStickerEl.remove();
    selectedStickerEl = null;
  }
});

// 📦 드래그, 휠 확대/축소
function makeDraggable(el) {
  let offsetX, offsetY, isDragging = false;

  el.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    el.style.left = `${e.pageX - decorateContainer.offsetLeft - offsetX}px`;
    el.style.top = `${e.pageY - decorateContainer.offsetTop - offsetY}px`;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // 크기 조절
  el.addEventListener('wheel', (e) => {
    e.preventDefault();
    const scale = parseFloat(el.style.width) || 100;
    const delta = e.deltaY > 0 ? -10 : 10;
    const newSize = Math.max(30, scale + delta);
    el.style.width = `${newSize}px`;
  });
}

// 💾 저장
saveBtn.addEventListener('click', () => {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = decorateCanvas.width;
  tempCanvas.height = decorateCanvas.height;
  tempCtx.drawImage(decorateCanvas, 0, 0);

  const stickers = document.querySelectorAll('.sticker');
  stickers.forEach(sticker => {
    const x = parseFloat(sticker.style.left);
    const y = parseFloat(sticker.style.top);
    const w = parseFloat(sticker.style.width);
    const img = new Image();
    img.src = sticker.src;
    tempCtx.drawImage(img, x, y, w, w);
  });

  const link = document.createElement('a');
  link.download = 'decorated-photo.png';
  link.href = tempCanvas.toDataURL();
  link.click();
});
