'use strict';

const SIZE = 640;
const status = document.querySelector('#camera-status');
const button = document.querySelector('#camera');
const buttonText = button.querySelector('span');
const video = document.querySelector('#video');
const spotSize = document.querySelector('#spot-size');
const spotDarkness = document.querySelector('#spot-darkness');
const spotSizeValue = document.querySelector('#spot-size-value');
const spotDarknessValue = document.querySelector('#spot-darkness-value');
const stageInputs = document.querySelectorAll('[name=stage]');
const eyes = ['left', 'right'].map(side => ({
  side,
  canvas: document.getElementById(side),
  label: document.getElementById(side + '-label'),
  blur: document.getElementById(side + '-blur'),
  blurLevel: document.getElementById(side + '-blur-level'),
  get ctx() { return this.canvas.getContext('2d', { alpha: false }); },
}));

function layer(size = SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  return { canvas, ctx: canvas.getContext('2d') };
}

const focusLayers = {
  off: [SIZE, 256, 80, 36, 16].map(layer),
  on: [SIZE, SIZE, 108, 50, 22].map(layer),
};
const blurLabels = ['Sharp focus', 'Slight blur', 'Moderate blur', 'Strong blur', 'Heavy blur', 'No scene detail'];
const stages = [
  { size: 34, darkness: 0 },
  { size: 26, darkness: 46 },
  { size: 34, darkness: 91 },
  { size: 61, darkness: 94 },
];
const scene = new Image();
let sceneFailed = false;
let camera = null;
let request = 0;
let pending = false;
let frameId = 0;
let side, glasses, spotRadius, spotOpacity;

function update() {
  side = document.querySelector('[name=side]:checked').value;
  glasses = document.querySelector('[name=glasses]:checked').value === 'on';
  const size = spotSize.valueAsNumber;
  const darkness = spotDarkness.valueAsNumber;
  spotRadius = (size / 100) * SIZE / 2;
  spotOpacity = darkness / 100;
  spotSizeValue.value = size + '%';
  spotDarknessValue.value = darkness + '%';
  spotSize.setAttribute('aria-valuetext', size + '% of the view width');
  spotDarkness.setAttribute('aria-valuetext', darkness + '% darkness');
  for (const input of stageInputs) {
    const preset = stages[Number(input.value)];
    input.checked = preset.size === size && preset.darkness === darkness;
  }
  for (const eye of eyes) {
    const level = eye.blur.valueAsNumber;
    const detail = blurLabels[level];
    const hasSpot = eye.side === side && spotRadius > 0 && spotOpacity > 0 && level !== 5;
    const label = hasSpot ? detail + ' + dark spot' : detail;
    eye.blurLevel.value = level + ' / 5';
    eye.blur.setAttribute('aria-valuetext', level + ' of 5, ' + detail);
    eye.label.textContent = label;
    eye.label.classList.toggle('affected', hasSpot);
    eye.canvas.toggleAttribute('data-blank', level === 5);
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

  const layers = focusLayers[glasses ? 'on' : 'off'];
  let previousBase;
  for (const eye of eyes) {
    const base = layers[eye.blur.valueAsNumber];
    if (!base) {
      eye.ctx.fillStyle = '#000';
      eye.ctx.fillRect(0, 0, SIZE, SIZE);
      continue;
    }
    if (base !== previousBase) drawSquare(base, source, width, height);
    previousBase = base;
    eye.ctx.drawImage(base.canvas, 0, 0, SIZE, SIZE);
    if (eye.side === side && spotRadius > 0 && spotOpacity > 0) drawSpot(eye.ctx);
  }
}

function drawSpot(ctx) {
  const center = SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, spotRadius);
  gradient.addColorStop(.12, 'rgba(0, 0, 0,' + spotOpacity + ')');
  gradient.addColorStop(.45, 'rgba(0, 0, 0,' + spotOpacity * .67 + ')');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);
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

document.querySelector('.controls').addEventListener('change', event => {
  if (event.target.name === 'stage') {
    const preset = stages[Number(event.target.value)];
    spotSize.value = preset.size;
    spotDarkness.value = preset.darkness;
  }
  update();
});
spotSize.addEventListener('input', update);
spotDarkness.addEventListener('input', update);
for (const eye of eyes) eye.blur.addEventListener('input', update);
document.querySelector('#privacy-link').addEventListener('click', () => {
  document.querySelector('#privacy').open = true;
});
button.addEventListener('click', toggleCamera);
window.addEventListener('pagehide', () => stopCamera());
update();
