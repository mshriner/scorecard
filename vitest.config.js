import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    css: true,
    testTimeout: 10000,
    watch: false,
  },
  plugins: [
    {
      name: 'angular-template-loader',
      transform(code, id) {
        if (
          !id.includes('node_modules') &&
          id.endsWith('.ts') &&
          (code.includes('templateUrl') ||
            code.includes('styleUrl') ||
            code.includes('styleUrls'))
        ) {
          // Inline templates and styles
          let modified = code;
          const dir = dirname(id);

          // Handle templateUrl
          modified = modified.replace(
            /templateUrl:\s*['"`]([^'"`]+)['"`]/g,
            (match, url) => {
              try {
                const filePath = resolve(dir, url);
                const content = readFileSync(filePath, 'utf-8');
                const escaped = content
                  .replace(/`/g, '\\`')
                  .replace(/\$/g, '\\$');
                return `template: \`${escaped}\``;
              } catch {
                return match;
              }
            },
          );

          // Handle styleUrl and styleUrls
          modified = modified.replace(
            /styleUrl:\s*['"`]([^'"`]+)['"`]/g,
            (match, url) => {
              try {
                const filePath = resolve(dir, url);
                const content = readFileSync(filePath, 'utf-8');
                const escaped = content
                  .replace(/`/g, '\\`')
                  .replace(/\$/g, '\\$');
                return `styles: [\`${escaped}\`]`;
              } catch {
                return match;
              }
            },
          );

          modified = modified.replace(
            /styleUrls:\s*\[\s*['"`]([^'"`]+)['"`]\s*\]/g,
            (match, url) => {
              try {
                const filePath = resolve(dir, url);
                const content = readFileSync(filePath, 'utf-8');
                const escaped = content
                  .replace(/`/g, '\\`')
                  .replace(/\$/g, '\\$');
                return `styles: [\`${escaped}\`]`;
              } catch {
                return match;
              }
            },
          );

          return { code: modified };
        }
      },
    },
  ],
});
