import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.join(rootDir, 'release');
const packageDir = path.join(releaseDir, 'package');

const packageJson = JSON.parse(
  await readFile(path.join(rootDir, 'package.json'), 'utf8')
);

const extensionName = 'tray-chrome-extension';
const assetName = `${extensionName}.zip`;
const versionedAssetName = `${extensionName}-v${packageJson.version}.zip`;

await rm(releaseDir, { recursive: true, force: true });
await mkdir(packageDir, { recursive: true });
await mkdir(path.join(packageDir, 'src'), { recursive: true });

await cp(path.join(rootDir, 'manifest.json'), path.join(packageDir, 'manifest.json'));
await cp(path.join(rootDir, 'dist'), path.join(packageDir, 'dist'), {
  recursive: true,
});
await cp(path.join(rootDir, 'src', 'chrome'), path.join(packageDir, 'src', 'chrome'), {
  recursive: true,
});
await cp(path.join(rootDir, 'src', 'config.js'), path.join(packageDir, 'src', 'config.js'));
await cp(path.join(rootDir, 'README.md'), path.join(packageDir, 'README.md'));

const zipOutput = path.join(releaseDir, assetName);

await execFileAsync(
  'zip',
  ['-r', zipOutput, '.'],
  { cwd: packageDir }
);

await cp(zipOutput, path.join(releaseDir, versionedAssetName));

console.log(`Created ${assetName}`);
console.log(`Created ${versionedAssetName}`);
