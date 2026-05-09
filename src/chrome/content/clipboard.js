(function () {
  if (globalThis.__trayClipboardManagerInjected) {
    return;
  }

  globalThis.__trayClipboardManagerInjected = true;

  const OVERLAY_ID = 'tray-extension-clipboard-overlay';
  const TOAST_ID = 'tray-extension-clipboard-toast';
  const STYLE_ID = 'tray-extension-clipboard-style';
  const HOTKEY = 'Alt+Shift+V';

  let lastCapturedText = '';

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

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copiado novamente', 'O item voltou para a area de transferencia.');
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
      empty.textContent = 'Nenhuma copia salva ainda nesta sessao do navegador.';
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
        showToast(
          'Salvo no historico',
          `Use ${HOTKEY} para recuperar depois.`
        );
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
    if (event.key === 'Escape') {
      removeOverlay();
      return;
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
})();
