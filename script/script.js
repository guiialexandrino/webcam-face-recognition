const guilhermeRef =
  '-0.1401016116142273,0.06270433962345123,0.09309659898281097,-0.03428276255726814,-0.05837283656001091,-0.056607406586408615,-0.010214105248451233,-0.03020695596933365,0.08789657801389694,-0.11103911697864532,0.25003284215927124,-0.10978326946496964,-0.24607153236865997,0.03777407109737396,-0.0634450912475586,0.08864064514636993,-0.15490461885929108,-0.09339562058448792,-0.07787191867828369,-0.07237857580184937,0.06357984244823456,0.044246941804885864,-0.05791611596941948,0.11016851663589478,-0.14592698216438293,-0.27691707015037537,-0.06212139502167702,-0.12123170495033264,0.0584818460047245,-0.09687139838933945,-0.10038037598133087,-0.01221710816025734,-0.07144547253847122,-0.01755714602768421,0.02662183903157711,0.13063979148864746,-0.022701704874634743,-0.12885229289531708,0.26566842198371887,0.06771596521139145,-0.10533256828784943,0.025793040171265602,0.023769140243530273,0.37165772914886475,0.1177201122045517,0.033698104321956635,0.041498973965644836,-0.05097842216491699,0.15540993213653564,-0.2503495514392853,0.013413558714091778,0.16656744480133057,0.12436919659376144,0.10167030245065689,0.11511973291635513,-0.19815155863761902,0.06247744336724281,0.09790529310703278,-0.16357609629631042,0.1266009360551834,0.024805637076497078,-0.045874327421188354,0.09372077137231827,-0.07763999700546265,0.252727746963501,0.045868631452322006,-0.1407722681760788,-0.09558361023664474,0.10273278504610062,-0.1884354054927826,-0.10399017482995987,0.058629654347896576,-0.1091066300868988,-0.14806364476680756,-0.2597288191318512,0.062193017452955246,0.4046122431755066,0.19999033212661743,-0.19000175595283508,0.03634265065193176,-0.06103526055812836,-0.11609933525323868,0.13670259714126587,0.11063490062952042,-0.10390546172857285,0.038885995745658875,-0.1349441558122635,-0.007316349074244499,0.247737854719162,0.01814134791493416,-0.014477647840976715,0.20043355226516724,0.019065679982304573,0.024523649364709854,0.05612476170063019,-0.02010750025510788,-0.18737167119979858,-0.012938548810780048,-0.048375681042671204,0.027901504188776016,0.027819661423563957,-0.16850842535495758,0.011566263623535633,0.09780245274305344,-0.24269802868366241,0.09685177356004715,-0.05704367160797119,-0.0590839758515358,-0.06215362995862961,0.04409714788198471,-0.18154378235340118,0.022523973137140274,0.18050681054592133,-0.29905492067337036,0.12092147022485733,0.2099180668592453,0.10572049021720886,0.12394388020038605,0.12158090621232986,-0.0005158699932508171,0.005233387462794781,0.055469609797000885,-0.12549231946468353,-0.0931258574128151,0.014139709994196892,-0.013253660872578621,0.08048243820667267,0.030424505472183228';

const video = document.getElementById('video');

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

async function loadLabeledImagesFromFloat32Array(label, stringfloatArray) {
  const floatArray = Float32Array.from(stringfloatArray.split(','), parseFloat);
  const info = await new faceapi.LabeledFaceDescriptors(label, [floatArray]);
  return [info];
}
