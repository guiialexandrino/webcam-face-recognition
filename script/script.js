const video = document.getElementById('video');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('../models'),
]).then(start);

async function start() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    video.addEventListener('play', async () => {
      const canvas = faceapi.createCanvasFromMedia(video);
      document.body.append(canvas);
      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);
      const labeledFaceDescriptors = await loadLabeledImages();
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        const results = resizedDetections.map((d) =>
          faceMatcher.findBestMatch(d.descriptor)
        );

        results.forEach((result, i) => {
          const box = resizedDetections[i].detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, {
            label: result.toString(),
          });
          drawBox.draw(canvas);
        });

        if (results[0] && results[0].label !== 'unknown') {
          console.log('encontrou: ', results[0].label);
        }
      }, 100);
    });
  } catch (e) {
    console.error('Erro ao acessar webcam!');
  }
}

function loadLabeledImages() {
  console.log('quantas vezes executa?');
  const labels = ['GuilhermeA', 'Mestre', 'Idosinha'];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(
          `https://raw.githubusercontent.com/guiialexandrino/webcam-face-recognition/development/images-database/${label}/${i}.png`
        );
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
