import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

function getHtmlInputs() {
  const inputs = {
    main: resolve(rootDir, 'index.html')
  };

  const toolsIndex = resolve(rootDir, 'tools', 'index.html');
  if (fs.existsSync(toolsIndex)) {
    inputs.tools = toolsIndex;
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && !['node_modules', 'dist', 'src', 'tests', 'scratch', 'scripts', 'public', '.git'].includes(entry.name)) {
      const pageIndex = resolve(rootDir, entry.name, 'index.html');
      if (fs.existsSync(pageIndex)) {
        inputs[entry.name] = pageIndex;
      }
    }
  }

  return inputs;
}

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    rollupOptions: {
      input: getHtmlInputs()
    }
  }
});
