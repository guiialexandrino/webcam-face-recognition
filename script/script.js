const guilhermeRef =
  '-0.084117591381073,0.06108437851071358,0.09354554116725922,-0.058625705540180206,-0.042006757110357285,0.0013718984555453062,-0.006931652314960957,-0.09367702901363373,0.17042754590511322,-0.1524570882320404,0.2250133454799652,-0.017614610493183136,-0.16757948696613312,0.031461186707019806,-0.05027111992239952,0.06534365564584732,-0.1928996592760086,-0.13519684970378876,-0.037466660141944885,-0.02157386764883995,0.02032960206270218,0.07425709068775177,-0.026754796504974365,0.10262735188007355,-0.12275351583957672,-0.26482662558555603,-0.07910259813070297,-0.1370507776737213,0.038744669407606125,-0.0990220457315445,-0.06375844776630402,0.031142499297857285,-0.08435702323913574,0.05812118574976921,-0.010937030427157879,0.09317025542259216,-0.019235048443078995,-0.10867935419082642,0.24406863749027252,0.07529974728822708,-0.11925363540649414,0.027841459959745407,0.003410374280065298,0.32677993178367615,0.136088564991951,0.0294052641838789,-0.006018844898790121,-0.10919246822595596,0.1645742505788803,-0.23199935257434845,0.08244897425174713,0.14680178463459015,0.15421544015407562,0.08067145943641663,0.10964034497737885,-0.1926794946193695,0.06112532317638397,0.006664380896836519,-0.16382655501365662,0.11015433073043823,0.04112207144498825,-0.007461950182914734,0.0975390151143074,-0.05381806567311287,0.21063829958438873,0.1065223440527916,-0.09819868952035904,-0.09824521094560623,0.022573325783014297,-0.20801123976707458,-0.12427209317684174,0.09170190989971161,-0.12168046832084656,-0.16894131898880005,-0.21759526431560516,0.02996121160686016,0.36002352833747864,0.20947284996509552,-0.1790999472141266,-0.009149900637567043,-0.017500875517725945,-0.11504492163658142,0.15933382511138916,0.1260656863451004,-0.12897807359695435,-0.007984286174178123,-0.11812109500169754,0.03585352748632431,0.24249595403671265,0.014405149966478348,-0.048173606395721436,0.2037051022052765,-0.011875474825501442,0.02474231645464897,-0.011609048582613468,-0.03192340210080147,-0.10765586793422699,0.07217419147491455,-0.057408615946769714,0.027429472655057907,0.010994247160851955,-0.018932759761810303,-0.005548711866140366,0.10719438642263412,-0.21666063368320465,0.09455277025699615,-0.05037201568484306,-0.08506470173597336,-0.013651003129780293,-0.002531128004193306,-0.1836910843849182,0.00481559569016099,0.1690618395805359,-0.2545928359031677,0.1263086348772049,0.1346309930086136,0.07202600687742233,0.11865701526403427,0.0601704977452755,0.035925474017858505,-0.018996858969330788,0.0068054585717618465,-0.1471502184867859,-0.01649160496890545,0.08046450465917587,-0.017880810424685478,0.09368539601564407,-0.007215009070932865';

const video = document.getElementById('video');
const canvasCatcher = document.getElementById('canvasCatcher');
const captureButton = document.getElementById('capture');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('../models'),
]).then(start());

async function start(type = 'single') {
  console.log(
    `Detecção ${type === 'single' ? 'SINGLE FACE' : 'MULTIPLE FACES'}`
  );
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    addEventToTakeASnapshot();

    video.addEventListener('play', async () => {
      const canvas = faceapi.createCanvasFromMedia(video);
      document.body.append(canvas);
      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      // Gera Referencias a partir de um Banco de imagens
      // const labeledFaceDescriptors = await loadLabeledImages();

      // Gera referencia a partir do Float32Array salvo
      const labeledFaceDescriptors = await loadLabeledImagesFromFloat32Array(
        'Guilherme Alexandrino',
        guilhermeRef
      );

      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

      setInterval(async () => {
        let detections;
        let resizedDetections;

        if (type === 'multiple') {
          detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();
          if (!detections) return;
          resizedDetections = faceapi.resizeResults(detections, displaySize);
        }

        if (type === 'single') {
          detections = await faceapi
            .detectSingleFace(video)
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (!detections) return;
          resizedDetections = [faceapi.resizeResults(detections, displaySize)];
        }

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
          // console.log('encontrou: ', results[0].label);
        }
      }, 100);
    });
  } catch (e) {
    console.error('Erro ao acessar webcam!');
  }
}

// Utilizar banco de imagens hospedadas em algum servidor.
function loadLabeledImages() {
  const labels = ['GuilhermeA', 'Mestre', 'Idosinha', 'RamiraTurbo'];
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

// Gera referencia a partir do Float32Array salvo
async function loadLabeledImagesFromFloat32Array(label, stringfloatArray) {
  const floatArray = Float32Array.from(stringfloatArray.split(','), parseFloat);
  const info = await new faceapi.LabeledFaceDescriptors(label, [floatArray]);
  return [info];
}

const addEventToTakeASnapshot = () => {
  captureButton.addEventListener('click', async () => {
    const context = canvasCatcher.getContext('2d');
    canvasCatcher.width = video.width;
    canvasCatcher.height = video.height;
    context.drawImage(video, 0, 0, canvasCatcher.width, canvasCatcher.height);

    // Converter para base64 e exibir
    const img = document.createElement('img');
    img.src = canvasCatcher.toDataURL('image/png');
    img.width = video.width;
    img.height = video.height;
    img.onload = async function () {
      await detectFace(img);
    };
  });
};

async function detectFace(image) {
  const labeledFaceDescriptors = await loadLabeledImagesFromFloat32Array(
    'Guilherme Alexandrino',
    guilhermeRef
  );

  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

  const detections = await faceapi
    .detectSingleFace(image)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detections) return;

  const result = faceMatcher.findBestMatch(detections.descriptor);
  console.log(result);
}
