import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.resolve(__dirname, '../package.json');
const versionTsPath = path.resolve(__dirname, '../src/version.ts');

const isNoBump = process.argv.includes('--no-bump');

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

let [major = 1, minor = 0, patch = 0] = (pkg.version && pkg.version !== '0.0.0' ? pkg.version : '1.0.0')
  .split('.')
  .map((num) => parseInt(num, 10) || 0);

if (!isNoBump) {
  if (pkg.version === '0.0.0') {
    major = 1;
    minor = 0;
    patch = 0;
  } else {
    patch += 1;
  }
  pkg.version = `${major}.${minor}.${patch}`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
} else if (pkg.version === '0.0.0') {
  pkg.version = '1.0.0';
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

const now = new Date();
const formattedDate = now.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const formattedTime = now.toLocaleTimeString('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});
const buildDateTime = `${formattedDate} às ${formattedTime}`;

const content = `// Arquivo gerado automaticamente a cada build. Não edite manualmente.
export const APP_VERSION = '${pkg.version}';
export const BUILD_DATE = '${buildDateTime}';
export const BUILD_TIMESTAMP = ${now.getTime()};
`;

fs.writeFileSync(versionTsPath, content, 'utf8');
console.log(`[Build Version] Marca-Página v${pkg.version} (${buildDateTime})`);
