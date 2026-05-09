const DEFAULT_UPDATE_URL =
  'https://ricardofreitasdev.github.io/Tray-chrome-extension/version.json';

function parseVersion(version) {
  return String(version || '')
    .replace(/^v/i, '')
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);
}

export function compareVersions(currentVersion, nextVersion) {
  const current = parseVersion(currentVersion);
  const next = parseVersion(nextVersion);
  const maxLength = Math.max(current.length, next.length);

  for (let index = 0; index < maxLength; index += 1) {
    const currentPart = current[index] || 0;
    const nextPart = next[index] || 0;

    if (nextPart > currentPart) {
      return 1;
    }

    if (nextPart < currentPart) {
      return -1;
    }
  }

  return 0;
}

export async function fetchLatestVersion(updateUrl = DEFAULT_UPDATE_URL) {
  const response = await fetch(updateUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar atualização (${response.status})`);
  }

  const payload = await response.json();

  if (!payload?.version) {
    throw new Error('Resposta de atualização inválida');
  }

  return payload;
}

export function getDefaultUpdateUrl() {
  return DEFAULT_UPDATE_URL;
}
