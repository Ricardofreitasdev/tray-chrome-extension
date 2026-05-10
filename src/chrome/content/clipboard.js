(function () {
  if (window.__trayClipboardManagerInjected) {
    return;
  }

  window.__trayClipboardManagerInjected = true;

  const OVERLAY_ID = 'tray-extension-clipboard-overlay';
  const TOAST_ID = 'tray-extension-clipboard-toast';
  const STYLE_ID = 'tray-extension-clipboard-style';
  const HOTKEY = 'Alt+Shift+V';
  const SCREENSHOT_EDITOR_ID = 'tray-extension-screenshot-editor';

  let lastCapturedText = '';
  let screenshotEditorState = null;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${TOAST_ID} {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2147483647;
        background: rgba(13, 17, 23, 0.96);
        color: #f0f6fc;
        border: 1px solid rgba(88, 166, 255, 0.35);
        border-radius: 12px;
        padding: 12px 14px;
        font: 13px/1.4 Arial, sans-serif;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.32);
      }

      #${TOAST_ID} strong {
        display: block;
        margin-bottom: 3px;
      }

      #${OVERLAY_ID} {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 360px;
        max-height: 420px;
        overflow: hidden;
        background: rgba(13, 17, 23, 0.98);
        color: #f0f6fc;
        border: 1px solid rgba(88, 166, 255, 0.22);
        border-radius: 14px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.42);
        z-index: 2147483647;
        font: 13px/1.4 Arial, sans-serif;
      }

      #${OVERLAY_ID} .tray-header,
      #${OVERLAY_ID} .tray-item {
        padding: 12px 14px;
      }

      #${OVERLAY_ID} .tray-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      #${OVERLAY_ID} .tray-header strong {
        display: block;
      }

      #${OVERLAY_ID} .tray-header span {
        color: #93a1b3;
        font-size: 11px;
      }

      #${OVERLAY_ID} .tray-list {
        max-height: 340px;
        overflow-y: auto;
      }

      #${OVERLAY_ID} .tray-item {
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        cursor: pointer;
      }

      #${OVERLAY_ID} .tray-item:hover {
        background: rgba(88, 166, 255, 0.08);
      }

      #${OVERLAY_ID} .tray-item:last-child {
        border-bottom: none;
      }

      #${OVERLAY_ID} .tray-text {
        color: #f0f6fc;
        word-break: break-word;
      }

      #${OVERLAY_ID} .tray-meta {
        color: #93a1b3;
        font-size: 11px;
        margin-top: 4px;
      }

      #${OVERLAY_ID} button {
        background: rgba(255, 255, 255, 0.06);
        color: #f0f6fc;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        padding: 6px 10px;
        cursor: pointer;
      }

      #${OVERLAY_ID} .tray-empty {
        padding: 18px 14px;
        color: #93a1b3;
      }

      #${SCREENSHOT_EDITOR_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        background: transparent;
        color: #f5f7fb;
        font: 13px/1.4 Arial, sans-serif;
        pointer-events: auto;
      }

      #${SCREENSHOT_EDITOR_ID},
      #${SCREENSHOT_EDITOR_ID} * {
        box-sizing: border-box;
        font-family: Arial, sans-serif;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-toolbar {
        position: fixed;
        left: 50%;
        bottom: 24px;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px;
        border-radius: 18px;
        background: rgba(10, 14, 22, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.38);
        z-index: 5;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-toolbar button {
        width: 42px;
        height: 42px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.06);
        color: #f5f7fb;
        border-radius: 12px;
        padding: 0;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition:
          background-color 0.18s ease,
          border-color 0.18s ease,
          transform 0.18s ease,
          opacity 0.18s ease;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-toolbar button:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(88, 166, 255, 0.32);
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-toolbar button:disabled {
        opacity: 0.38;
        cursor: not-allowed;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-toolbar button svg {
        width: 18px;
        height: 18px;
        display: block;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-toolbar input[type='color'] {
        width: 42px;
        height: 42px;
        padding: 5px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.06);
        cursor: pointer;
      }

      #${SCREENSHOT_EDITOR_ID}
        .tray-shot-toolbar
        input[type='color']::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      #${SCREENSHOT_EDITOR_ID}
        .tray-shot-toolbar
        input[type='color']::-webkit-color-swatch {
        border: none;
        border-radius: 8px;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-toolbar button.primary {
        background: #ff5a47;
        color: #220502;
        border-color: transparent;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-toolbar button.is-active {
        background: rgba(88, 166, 255, 0.14);
        border-color: rgba(88, 166, 255, 0.55);
        color: #58a6ff;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-shell {
        position: fixed;
        inset: 0;
        overflow: hidden;
        background: transparent;
        border-radius: 0;
        box-shadow: none;
        z-index: 2;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-image {
        position: absolute;
        inset: 0;
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        opacity: 1 !important;
        visibility: visible !important;
        filter: none !important;
        mix-blend-mode: normal !important;
        transform: none !important;
        background: transparent !important;
        z-index: 1;
        object-fit: fill !important;
        pointer-events: none;
      }

      #${SCREENSHOT_EDITOR_ID} canvas {
        position: absolute;
        inset: 0;
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        opacity: 1 !important;
        visibility: visible !important;
        filter: none !important;
        mix-blend-mode: normal !important;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-draw {
        position: absolute;
        inset: 0;
        cursor: crosshair;
        z-index: 2;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-text-box {
        position: absolute;
        z-index: 6;
        width: 1px;
        height: 1px;
        padding: 0;
        border: none;
        background: transparent;
        box-shadow: none;
        opacity: 0.01;
        overflow: hidden;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-text-box textarea {
        width: 1px;
        min-height: 1px;
        resize: none;
        border: none;
        background: transparent;
        color: transparent;
        -webkit-text-fill-color: transparent;
        caret-color: transparent;
        border-radius: 0;
        padding: 0;
        outline: none;
        overflow: hidden;
        font: 700 24px/1.2 Arial, sans-serif;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-text-box textarea:focus {
        outline: none;
      }

      #${SCREENSHOT_EDITOR_ID} .tray-shot-selection-label {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 5;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(10, 14, 22, 0.86);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #c9d1d9;
        font-size: 12px;
        pointer-events: none;
      }

      #${SCREENSHOT_EDITOR_ID}.is-cropped .tray-shot-selection-label {
        display: none;
      }

      @media (max-width: 640px) {
        #${SCREENSHOT_EDITOR_ID} .tray-shot-toolbar {
          gap: 6px;
          padding: 8px;
        }

        #${SCREENSHOT_EDITOR_ID} .tray-shot-toolbar button {
          width: 38px;
          height: 38px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function limitText(text, limit) {
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  }

  function showToast(title, description) {
    ensureStyles();
    const existing = document.getElementById(TOAST_ID);
    if (existing) {
      existing.remove();
    }

    const toast = document.createElement('div');
    toast.id = TOAST_ID;
    toast.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
    document.body.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
    }, 2600);
  }

  function getSelectedText() {
    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === 'TEXTAREA' ||
        (activeElement.tagName === 'INPUT' &&
          /^(text|search|url|tel|password|email)$/i.test(activeElement.type)))
    ) {
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      if (start !== end) {
        return activeElement.value.slice(start, end);
      }
    }

    return window.getSelection ? window.getSelection().toString() : '';
  }

  function getCopiedText(event) {
    const clipboardText = event?.clipboardData?.getData('text/plain');
    if (clipboardText && clipboardText.trim()) {
      return clipboardText;
    }

    return getSelectedText();
  }

  function removeOverlay() {
    document.getElementById(OVERLAY_ID)?.remove();
  }

  function removeScreenshotEditor() {
    if (screenshotEditorState?.resizeHandler) {
      window.removeEventListener('resize', screenshotEditorState.resizeHandler);
    }
    document.getElementById(SCREENSHOT_EDITOR_ID)?.remove();
    screenshotEditorState = null;
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(
        'Copiado novamente',
        'O item voltou para a area de transferencia.'
      );
    } catch {
      showToast('Nao foi possivel copiar', 'Tente usar o popup da extensao.');
    }
  }

  function formatTimestamp(value) {
    if (!value) {
      return '';
    }

    try {
      return new Date(value).toLocaleString('pt-BR');
    } catch {
      return '';
    }
  }

  function renderOverlay(items) {
    ensureStyles();
    removeOverlay();

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;

    const header = document.createElement('div');
    header.className = 'tray-header';
    header.innerHTML = `
      <div>
        <strong>Historico de copias</strong>
        <span>Clique para copiar novamente. Fechar: Esc</span>
      </div>
    `;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = 'Fechar';
    closeButton.addEventListener('click', removeOverlay);
    header.appendChild(closeButton);
    overlay.appendChild(header);

    const list = document.createElement('div');
    list.className = 'tray-list';

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'tray-empty';
      empty.textContent =
        'Nenhuma copia salva ainda nesta sessao do navegador.';
      list.appendChild(empty);
    }

    items.forEach((item) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'tray-item';
      itemElement.innerHTML = `
        <div class="tray-text">${limitText(item.text, 160)}</div>
        <div class="tray-meta">${formatTimestamp(item.createdAt)}</div>
      `;
      itemElement.addEventListener('click', async () => {
        await copyToClipboard(item.text);
        removeOverlay();
      });
      list.appendChild(itemElement);
    });

    overlay.appendChild(list);
    document.body.appendChild(overlay);
  }

  function createArrowRenderer(context, from, to, color = '#ff5a47') {
    const headLength = 22;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const shaftOffset = 12;

    const shaftEnd = {
      x: to.x - shaftOffset * Math.cos(angle),
      y: to.y - shaftOffset * Math.sin(angle),
    };

    context.save();
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 6;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(shaftEnd.x, shaftEnd.y);
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

  function drawTextAnnotation(context, entry) {
    const lines = entry.text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return;
    }

    const lineHeight = 28;

    context.save();
    context.font = '700 24px Arial';
    context.textBaseline = 'top';
    context.fillStyle = entry.color || '#ff5a47';
    lines.forEach((line, index) => {
      context.fillText(line, entry.x, entry.y + index * lineHeight);
    });

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

  function drawCropSelectionFrame(context, rect) {
    const points = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x, y: rect.y + rect.height },
      { x: rect.x + rect.width, y: rect.y + rect.height },
    ];

    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.35)';
    context.shadowBlur = 10;
    context.strokeStyle = '#ffffff';
    context.lineWidth = 2;
    context.setLineDash([]);
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);

    points.forEach((point) => {
      context.beginPath();
      context.fillStyle = '#ffffff';
      context.arc(point.x, point.y, 6.5, 0, Math.PI * 2);
      context.fill();
    });

    context.restore();
  }

  function updateScreenshotShellLayout() {
    const state = screenshotEditorState;
    if (!state?.shellElement || !state?.toolbarElement) {
      return;
    }

    const hasSelection = Boolean(state.selectionDisplayRect);
    state.root.classList.toggle('is-cropped', hasSelection);

    if (!hasSelection) {
      Object.assign(state.shellElement.style, {
        left: '0px',
        top: '0px',
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`,
        borderRadius: '0px',
        boxShadow: 'none',
      });

      Object.assign(state.toolbarElement.style, {
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
      });

      return;
    }

    const rect = state.selectionDisplayRect;

    Object.assign(state.shellElement.style, {
      left: `${rect.x}px`,
      top: `${rect.y}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      borderRadius: '18px',
      boxShadow: '0 24px 80px rgba(0, 0, 0, 0.36)',
    });

    Object.assign(state.toolbarElement.style, {
      left: '50%',
      top: '',
      bottom: '24px',
      transform: 'translateX(-50%)',
    });
  }

  function renderScreenshotOverlay() {
    if (!screenshotEditorState) {
      return;
    }

    const {
      drawCanvas,
      drawContext,
      toolMode,
      arrows,
      textEntries,
      isDrawing,
      startPoint,
      currentPoint,
      cropRect,
    } = screenshotEditorState;

    drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

    arrows.forEach((arrow) => {
      createArrowRenderer(drawContext, arrow.from, arrow.to, arrow.color);
    });

    textEntries.forEach((entry) => {
      drawTextAnnotation(drawContext, entry);
    });

    if (screenshotEditorState.draftTextEntry?.text?.trim()) {
      drawTextAnnotation(drawContext, screenshotEditorState.draftTextEntry);
    }

    if (toolMode === 'arrow' && isDrawing && startPoint && currentPoint) {
      createArrowRenderer(
        drawContext,
        startPoint,
        currentPoint,
        screenshotEditorState.annotationColor
      );
    }

    if (toolMode === 'crop') {
      const rect =
        isDrawing && startPoint && currentPoint
          ? normalizeRect(startPoint, currentPoint)
          : cropRect;

      if (rect && rect.width && rect.height) {
        drawContext.save();
        drawContext.fillStyle = 'rgba(0, 0, 0, 0.35)';
        drawContext.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
        drawContext.clearRect(rect.x, rect.y, rect.width, rect.height);
        drawCropSelectionFrame(drawContext, rect);
        drawContext.restore();
      }
    }
  }

  function updateScreenshotToolButtons() {
    if (!screenshotEditorState) {
      return;
    }

    const {
      toolMode,
      arrowButton,
      cropButton,
      textButton,
      copyButton,
      downloadButton,
      clearButton,
      resetButton,
      undoButton,
    } = screenshotEditorState;
    const hasSelection = Boolean(screenshotEditorState.selectionDisplayRect);
    const hasAnnotations =
      screenshotEditorState.arrows.length ||
      screenshotEditorState.textEntries.length;

    arrowButton.classList.toggle('is-active', toolMode === 'arrow');
    cropButton.classList.toggle('is-active', toolMode === 'crop');
    textButton.classList.toggle('is-active', toolMode === 'text');
    arrowButton.disabled = !hasSelection;
    textButton.disabled = !hasSelection;
    copyButton.disabled = !hasSelection;
    downloadButton.disabled = !hasSelection;
    clearButton.disabled = !hasSelection || !hasAnnotations;
    undoButton.disabled =
      !hasSelection || !screenshotEditorState.annotationHistory.length;
    resetButton.disabled = !hasSelection;
  }

  function setScreenshotToolMode(mode) {
    if (!screenshotEditorState) {
      return;
    }

    finalizeScreenshotTextComposer();
    screenshotEditorState.toolMode = mode;
    updateScreenshotToolButtons();
    updateScreenshotShellLayout();
    renderScreenshotOverlay();
  }

  function getScreenshotPoint(event) {
    const { drawCanvas } = screenshotEditorState;
    const rect = drawCanvas.getBoundingClientRect();
    const scaleX = drawCanvas.width / rect.width;
    const scaleY = drawCanvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function getScreenshotDisplayPoint(event) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function getDisplayPoint(point) {
    const { drawCanvas } = screenshotEditorState;
    const rect = drawCanvas.getBoundingClientRect();
    const scaleX = rect.width / drawCanvas.width;
    const scaleY = rect.height / drawCanvas.height;

    return {
      x: point.x * scaleX,
      y: point.y * scaleY,
    };
  }

  function syncScreenshotTextComposerColor() {
    const textarea =
      screenshotEditorState?.activeTextBox?.querySelector('textarea');
    if (textarea && screenshotEditorState?.annotationColor) {
      textarea.style.color = screenshotEditorState.annotationColor;
    }

    if (screenshotEditorState?.draftTextEntry) {
      screenshotEditorState.draftTextEntry.color =
        screenshotEditorState.annotationColor;
      renderScreenshotOverlay();
    }
  }

  function autoResizeScreenshotTextarea(textarea) {
    if (!textarea) {
      return;
    }

    textarea.style.height = '0px';
    textarea.style.height = `${Math.max(34, textarea.scrollHeight)}px`;
  }

  function setScreenshotDraftTextValue(value) {
    if (
      !screenshotEditorState?.activeTextBox ||
      !screenshotEditorState?.draftTextEntry
    ) {
      return;
    }

    const textarea =
      screenshotEditorState.activeTextBox.querySelector('textarea');
    if (!textarea) {
      return;
    }

    textarea.value = value;
    screenshotEditorState.draftTextEntry = {
      ...screenshotEditorState.draftTextEntry,
      text: value,
      color: screenshotEditorState.annotationColor,
    };

    autoResizeScreenshotTextarea(textarea);
    renderScreenshotOverlay();
  }

  function removeScreenshotTextComposer() {
    screenshotEditorState?.activeTextBox?.remove();
    if (screenshotEditorState) {
      screenshotEditorState.activeTextBox = null;
      screenshotEditorState.draftTextEntry = null;
      screenshotEditorState.commitDraftText = null;
      screenshotEditorState.cancelDraftText = null;
    }
    renderScreenshotOverlay();
  }

  function finalizeScreenshotTextComposer() {
    if (!screenshotEditorState?.activeTextBox) {
      return;
    }

    screenshotEditorState.commitDraftText?.();
  }

  function pushScreenshotAnnotation(type, payload) {
    if (!screenshotEditorState) {
      return;
    }

    const id = screenshotEditorState.nextAnnotationId++;
    const entry = {
      id,
      ...payload,
    };

    if (type === 'arrow') {
      screenshotEditorState.arrows.push(entry);
    }

    if (type === 'text') {
      screenshotEditorState.textEntries.push(entry);
    }

    screenshotEditorState.annotationHistory.push({
      id,
      type,
    });

    updateScreenshotToolButtons();
  }

  function undoScreenshotAnnotation() {
    if (!screenshotEditorState?.annotationHistory?.length) {
      showToast(
        'Nada para desfazer',
        'Ainda nao existe anotacao para remover.'
      );
      return;
    }

    removeScreenshotTextComposer();

    const lastEntry = screenshotEditorState.annotationHistory.pop();
    if (!lastEntry) {
      return;
    }

    if (lastEntry.type === 'arrow') {
      screenshotEditorState.arrows = screenshotEditorState.arrows.filter(
        (arrow) => arrow.id !== lastEntry.id
      );
    }

    if (lastEntry.type === 'text') {
      screenshotEditorState.textEntries =
        screenshotEditorState.textEntries.filter(
          (entry) => entry.id !== lastEntry.id
        );
    }

    updateScreenshotToolButtons();
    renderScreenshotOverlay();
  }

  function handleScreenshotTextComposerKeydown(event) {
    if (!screenshotEditorState?.activeTextBox) {
      return false;
    }

    if (event.metaKey || event.ctrlKey || event.altKey) {
      return false;
    }

    const textarea =
      screenshotEditorState.activeTextBox.querySelector('textarea');
    if (!textarea) {
      return false;
    }

    const currentValue = textarea.value || '';

    if (event.key === 'Escape') {
      event.preventDefault();
      screenshotEditorState.cancelDraftText?.();
      return true;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.shiftKey) {
        setScreenshotDraftTextValue(`${currentValue}\n`);
      } else {
        screenshotEditorState.commitDraftText?.();
      }
      return true;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      setScreenshotDraftTextValue(currentValue.slice(0, -1));
      return true;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      setScreenshotDraftTextValue(`${currentValue}  `);
      return true;
    }

    if (event.key.length === 1) {
      event.preventDefault();
      setScreenshotDraftTextValue(`${currentValue}${event.key}`);
      return true;
    }

    return false;
  }

  function openScreenshotTextComposer(point) {
    const state = screenshotEditorState;
    if (!state?.shellElement) {
      return;
    }

    finalizeScreenshotTextComposer();

    const displayPoint = getDisplayPoint(point);
    const textBox = document.createElement('div');
    textBox.className = 'tray-shot-text-box';
    textBox.innerHTML = '<textarea placeholder="Digite aqui"></textarea>';

    const shellRect = state.shellElement.getBoundingClientRect();
    const maxLeft = Math.max(12, shellRect.width - 272);
    const maxTop = Math.max(12, shellRect.height - 80);

    textBox.style.left = `${Math.min(displayPoint.x, maxLeft)}px`;
    textBox.style.top = `${Math.min(displayPoint.y, maxTop)}px`;

    const textarea = textBox.querySelector('textarea');
    state.draftTextEntry = {
      x: point.x,
      y: point.y,
      text: '',
      color: state.annotationColor,
    };
    state.commitDraftText = () => {
      const value = textarea.value.trim();
      if (!value) {
        removeScreenshotTextComposer();
        return;
      }

      pushScreenshotAnnotation('text', {
        x: point.x,
        y: point.y,
        text: value,
        color: state.annotationColor,
      });

      removeScreenshotTextComposer();
      renderScreenshotOverlay();
    };
    state.cancelDraftText = () => {
      removeScreenshotTextComposer();
    };

    autoResizeScreenshotTextarea(textarea);
    renderScreenshotOverlay();

    state.shellElement.appendChild(textBox);
    state.activeTextBox = textBox;
    textarea.focus();
  }

  function updateScreenshotSurface(imageDataUrl, clearAnnotations = false) {
    const state = screenshotEditorState;
    if (!state) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      state.imageElement.src = imageDataUrl;
      state.imageElement.width = image.width;
      state.imageElement.height = image.height;
      state.drawCanvas.width = image.width;
      state.drawCanvas.height = image.height;

      if (clearAnnotations) {
        state.arrows = [];
        state.textEntries = [];
        state.annotationHistory = [];
      }

      state.cropRect = null;
      state.draftTextEntry = null;
      updateScreenshotShellLayout();
      updateScreenshotToolButtons();
      renderScreenshotOverlay();
    };
    image.src = imageDataUrl;
  }

  function applyScreenshotCrop(nextMode = 'arrow') {
    const state = screenshotEditorState;
    if (!state?.cropRect || !state.cropRect.width || !state.cropRect.height) {
      return;
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = state.cropRect.width;
    exportCanvas.height = state.cropRect.height;
    const exportContext = exportCanvas.getContext('2d');

    exportContext.drawImage(
      state.imageElement,
      state.cropRect.x,
      state.cropRect.y,
      state.cropRect.width,
      state.cropRect.height,
      0,
      0,
      state.cropRect.width,
      state.cropRect.height
    );

    const croppedImage = new Image();
    croppedImage.onload = () => {
      updateScreenshotSurface(croppedImage.src, true);
      setScreenshotToolMode(nextMode);
    };
    croppedImage.src = exportCanvas.toDataURL('image/png');
  }

  function resetScreenshotImage() {
    const state = screenshotEditorState;
    if (!state?.originalImageDataUrl) {
      return;
    }

    removeScreenshotTextComposer();
    state.selectionDisplayRect = null;
    updateScreenshotSurface(state.originalImageDataUrl, true);
    setScreenshotToolMode('crop');
  }

  function buildScreenshotExportCanvas() {
    const state = screenshotEditorState;
    if (!state?.imageElement?.width || !state?.imageElement?.height) {
      return null;
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = state.imageElement.width;
    exportCanvas.height = state.imageElement.height;
    const exportContext = exportCanvas.getContext('2d');

    exportContext.drawImage(state.imageElement, 0, 0);
    exportContext.drawImage(state.drawCanvas, 0, 0);

    return exportCanvas;
  }

  function buildScreenshotMetadataText() {
    return `Capturado pela Tray Chrome Extension em ${new Date().toLocaleString(
      'pt-BR'
    )}`;
  }

  function buildScreenshotFileName() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');

    return `tray-extension-captura-${now.getFullYear()}${pad(
      now.getMonth() + 1
    )}${pad(now.getDate())}-${pad(now.getHours())}${pad(
      now.getMinutes()
    )}${pad(now.getSeconds())}.png`;
  }

  async function copyScreenshotImage() {
    const exportCanvas = buildScreenshotExportCanvas();
    if (!exportCanvas) {
      return;
    }

    if (!navigator.clipboard?.write || !window.ClipboardItem) {
      showToast(
        'Copia indisponivel',
        'Seu navegador nao liberou copiar imagem nesta aba.'
      );
      return;
    }

    const blob = await new Promise((resolve) =>
      exportCanvas.toBlob(resolve, 'image/png')
    );
    if (!blob) {
      showToast('Falha ao copiar', 'Nao foi possivel gerar a imagem final.');
      return;
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
          'text/plain': new Blob([buildScreenshotMetadataText()], {
            type: 'text/plain',
          }),
        }),
      ]);

      showToast(
        'Imagem copiada',
        'O print final foi enviado para a area de transferencia.'
      );
      removeScreenshotEditor();
    } catch {
      showToast('Falha ao copiar', 'Seu navegador bloqueou a copia da imagem.');
    }
  }

  function downloadScreenshotImage() {
    const exportCanvas = buildScreenshotExportCanvas();
    if (!exportCanvas) {
      return;
    }

    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL('image/png');
    link.download = buildScreenshotFileName();
    link.click();
    showToast('Imagem salva', 'O print foi salvo com o nome da extensao.');
    removeScreenshotEditor();
  }

  function openScreenshotEditor(imageDataUrl) {
    ensureStyles();
    removeScreenshotEditor();

    const root = document.createElement('div');
    root.id = SCREENSHOT_EDITOR_ID;
    root.innerHTML = `
      <div class="tray-shot-selection-label">
        Arraste para selecionar a area do print
      </div>
      <div class="tray-shot-shell">
        <img
          id="tray-shot-image"
          class="tray-shot-image"
          alt="Print capturado"
        />
        <canvas id="tray-shot-draw" class="tray-shot-draw"></canvas>
      </div>
      <div class="tray-shot-toolbar">
        <button
          class="primary"
          id="tray-shot-copy"
          title="Copiar imagem final"
          aria-label="Copiar imagem final"
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="
                M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1Z
                m3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11
                c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2Z
                m0 16H8V7h11v14Z
              "
            />
          </svg>
        </button>
        <button
          id="tray-shot-crop"
          style="display: none;"
          title="Modo recorte"
          aria-label="Modo recorte"
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="
                M17 3H5a2 2 0 0 0-2 2v12h2V5h12V3Z
                m2 4H9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10
                a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z
                m0 12H9V9h10v10Z
              "
            />
          </svg>
        </button>
        <button
          id="tray-shot-arrow"
          title="Modo flecha"
          aria-label="Modo flecha"
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="m4 12 1.41 1.41L11 7.83V20h2V7.83l5.59 5.59L20 12l-8-8-8 8Z"
            />
          </svg>
        </button>
        <button
          id="tray-shot-text"
          title="Modo texto"
          aria-label="Modo texto"
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M5 4v3h5.5v12h3V7H19V4H5Z"
            />
          </svg>
        </button>
        <button
          id="tray-shot-undo"
          title="Desfazer"
          aria-label="Desfazer"
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="
                M12.5 8c-2.65 0-5.04 1.12-6.75 2.91L3 8.16V15h6.84
                l-2.66-2.66A7.95 7.95 0 0 1 12.5 10c3.04 0 5.64 1.72
                6.95 4.22l1.82-.84C19.64 10.28 16.33 8 12.5 8Z
              "
            />
          </svg>
        </button>
        <button
          id="tray-shot-reset"
          title="Resetar selecao"
          aria-label="Resetar selecao"
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="
                M13 3a9 9 0 0 0-9 9H1l4 4 4-4H6a7 7 0 1 1 2.05 4.95
                l-1.42 1.41A9 9 0 1 0 13 3Z
              "
            />
          </svg>
        </button>
        <input
          id="tray-shot-color"
          title="Cor da anotacao"
          aria-label="Cor da anotacao"
          type="color"
          value="#ff5a47"
        />
        <button
          id="tray-shot-download"
          title="Baixar imagem final"
          aria-label="Baixar imagem final"
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="
                M5 20h14v-2H5v2Z
                m7-18-5.5 5.5 1.42 1.42L11 5.84V16h2V5.84
                l3.08 3.08 1.42-1.42L12 2Z
              "
            />
          </svg>
        </button>
        <button
          id="tray-shot-clear"
          title="Limpar anotacoes"
          aria-label="Limpar anotacoes"
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="
                M16 9v10H8V9h8
                m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1Z
                M18 7H6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7Z
              "
            />
          </svg>
        </button>
        <button
          id="tray-shot-close"
          title="Fechar editor"
          aria-label="Fechar editor"
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="
                M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12
                5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12
                19 6.41Z
              "
            />
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(root);

    const imageElement = root.querySelector('#tray-shot-image');
    const drawCanvas = root.querySelector('#tray-shot-draw');
    const drawContext = drawCanvas.getContext('2d');
    const toolbarElement = root.querySelector('.tray-shot-toolbar');
    const arrowButton = root.querySelector('#tray-shot-arrow');
    const cropButton = root.querySelector('#tray-shot-crop');
    const textButton = root.querySelector('#tray-shot-text');
    const undoButton = root.querySelector('#tray-shot-undo');
    const resetButton = root.querySelector('#tray-shot-reset');
    const colorInput = root.querySelector('#tray-shot-color');
    const copyButton = root.querySelector('#tray-shot-copy');
    const downloadButton = root.querySelector('#tray-shot-download');
    const clearButton = root.querySelector('#tray-shot-clear');
    const closeButton = root.querySelector('#tray-shot-close');
    const shellElement = root.querySelector('.tray-shot-shell');

    screenshotEditorState = {
      root,
      shellElement,
      toolbarElement,
      imageElement,
      drawCanvas,
      drawContext,
      arrowButton,
      cropButton,
      textButton,
      undoButton,
      resetButton,
      colorInput,
      copyButton,
      downloadButton,
      clearButton,
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      startDisplayPoint: null,
      currentDisplayPoint: null,
      arrows: [],
      textEntries: [],
      annotationHistory: [],
      nextAnnotationId: 1,
      annotationColor: '#ff5a47',
      toolMode: 'crop',
      cropRect: null,
      selectionDisplayRect: null,
      activeTextBox: null,
      draftTextEntry: null,
      originalImageDataUrl: imageDataUrl,
    };

    updateScreenshotSurface(imageDataUrl);
    updateScreenshotToolButtons();
    updateScreenshotShellLayout();

    drawCanvas.addEventListener('pointerdown', (event) => {
      if (screenshotEditorState.toolMode === 'text') {
        openScreenshotTextComposer(getScreenshotPoint(event));
        return;
      }

      removeScreenshotTextComposer();
      screenshotEditorState.isDrawing = true;
      screenshotEditorState.startPoint = getScreenshotPoint(event);
      screenshotEditorState.currentPoint = screenshotEditorState.startPoint;
      screenshotEditorState.startDisplayPoint =
        getScreenshotDisplayPoint(event);
      screenshotEditorState.currentDisplayPoint =
        screenshotEditorState.startDisplayPoint;
      screenshotEditorState.activePointerId = event.pointerId;
      drawCanvas.setPointerCapture?.(event.pointerId);
      renderScreenshotOverlay();
    });

    drawCanvas.addEventListener('pointermove', (event) => {
      if (!screenshotEditorState.isDrawing) {
        return;
      }

      screenshotEditorState.currentPoint = getScreenshotPoint(event);
      screenshotEditorState.currentDisplayPoint =
        getScreenshotDisplayPoint(event);
      renderScreenshotOverlay();
    });

    const finishPointerAction = (event) => {
      if (!screenshotEditorState.isDrawing) {
        return;
      }

      if (
        screenshotEditorState.toolMode === 'crop' &&
        screenshotEditorState.startPoint &&
        screenshotEditorState.currentPoint
      ) {
        const cropRect = normalizeRect(
          screenshotEditorState.startPoint,
          screenshotEditorState.currentPoint
        );
        if (cropRect.width > 16 && cropRect.height > 16) {
          screenshotEditorState.cropRect = cropRect;
          screenshotEditorState.selectionDisplayRect = normalizeRect(
            screenshotEditorState.startDisplayPoint,
            screenshotEditorState.currentDisplayPoint
          );
        }
      } else if (
        screenshotEditorState.toolMode === 'arrow' &&
        screenshotEditorState.startPoint &&
        screenshotEditorState.currentPoint
      ) {
        pushScreenshotAnnotation('arrow', {
          from: screenshotEditorState.startPoint,
          to: screenshotEditorState.currentPoint,
          color: screenshotEditorState.annotationColor,
        });
      }

      screenshotEditorState.isDrawing = false;
      screenshotEditorState.startPoint = null;
      screenshotEditorState.currentPoint = null;
      screenshotEditorState.startDisplayPoint = null;
      screenshotEditorState.currentDisplayPoint = null;
      if (
        event?.pointerId !== undefined &&
        screenshotEditorState.activePointerId === event.pointerId
      ) {
        drawCanvas.releasePointerCapture?.(event.pointerId);
      }
      screenshotEditorState.activePointerId = null;

      if (
        screenshotEditorState.toolMode === 'crop' &&
        screenshotEditorState.cropRect
      ) {
        applyScreenshotCrop('arrow');
        return;
      }

      renderScreenshotOverlay();
    };

    drawCanvas.addEventListener('pointerup', finishPointerAction);
    drawCanvas.addEventListener('pointercancel', finishPointerAction);

    cropButton.addEventListener('click', () => setScreenshotToolMode('crop'));
    arrowButton.addEventListener('click', () => setScreenshotToolMode('arrow'));
    textButton.addEventListener('click', () => setScreenshotToolMode('text'));
    undoButton.addEventListener('click', undoScreenshotAnnotation);
    resetButton.addEventListener('click', resetScreenshotImage);
    colorInput.addEventListener('input', (event) => {
      screenshotEditorState.annotationColor = event.target.value || '#ff5a47';
      syncScreenshotTextComposerColor();
    });
    copyButton.addEventListener('click', copyScreenshotImage);
    downloadButton.addEventListener('click', downloadScreenshotImage);
    clearButton.addEventListener('click', () => {
      screenshotEditorState.arrows = [];
      screenshotEditorState.textEntries = [];
      screenshotEditorState.annotationHistory = [];
      removeScreenshotTextComposer();
      renderScreenshotOverlay();
      updateScreenshotToolButtons();
    });
    closeButton.addEventListener('click', removeScreenshotEditor);

    const syncLayoutOnResize = () => {
      if (!screenshotEditorState) {
        return;
      }
      updateScreenshotShellLayout();
      renderScreenshotOverlay();
    };

    screenshotEditorState.resizeHandler = syncLayoutOnResize;
    window.addEventListener('resize', syncLayoutOnResize);
  }

  async function saveClipboardEntry(text) {
    const normalizedText = String(text || '').trim();
    if (!normalizedText || normalizedText === lastCapturedText) {
      return;
    }

    lastCapturedText = normalizedText;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'saveClipboardEntry',
        data: {
          text: normalizedText,
          sourceUrl: window.location.href,
          title: document.title || '',
        },
      });

      if (response?.saved) {
        showToast('Salvo no historico', `Use ${HOTKEY} para recuperar depois.`);
      }
    } catch {
      lastCapturedText = '';
    }
  }

  document.addEventListener('copy', (event) => {
    window.setTimeout(() => {
      saveClipboardEntry(getCopiedText(event));
    }, 0);
  });

  document.addEventListener('keydown', async (event) => {
    if (handleScreenshotTextComposerKeydown(event)) {
      return;
    }

    if (event.key === 'Escape') {
      removeOverlay();
      removeScreenshotEditor();
      return;
    }

    if (
      screenshotEditorState &&
      (event.metaKey || event.ctrlKey) &&
      !event.shiftKey &&
      event.key.toLowerCase() === 'z'
    ) {
      const isTypingInTextBox =
        event.target instanceof HTMLElement &&
        event.target.closest(`#${SCREENSHOT_EDITOR_ID} .tray-shot-text-box`);

      if (!isTypingInTextBox) {
        event.preventDefault();
        undoScreenshotAnnotation();
        return;
      }
    }

    if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'v') {
      event.preventDefault();

      try {
        const items = await chrome.runtime.sendMessage({
          action: 'getClipboardHistory',
        });

        renderOverlay(Array.isArray(items) ? items : []);
      } catch {
        showToast('Falha ao abrir historico', 'Tente novamente em instantes.');
      }
    }
  });

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message?.action === 'openScreenshotEditor') {
      openScreenshotEditor(message?.data?.image || '');
      sendResponse({ opened: true });
      return true;
    }

    return false;
  });
})();
