'use strict';

const SIZE = 640;
const status = document.querySelector('#camera-status');
const button = document.querySelector('#camera');
const buttonText = button.querySelector('span');
const video = document.querySelector('#video');
const stageNote = document.querySelector('#stage-note');
const eyes = ['left', 'right'].map(side => ({
  side,
  canvas: document.getElementById(side),
  label: document.getElementById(side + '-label'),
  get ctx() { return this.canvas.getContext('2d', { alpha: false }); },
}));

function layer(size = SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  return { canvas, ctx: canvas.getContext('2d') };
}

const focusLayers = {
  left: { off: layer(16), on: layer(22) },
  right: { off: layer(256), on: layer() },
};
const centerBlur = layer(64);
const patch = layer();
const stages = [
  { text: 'The spot is off. You can compare the blur on its own.' },
  { text: 'A small, faint patch softens details in the middle.', radius: 84, core: .46 },
  { text: 'A dark spot hides details in the middle.', radius: 110, core: .91 },
  { text: 'A larger, darker patch obscures more of the middle.', radius: 194, core: .94 },
];
const scene = new Image();
let sceneFailed = false;
let camera = null;
let request = 0;
let pending = false;
let frameId = 0;
let side, stage, glasses;

function update() {
  side = document.querySelector('[name=side]:checked').value;
  stage = Number(document.querySelector('[name=stage]:checked').value);
  glasses = document.querySelector('[name=glasses]:checked').value === 'on';
  stageNote.textContent = stages[stage].text;
  for (const eye of eyes) {
    const hasSpot = eye.side === side && stage !== 0;
    const detail = eye.side === 'left' ? 'Heavy blur' : 'Clearer detail';
    const label = hasSpot ? detail + ' + dark spot' : detail;
    eye.label.textContent = label;
    eye.label.classList.toggle('affected', hasSpot);
    eye.canvas.setAttribute('aria-label', (eye.side === 'left' ? 'Left' : 'Right') +
      ' eye: ' + label + '. Glasses ' + (glasses ? 'on.' : 'off.'));
    eye.canvas.removeAttribute('aria-labelledby');
  }
  render();
}

function drawSquare(target, source, width, height) {
  const crop = Math.min(width, height);
  target.ctx.drawImage(source, (width - crop) / 2, (height - crop) / 2, crop, crop,
    0, 0, target.canvas.width, target.canvas.height);
}

function render() {
  const live = camera && video.readyState >= 2 && video.videoWidth > 0;
  const source = live ? video : scene;
  const width = live ? video.videoWidth : scene.naturalWidth;
  const height = live ? video.videoHeight : scene.naturalHeight;
  if (!width || !height) return;

  const setting = glasses ? 'on' : 'off';
  const left = focusLayers.left[setting];
  const right = focusLayers.right[setting];
  drawSquare(left, source, width, height);
  drawSquare(right, source, width, height);

  if (stage) {
    const { radius, core } = stages[stage];
    const center = SIZE / 2;
    const spotSource = side === 'left' ? left : right;
    centerBlur.ctx.drawImage(spotSource.canvas, 0, 0, centerBlur.canvas.width, centerBlur.canvas.height);
    const ctx = patch.ctx;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(centerBlur.canvas, 0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = 'destination-in';
    let gradient = ctx.createRadialGradient(center, center, 0, center, center, radius * 1.28);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(.39, 'white');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.globalCompositeOperation = 'source-over';

    gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, 'rgba(24, 21, 18,' + core + ')');
    gradient.addColorStop(.3, 'rgba(30, 25, 21,' + core * .8 + ')');
    gradient.addColorStop(1, 'rgba(36, 30, 24, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }

  for (const eye of eyes) {
    const base = eye.side === 'left' ? left : right;
    eye.ctx.drawImage(base.canvas, 0, 0, SIZE, SIZE);
    if (stage && eye.side === side) eye.ctx.drawImage(patch.canvas, 0, 0);
  }
}

function cancelFrame() {
  if (!frameId) return;
  if (video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(frameId);
  else cancelAnimationFrame(frameId);
  frameId = 0;
}

function tick() {
  frameId = 0;
  if (!camera || pending) return;
  render();
  frameId = video.requestVideoFrameCallback ?
    video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
}

function stopCamera(message = sceneFailed ? 'Illustrated scene could not load.' : 'Illustrated scene') {
  request++;
  pending = false;
  cancelFrame();
  camera?.getTracks().forEach(track => track.stop());
  camera = null;
  video.srcObject = null;
  buttonText.textContent = 'Use my camera';
  status.textContent = message;
  render();
}

async function toggleCamera() {
  if (camera || pending) return stopCamera();
  if (!navigator.mediaDevices?.getUserMedia) {
    stopCamera(isSecureContext ? 'This browser doesn’t provide camera access.' : 'Open the HTTPS site to use your camera.');
    return;
  }
  const attempt = ++request;
  pending = true;
  buttonText.textContent = 'Cancel camera';
  status.textContent = 'Waiting for camera permission…';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 960 }, height: { ideal: 720 } },
    });
    if (attempt !== request) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    camera = stream;
    stream.getVideoTracks().forEach(track => {
      track.addEventListener('ended', () => {
        if (camera === stream) stopCamera('Camera disconnected. Showing the illustrated scene.');
      });
    });
    status.textContent = 'Starting camera…';
    video.srcObject = stream;
    await video.play();
    if (attempt !== request) return;
    pending = false;
    buttonText.textContent = 'Stop camera';
    status.textContent = 'Live camera · Both views use the same feed';
    tick();
  } catch (error) {
    if (attempt !== request) return;
    const messages = {
      NotAllowedError: 'Camera blocked. Allow access in your browser to try again.',
      NotFoundError: 'No camera found. You can use the illustrated scene.',
      NotReadableError: 'Camera unavailable. Close other apps using it and try again.',
    };
    stopCamera(messages[error.name] || 'Couldn’t start the camera. Showing the illustrated scene.');
  }
}

scene.onload = render;
scene.onerror = () => {
  sceneFailed = true;
  if (!camera && !pending) status.textContent = 'Illustrated scene could not load. You can still try your camera.';
};
scene.src = './scene.svg';

document.querySelector('.controls').addEventListener('change', update);
document.querySelector('#privacy-link').addEventListener('click', () => {
  document.querySelector('#privacy').open = true;
});
button.addEventListener('click', toggleCamera);
window.addEventListener('pagehide', () => stopCamera());
update();
