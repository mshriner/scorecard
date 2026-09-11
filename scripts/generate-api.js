import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Define paths
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'src', 'app', 'models', 'generated');
const ignoreSrc = join(rootDir, '.openapi-generator-ignore');
const ignoreDest = join(outputDir, '.openapi-generator-ignore');
const managedFiles = new Set(['.openapi-generator-ignore']);

function getFileNames(directory, relativeDirectory = '') {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = join(relativeDirectory, entry.name);
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return getFileNames(fullPath, relativePath);
    }

    return managedFiles.has(relativePath) ? [] : [relativePath];
  });
}

const filesBeforeGeneration = getFileNames(outputDir);
const hadFilesBeforeGeneration = filesBeforeGeneration.length > 0;

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
  'npx @openapitools/openapi-generator-cli generate -i documentation/golfcourseapi-openapi-1_0_0.yml -g typescript-angular -o src/app/models/generated --additional-properties=ngVersion=21 --global-property models --skip-validate-spec',
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

const filesAfterGeneration = getFileNames(outputDir);
const filesBeforeSet = new Set(filesBeforeGeneration);
const filesAfterSet = new Set(filesAfterGeneration);
const filesNotRegenerated = filesBeforeGeneration.filter((fileName) => !filesAfterSet.has(fileName));
const newFiles = filesAfterGeneration.filter((fileName) => !filesBeforeSet.has(fileName));

if (filesNotRegenerated.length > 0) {
  console.log('\nFiles from the previous generation that were not regenerated:');
  filesNotRegenerated.forEach((fileName) => console.log(`- ${fileName}`));
}

if (hadFilesBeforeGeneration && newFiles.length > 0) {
  const readline = createInterface({ input: process.stdin, output: process.stdout });

  try {
    for (const fileName of newFiles) {
      const answer = await readline.question(`Keep newly generated file "${fileName}"? [K]eep/[R]eject `);

      if (/^(r|reject)$/i.test(answer.trim())) {
        unlinkSync(join(outputDir, fileName));
        console.log(`Rejected ${fileName}`);
      }
    }
  } finally {
    readline.close();
  }
}

console.log('API generation completed successfully.');
