import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const pagesSourceDir = path.join(rootDir, 'website');
const pagesOutputDir = path.join(rootDir, 'release', 'pages');

const packageJson = JSON.parse(
  await readFile(path.join(rootDir, 'package.json'), 'utf8')
);

const owner = 'Ricardofreitasdev';
const repo = 'tray-chrome-extension';
const releaseBaseUrl = `https://github.com/${owner}/${repo}/releases/latest`;

const payload = {
  name: 'Tray Chrome Extension',
  version: packageJson.version,
  publishedAt: new Date().toISOString(),
  downloadUrl: `${releaseBaseUrl}/download/tray-chrome-extension.zip`,
  releaseNotesUrl: releaseBaseUrl,
  sourceUrl: `https://github.com/${owner}/${repo}`,
};

await rm(pagesOutputDir, { recursive: true, force: true });
await mkdir(pagesOutputDir, { recursive: true });
await cp(pagesSourceDir, pagesOutputDir, { recursive: true });
await writeFile(
  path.join(pagesOutputDir, 'version.json'),
  `${JSON.stringify(payload, null, 2)}\n`
);

console.log(`Generated GitHub Pages files for version ${packageJson.version}`);
