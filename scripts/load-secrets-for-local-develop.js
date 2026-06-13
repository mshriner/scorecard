#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const secretsPath = join(__dirname, '../secrets/api-key.txt');
const envPath = join(__dirname, '../src/environments/environment.dev.ts');

try {
  // Read the API key from secrets file
  let apiKey = readFileSync(secretsPath, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .join('');

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.warn(
      '⚠️  Warning: API key not found or is placeholder in secrets/api-key.txt',
    );
    console.warn('Please add your GolfCourseAPI key to secrets/api-key.txt');
    process.exit(1);
  }

  // Read the environment file
  let envContent = readFileSync(envPath, 'utf-8');

  // Replace the placeholder with the actual API key
  envContent = envContent.replace(
    /golfCourseApiKey: '[^']*',/,
    `golfCourseApiKey: '${apiKey}',`,
  );

  // Write back to the environment file
  writeFileSync(envPath, envContent);
  console.log('✓ API key loaded from secrets/api-key.txt');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('✗ Error: secrets/api-key.txt file not found');
    console.error(
      'Create the file at secrets/api-key.txt with your GolfCourseAPI key',
    );
  } else {
    console.error('✗ Error loading secrets:', error.message);
  }
  process.exit(1);
}
