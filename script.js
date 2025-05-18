const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const snapBtn = document.getElementById('snap');

// 카메라 켜기
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert('카메라 접근 실패 😥');
    console.error(err);
  });

// 사진 찍기 버튼 클릭 시
snapBtn.addEventListener('click', () => {
  // canvas 크기 설정 (비디오와 동일하게)
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // 비디오 화면을 캔버스에 그리기
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
});
