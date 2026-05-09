const SCREENSHOT_STORAGE_KEY = 'screenshotEditorImage';
const imageCanvas = document.getElementById('image-canvas');
const drawCanvas = document.getElementById('draw-canvas');
const imageContext = imageCanvas.getContext('2d');
const drawContext = drawCanvas.getContext('2d');
const canvasShell = document.getElementById('canvas-shell');
const emptyState = document.getElementById('empty-state');
const downloadButton = document.getElementById('download-button');
const clearButton = document.getElementById('clear-button');
const arrowModeButton = document.getElementById('arrow-mode-button');
const cropModeButton = document.getElementById('crop-mode-button');
const applyCropButton = document.getElementById('apply-crop-button');
const resetCropButton = document.getElementById('reset-crop-button');

let scaleRatio = 1;
let isDrawing = false;
let startPoint = null;
let currentPoint = null;
let arrows = [];
let toolMode = 'arrow';
let cropRect = null;
let originalImageDataUrl = '';

function resizeCanvases(width, height) {
  imageCanvas.width = width;
  imageCanvas.height = height;
  drawCanvas.width = width;
  drawCanvas.height = height;
}

function getPoint(event) {
  const rect = drawCanvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * scaleRatio,
    y: (event.clientY - rect.top) * scaleRatio,
  };
}

function setToolMode(mode) {
  toolMode = mode;
  drawCanvas.style.cursor = mode === 'crop' ? 'crosshair' : 'crosshair';
  arrowModeButton.style.outline = mode === 'arrow' ? '2px solid #ff5a47' : '';
  cropModeButton.style.outline = mode === 'crop' ? '2px solid #ff5a47' : '';
  renderOverlay();
}

function drawArrow(context, from, to) {
  const headLength = 18;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  context.save();
  context.strokeStyle = '#ff5a47';
  context.fillStyle = '#ff5a47';
  context.lineWidth = 6;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();

  context.beginPath();
  context.moveTo(to.x, to.y);
  context.lineTo(
    to.x - headLength * Math.cos(angle - Math.PI / 7),
    to.y - headLength * Math.sin(angle - Math.PI / 7)
  );
  context.lineTo(
    to.x - headLength * Math.cos(angle + Math.PI / 7),
    to.y - headLength * Math.sin(angle + Math.PI / 7)
  );
  context.closePath();
  context.fill();
  context.restore();
}

function normalizeRect(from, to) {
  return {
    x: Math.min(from.x, to.x),
    y: Math.min(from.y, to.y),
    width: Math.abs(to.x - from.x),
    height: Math.abs(to.y - from.y),
  };
}

function drawCropRect(context, rect) {
  if (!rect || !rect.width || !rect.height) {
    return;
  }

  context.save();
  context.fillStyle = 'rgba(0, 0, 0, 0.35)';
  context.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  context.clearRect(rect.x, rect.y, rect.width, rect.height);
  context.strokeStyle = '#58a6ff';
  context.lineWidth = 3;
  context.setLineDash([10, 8]);
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);
  context.restore();
}

function renderOverlay() {
  drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

  arrows.forEach((arrow) => {
    drawArrow(drawContext, arrow.from, arrow.to);
  });

  if (toolMode === 'arrow' && isDrawing && startPoint && currentPoint) {
    drawArrow(drawContext, startPoint, currentPoint);
  }

  if (toolMode === 'crop') {
    drawCropRect(drawContext, cropRect);

    if (isDrawing && startPoint && currentPoint) {
      drawCropRect(drawContext, normalizeRect(startPoint, currentPoint));
    }
  }
}

function finishArrow() {
  if (!isDrawing || !startPoint || !currentPoint) {
    isDrawing = false;
    startPoint = null;
    currentPoint = null;
    return;
  }

  arrows.push({
    from: startPoint,
    to: currentPoint,
  });

  isDrawing = false;
  startPoint = null;
  currentPoint = null;
  renderOverlay();
}

function finishCrop() {
  if (!isDrawing || !startPoint || !currentPoint) {
    isDrawing = false;
    startPoint = null;
    currentPoint = null;
    renderOverlay();
    return;
  }

  cropRect = normalizeRect(startPoint, currentPoint);
  isDrawing = false;
  startPoint = null;
  currentPoint = null;
  renderOverlay();
}

function downloadImage() {
  if (!imageCanvas.width || !imageCanvas.height) {
    return;
  }

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = imageCanvas.width;
  exportCanvas.height = imageCanvas.height;
  const exportContext = exportCanvas.getContext('2d');

  exportContext.drawImage(imageCanvas, 0, 0);
  exportContext.drawImage(drawCanvas, 0, 0);

  const link = document.createElement('a');
  link.href = exportCanvas.toDataURL('image/png');
  link.download = `print-tray-${Date.now()}.png`;
  link.click();
}

function applyCrop() {
  if (!cropRect || !cropRect.width || !cropRect.height) {
    return;
  }

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = cropRect.width;
  exportCanvas.height = cropRect.height;
  const exportContext = exportCanvas.getContext('2d');

  exportContext.drawImage(
    imageCanvas,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    cropRect.width,
    cropRect.height
  );

  const croppedImage = new Image();
  croppedImage.onload = () => {
    resizeCanvases(croppedImage.width, croppedImage.height);
    imageContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    imageContext.drawImage(croppedImage, 0, 0);
    arrows = [];
    cropRect = null;
    renderOverlay();
    requestAnimationFrame(() => {
      scaleRatio = imageCanvas.width / drawCanvas.getBoundingClientRect().width;
    });
  };
  croppedImage.src = exportCanvas.toDataURL('image/png');
}

function resetImage() {
  if (!originalImageDataUrl) {
    return;
  }

  const image = new Image();
  image.onload = () => {
    resizeCanvases(image.width, image.height);
    imageContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    imageContext.drawImage(image, 0, 0);
    arrows = [];
    cropRect = null;
    renderOverlay();
    requestAnimationFrame(() => {
      scaleRatio = imageCanvas.width / drawCanvas.getBoundingClientRect().width;
    });
  };
  image.src = originalImageDataUrl;
}

async function loadScreenshot() {
  const data = await chrome.storage.local.get(SCREENSHOT_STORAGE_KEY);
  const imageDataUrl = data[SCREENSHOT_STORAGE_KEY];

  if (!imageDataUrl) {
    emptyState.hidden = false;
    canvasShell.hidden = true;
    return;
  }

  originalImageDataUrl = imageDataUrl;
  const image = new Image();
  image.onload = () => {
    resizeCanvases(image.width, image.height);
    imageContext.drawImage(image, 0, 0, image.width, image.height);

    requestAnimationFrame(() => {
      scaleRatio = image.width / drawCanvas.getBoundingClientRect().width;
    });

    emptyState.hidden = true;
    canvasShell.hidden = false;
    renderOverlay();
  };
  image.onerror = () => {
    emptyState.hidden = false;
    canvasShell.hidden = true;
    emptyState.innerHTML =
      'Nao foi possivel carregar a captura. Tente gerar um novo print pela extensao.';
  };
  image.src = imageDataUrl;
}

drawCanvas.addEventListener('pointerdown', (event) => {
  isDrawing = true;
  startPoint = getPoint(event);
  currentPoint = startPoint;
  renderOverlay();
});

drawCanvas.addEventListener('pointermove', (event) => {
  if (!isDrawing) {
    return;
  }

  currentPoint = getPoint(event);
  renderOverlay();
});

drawCanvas.addEventListener('pointerup', () => {
  if (toolMode === 'crop') {
    finishCrop();
    return;
  }

  finishArrow();
});
drawCanvas.addEventListener('pointerleave', () => {
  if (toolMode === 'crop') {
    finishCrop();
    return;
  }

  finishArrow();
});
clearButton.addEventListener('click', () => {
  arrows = [];
  renderOverlay();
});
arrowModeButton.addEventListener('click', () => setToolMode('arrow'));
cropModeButton.addEventListener('click', () => setToolMode('crop'));
applyCropButton.addEventListener('click', applyCrop);
resetCropButton.addEventListener('click', resetImage);
downloadButton.addEventListener('click', downloadImage);
window.addEventListener('resize', () => {
  if (!drawCanvas.getBoundingClientRect().width) {
    return;
  }

  scaleRatio = imageCanvas.width / drawCanvas.getBoundingClientRect().width;
});

loadScreenshot();
setToolMode('arrow');
