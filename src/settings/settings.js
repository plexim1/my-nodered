import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { deepMerge } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const settingsDir = path.resolve(__dirname, 'settings.d');
export const projectRoot = path.resolve(__dirname, '..', '..');

const loadFragment = async (filePath) => {
  const moduleUrl = pathToFileURL(filePath).href;
  const module = await import(moduleUrl);
  return module?.default ?? {};
};

const loadFragments = async () => {
  const files = await fs.readdir(settingsDir, { withFileTypes: true });
  return files
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => entry.name)
    .sort()
    .map((name) => path.join(settingsDir, name));
};

const applyEnvOverrides = (settings) => {
  let result = { ...settings };

  if (process.env.PORT) {
    const port = Number.parseInt(process.env.PORT, 10);
    if (!Number.isNaN(port)) {
      result = { ...result, uiPort: port };
    }
  }

  if (process.env.LOG_LEVEL) {
    result = deepMerge(result, {
      logging: {
        console: {
          level: process.env.LOG_LEVEL,
        },
      },
    });
  }

  if (process.env.FLOWS) {
    result = { ...result, flowFile: process.env.FLOWS };
  }

  if (process.env.USERDIR) {
    result = { ...result, userDir: process.env.USERDIR };
  }

  return result;
};

export const loadSettings = async () => {
  const fragmentPaths = await loadFragments();
  const fragments = await Promise.all(fragmentPaths.map((fragmentPath) => loadFragment(fragmentPath)));
  const merged = fragments.reduce((acc, fragment) => deepMerge(acc, fragment), {});
  return applyEnvOverrides(merged);
};

export default loadSettings;
