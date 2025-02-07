const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const photo = document.getElementById('photo');

(async function start() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    captureButton.addEventListener('click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Converter para base64 e exibir
      photo.src = canvas.toDataURL('image/png');
    });
  } catch (e) {
    console.error('Erro ao acessar webcam!');
  }
})();
