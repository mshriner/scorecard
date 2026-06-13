import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Define paths
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'src', 'app', 'models', 'generated');
const ignoreSrc = join(rootDir, '.openapi-generator-ignore');
const ignoreDest = join(outputDir, '.openapi-generator-ignore');

// Remove the output directory if it exists
if (existsSync(outputDir)) {
  rmSync(outputDir, { recursive: true, force: true });
}

// Create the output directory
mkdirSync(outputDir, { recursive: true });

// Copy the .openapi-generator-ignore file
copyFileSync(ignoreSrc, ignoreDest);

// Run the OpenAPI Generator
execSync(
  'npx @openapitools/openapi-generator-cli generate -i documentation/golfcourseapi-openapi.yml -g typescript-angular -o src/app/models/generated --additional-properties=ngVersion=21 --global-property models --skip-validate-spec',
  {
    cwd: rootDir,
    stdio: 'inherit',
  },
);

// Run Prettier on the generated files
execSync('npx prettier --write src/app/models/generated', {
  cwd: rootDir,
  stdio: 'inherit',
});

console.log('API generation completed successfully.');
