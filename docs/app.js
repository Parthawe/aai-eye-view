'use strict';

const SIZE = 640;
const status = document.querySelector('#camera-status');
const button = document.querySelector('#camera');
const buttonText = button.querySelector('span');
const video = document.querySelector('#video');
const viewer = document.querySelector('#viewer');
const fullScreenButton = document.querySelector('#fullscreen');
const fullScreenLabel = fullScreenButton.querySelector('span');
const adjustButton = document.querySelector('#viewer-adjust');
const surroundingPage = document.querySelectorAll('.masthead, .story, .footer');
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
const stages = [
  { size: 34, darkness: 0 },
  { size: 26, darkness: 46 },
  { size: 34, darkness: 91 },
  { size: 61, darkness: 94 },
];
const scenes = { en: new Image(), mr: new Image() };
let cameraStatus = 'illustrated';
let cameraAction = 'useCamera';
let camera = null;
let request = 0;
let pending = false;
let frameId = 0;
let side, glasses, spotRadius, spotOpacity;
let nativeFullscreen = false;

function updateFullScreenLabel() {
  const expanded = viewer.classList.contains('is-expanded');
  const words = localized[currentLanguage];
  fullScreenLabel.textContent = expanded ? words.exitFullScreen : words.fullScreen;
  fullScreenButton.setAttribute('aria-pressed', String(expanded));
}

function setExpanded(expanded) {
  viewer.classList.toggle('is-expanded', expanded);
  document.body.classList.toggle('viewer-expanded', expanded);
  for (const section of surroundingPage) section.inert = expanded;
  if (!expanded) {
    viewer.classList.remove('show-adjustments');
    adjustButton.setAttribute('aria-expanded', 'false');
  }
  updateFullScreenLabel();
  fullScreenButton.focus({ preventScroll: true });
}

async function toggleFullScreen() {
  if (viewer.classList.contains('is-expanded')) {
    if (document.fullscreenElement === viewer) {
      await document.exitFullscreen();
    } else {
      setExpanded(false);
    }
    return;
  }

  setExpanded(true);
  if (document.fullscreenEnabled && viewer.requestFullscreen) {
    try {
      await viewer.requestFullscreen();
    } catch {
      // The viewer already fills the browser viewport.
    }
  }
}

function showCameraStatus(nextStatus = cameraStatus, nextAction = cameraAction) {
  cameraStatus = nextStatus;
  cameraAction = nextAction;
  const words = localized[currentLanguage];
  buttonText.textContent = words[cameraAction];
  status.textContent = words[cameraStatus];
}

function update() {
  const words = localized[currentLanguage];
  side = document.querySelector('[name=side]:checked').value;
  glasses = document.querySelector('[name=glasses]:checked').value === 'on';
  const size = spotSize.valueAsNumber;
  const darkness = spotDarkness.valueAsNumber;
  spotRadius = (size / 100) * SIZE / 2;
  spotOpacity = darkness / 100;
  spotSizeValue.value = number(size) + '%';
  spotDarknessValue.value = number(darkness) + '%';
  spotSize.setAttribute('aria-valuetext', words.sizeValue(spotSizeValue.value));
  spotDarkness.setAttribute('aria-valuetext', words.darknessValue(spotDarknessValue.value));
  for (const input of stageInputs) {
    const preset = stages[Number(input.value)];
    input.checked = preset.size === size && preset.darkness === darkness;
  }
  for (const eye of eyes) {
    const level = eye.blur.valueAsNumber;
    const detail = words.blur[level];
    const hasSpot = eye.side === side && spotRadius > 0 && spotOpacity > 0 && level !== 5;
    const label = hasSpot ? detail + ' + ' + words.darkSpot : detail;
    eye.blurLevel.value = number(level) + ' / ' + number(5);
    eye.blur.setAttribute('aria-valuetext', words.blurValue(number(level), number(5), detail));
    eye.label.textContent = label;
    eye.label.classList.toggle('affected', hasSpot);
    eye.canvas.toggleAttribute('data-blank', level === 5);
    eye.canvas.setAttribute('aria-label', words.eyeDescription(copy(eye.side + 'Eye'), label, glasses));
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
  const scene = scenes[currentLanguage];
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

function illustrationStatus() {
  const scene = scenes[currentLanguage];
  return scene.src && scene.complete && !scene.naturalWidth ? 'illustrationFailed' : 'illustrated';
}

function stopCamera(message = illustrationStatus()) {
  request++;
  pending = false;
  cancelFrame();
  camera?.getTracks().forEach(track => track.stop());
  camera = null;
  video.srcObject = null;
  showCameraStatus(message, 'useCamera');
  render();
}

async function toggleCamera() {
  if (camera || pending) return stopCamera();
  if (!navigator.mediaDevices?.getUserMedia) {
    stopCamera(isSecureContext ? 'unavailableBrowser' : 'secureCamera');
    return;
  }
  const attempt = ++request;
  pending = true;
  showCameraStatus('permission', 'cancelCamera');
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
        if (camera === stream) stopCamera('disconnected');
      });
    });
    showCameraStatus('starting');
    video.srcObject = stream;
    await video.play();
    if (attempt !== request) return;
    pending = false;
    showCameraStatus('liveCamera', 'stopCamera');
    tick();
  } catch (error) {
    if (attempt !== request) return;
    const messages = {
      NotAllowedError: 'denied',
      NotFoundError: 'notFound',
      NotReadableError: 'busy',
    };
    stopCamera(messages[error.name] || 'cameraFailed');
  }
}

function changeLanguage(language) {
  applyLanguage(language);
  updateFullScreenLabel();
  const scene = scenes[currentLanguage];
  if (!scene.src) {
    scene.onload = render;
    scene.onerror = () => {
      if (scene === scenes[currentLanguage] && cameraStatus === 'illustrated') {
        showCameraStatus('illustrationFailed');
      }
    };
    scene.src = currentLanguage === 'mr' ? './scene-mr.svg' : './scene.svg';
  }
  const showingIllustration = cameraStatus === 'illustrated' || cameraStatus === 'illustrationFailed';
  showCameraStatus(showingIllustration ? illustrationStatus() : cameraStatus);
  update();
}

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
fullScreenButton.addEventListener('click', toggleFullScreen);
adjustButton.addEventListener('click', () => {
  const open = viewer.classList.toggle('show-adjustments');
  adjustButton.setAttribute('aria-expanded', String(open));
});
document.addEventListener('fullscreenchange', () => {
  const previous = nativeFullscreen;
  nativeFullscreen = document.fullscreenElement === viewer;
  if (previous && !nativeFullscreen) setExpanded(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !document.fullscreenElement && viewer.classList.contains('is-expanded')) {
    setExpanded(false);
  }
});
window.addEventListener('pagehide', () => stopCamera());
for (const toggle of languageButtons) {
  toggle.addEventListener('click', () => {
    const url = new URL(location.href);
    url.searchParams.set('lang', toggle.dataset.language);
    history.replaceState(null, '', url);
    changeLanguage(toggle.dataset.language);
  });
}
changeLanguage(new URLSearchParams(location.search).get('lang'));
