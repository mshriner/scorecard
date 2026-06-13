import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const envDir = join(rootDir, 'src', 'environments');
const targetFile = join(envDir, 'environment.prod.ts');
const secretsPath = join(rootDir, 'secrets', 'api-key.txt');

const lifecycle = process.env.npm_lifecycle_event || '';
const isProd = lifecycle === 'prebuild:prod' || lifecycle.endsWith(':prod');

let apiKey = process.env.GOLF_COURSE_API_KEY;

if (!apiKey && existsSync(secretsPath)) {
  apiKey = readFileSync(secretsPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .join('');
}

if (!apiKey) {
  console.error(
    'ERROR: Build environment variable GOLF_COURSE_API_KEY is not set, and secrets/api-key.txt was not found or contained no key.',
  );
  process.exit(1);
}

const fileContents = `export const environment = {
  production: ${isProd},
  golfCourseApiKey: ${JSON.stringify(apiKey)},
};
`;

mkdirSync(envDir, { recursive: true });
writeFileSync(targetFile, fileContents, 'utf8');
console.log(
  `Generated src/environments/environment.prod.ts from build env var (production=${isProd}).`,
);
