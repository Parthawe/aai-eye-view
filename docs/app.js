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
const keepControls = document.querySelector('#keep-controls');
const surroundingPage = document.querySelectorAll('.masthead, .camera-launch, .info-panel, .footer');
const phoneLayout = matchMedia('(max-width: 760px), (pointer: coarse) and (max-width: 1050px)');
const spotSize = document.querySelector('#spot-size');
const spotDarkness = document.querySelector('#spot-darkness');
const spotSizeValue = document.querySelector('#spot-size-value');
const spotDarknessValue = document.querySelector('#spot-darkness-value');
const stageInputs = document.querySelectorAll('[name=stage]');
const eyes = ['left', 'right'].map(side => ({
  side,
  canvas: document.getElementById(side),
  toggle: document.getElementById(side + '-toggle'),
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
  { size: 50, darkness: 0 },
  { size: 50, darkness: 40 },
  { size: 50, darkness: 70 },
  { size: 50, darkness: 100 },
];
const scenes = { en: new Image(), mr: new Image() };
let cameraStatus = 'illustrated';
let cameraAction = 'useCamera';
let camera = null;
let request = 0;
let pending = false;
let frameId = 0;
let side, pattern, glasses, darkWidth, spotOpacity;
let nativeFullscreen = false;
let launchedFromStart = false;
let controlsHideTimer;
let adjustingWithPointer = false;
const CONTROLS_IDLE_MS = 5000;
const savedControls = [...document.querySelectorAll('input[type=range], input[type=radio]:not([name=stage]), #keep-controls')];

function saveSettings() {
  const settings = {};
  for (const input of savedControls) {
    if (input.type === 'checkbox') settings[input.id] = input.checked;
    else if (input.type === 'range') settings[input.id] = input.value;
    else if (input.checked) settings[input.name] = input.value;
  }
  try {
    localStorage.setItem('aai-view-settings', JSON.stringify(settings));
  } catch {
    // The viewer also works when browser storage is unavailable.
  }
}

function restoreSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('aai-view-settings')) || {};
    for (const input of savedControls) {
      const value = settings[input.id || input.name];
      if (input.type === 'checkbox') {
        if (typeof value === 'boolean') input.checked = value;
      } else if (input.type === 'range') {
        if (typeof value === 'string' && Number.isFinite(Number(value))) input.value = value;
      } else if (typeof value === 'string') {
        const valid = savedControls.some(candidate => candidate.name === input.name && candidate.value === value);
        if (valid) input.checked = input.value === value;
      }
    }
  } catch {
    // Start with the default view when saved data cannot be read.
  }
}

function updateFullScreenLabel() {
  const expanded = viewer.classList.contains('is-expanded');
  const words = localized[currentLanguage];
  fullScreenLabel.textContent = expanded ? words.exitFullScreen : words.fullScreen;
  fullScreenButton.setAttribute('aria-pressed', String(expanded));
}

function restartControlsTimer() {
  clearTimeout(controlsHideTimer);
  if (keepControls.checked || adjustingWithPointer || !camera || pending ||
      !viewer.classList.contains('is-expanded') ||
      viewer.classList.contains('controls-hidden')) return;
  const focusedControl = document.activeElement;
  if (viewer.contains(focusedControl) &&
      focusedControl.matches('button:not(.eye-toggle):focus-visible, input:focus-visible, a:focus-visible, summary:focus-visible')) return;
  controlsHideTimer = setTimeout(() => setControlsHidden(true), CONTROLS_IDLE_MS);
}

function setControlsHidden(hidden) {
  clearTimeout(controlsHideTimer);
  viewer.classList.toggle('controls-hidden', hidden);
  updateEyeControls();
  if (hidden) {
    viewer.classList.remove('show-adjustments');
    adjustButton.setAttribute('aria-expanded', 'false');
    eyes[0].toggle.focus({ preventScroll: true });
  } else {
    restartControlsTimer();
  }
}

function updateEyeControls() {
  const active = !!camera && !pending && viewer.classList.contains('is-expanded');
  const expanded = !viewer.classList.contains('controls-hidden');
  const words = localized[currentLanguage];
  for (const eye of eyes) {
    eye.toggle.hidden = !active;
    eye.toggle.setAttribute('aria-expanded', String(expanded));
    const action = expanded ? words.hideControls : words.showControls;
    eye.toggle.setAttribute('aria-label', eye.canvas.getAttribute('aria-label') + ' ' + action);
    eye.canvas.setAttribute('aria-hidden', String(active));
  }
}

function setExpanded(expanded) {
  viewer.classList.toggle('is-expanded', expanded);
  document.body.classList.toggle('viewer-expanded', expanded);
  for (const section of surroundingPage) section.inert = expanded;
  if (!expanded) {
    viewer.classList.remove('show-adjustments');
    adjustButton.setAttribute('aria-expanded', 'false');
    if (launchedFromStart || phoneLayout.matches) stopCamera();
    launchedFromStart = false;
  }
  updateFullScreenLabel();
  const focusTarget = !expanded && phoneLayout.matches ?
    document.querySelector('#start-camera') : fullScreenButton;
  focusTarget.focus({ preventScroll: true });
  setControlsHidden(expanded && !!camera && !pending && !keepControls.checked);
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
  pattern = document.querySelector('[name=pattern]:checked').value;
  glasses = document.querySelector('[name=glasses]:checked').value === 'on';
  const size = spotSize.valueAsNumber;
  const darkness = spotDarkness.valueAsNumber;
  darkWidth = (size / 100) * SIZE;
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
    const hasSpot = eye.side === side && darkWidth > 0 && spotOpacity > 0 && level !== 5;
    const effect = pattern === 'edge' ? words.rightDark : words.darkSpot;
    const label = hasSpot ? detail + ' + ' + effect : detail;
    eye.blurLevel.value = number(level) + ' / ' + number(5);
    eye.blur.setAttribute('aria-valuetext', words.blurValue(number(level), number(5), detail));
    eye.label.textContent = hasSpot ? effect : detail;
    eye.label.classList.toggle('affected', hasSpot);
    eye.canvas.toggleAttribute('data-blank', level === 5);
    eye.canvas.setAttribute('aria-label', words.eyeDescription(copy(eye.side + 'Eye'), label, glasses));
    eye.canvas.removeAttribute('aria-labelledby');
  }
  updateEyeControls();
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
    if (eye.side === side && darkWidth > 0 && spotOpacity > 0) drawDarkArea(eye.ctx);
  }
}

function drawDarkArea(ctx) {
  if (pattern === 'edge') {
    const start = SIZE - darkWidth * 2;
    // At 40%, preserve the former Strong fade. Higher levels reach black sooner.
    const strength = Math.max(0, (spotOpacity - .4) / .6);
    const end = SIZE - darkWidth * strength;
    const opacity = Math.min(1, spotOpacity / .4);
    const shade = ctx.createLinearGradient(start, 0, end, 0);
    shade.addColorStop(0, 'transparent');
    shade.addColorStop(1, 'rgba(0, 0, 0,' + opacity + ')');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, SIZE, SIZE);
    return;
  }
  const center = SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, darkWidth / 2);
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
  setControlsHidden(false);
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
    setControlsHidden(viewer.classList.contains('is-expanded') && !keepControls.checked);
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

viewer.addEventListener('change', event => {
  if (event.target.name === 'stage') {
    const preset = stages[Number(event.target.value)];
    spotSize.value = preset.size;
    spotDarkness.value = preset.darkness;
  }
  update();
  saveSettings();
});
spotSize.addEventListener('input', update);
spotDarkness.addEventListener('input', update);
for (const eye of eyes) eye.blur.addEventListener('input', update);
document.querySelector('#privacy-link').addEventListener('click', () => {
  document.querySelector('#story').open = true;
  document.querySelector('#privacy').open = true;
});
button.addEventListener('click', () => {
  if (!camera && !pending && !viewer.classList.contains('is-expanded')) toggleFullScreen();
  toggleCamera();
});
document.querySelector('#start-camera').addEventListener('click', () => {
  launchedFromStart = true;
  // Both permission requests must begin during the same tap.
  toggleFullScreen();
  toggleCamera();
});
fullScreenButton.addEventListener('click', toggleFullScreen);
viewer.addEventListener('pointerdown', () => {
  adjustingWithPointer = true;
  clearTimeout(controlsHideTimer);
});
for (const eventName of ['pointerup', 'pointercancel']) {
  window.addEventListener(eventName, () => {
    adjustingWithPointer = false;
    restartControlsTimer();
  });
}
for (const eventName of ['click', 'input', 'keydown', 'keyup', 'focusin', 'focusout']) {
  viewer.addEventListener(eventName, restartControlsTimer);
}
viewer.addEventListener('click', event => {
  if (!camera || !viewer.classList.contains('is-expanded')) return;
  if (event.target.closest('button, input, label, a, summary, .viewer-heading, .range-control, .controls, .quick-presets')) return;
  setControlsHidden(!viewer.classList.contains('controls-hidden'));
});
for (const eye of eyes) {
  eye.toggle.addEventListener('click', event => {
    setControlsHidden(!viewer.classList.contains('controls-hidden'));
    if (event.detail === 0 && !viewer.classList.contains('controls-hidden')) {
      fullScreenButton.focus({ preventScroll: true });
    }
  });
}
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
restoreSettings();
changeLanguage(new URLSearchParams(location.search).get('lang'));
