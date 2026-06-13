import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const envDir = join(rootDir, 'src', 'environments');
const targetFile = join(envDir, 'environment.local.ts');
const secretsPath = join(rootDir, 'secrets', 'api-key.txt');

let apiKey =
  process.env.PUBLIC_GOLF_COURSE_API_KEY || process.env.GOLF_COURSE_API_KEY;

if (!apiKey && existsSync(secretsPath)) {
  apiKey = readFileSync(secretsPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .join('');
}

if (!apiKey) {
  console.error(
    'ERROR: Build environment variable PUBLIC_GOLF_COURSE_API_KEY or GOLF_COURSE_API_KEY is not set, and secrets/api-key.txt was not found or contained no key.',
  );
  process.exit(1);
}

const fileContents = `export const environment = {
  production: false,
  golfCourseApiKey: ${JSON.stringify(apiKey)},
};
`;

mkdirSync(envDir, { recursive: true });
writeFileSync(targetFile, fileContents, 'utf8');
console.log(
  'Generated src/environments/environment.local.ts from build env var.',
);
