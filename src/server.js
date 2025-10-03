import http from 'http';
import path from 'path';
import express from 'express';
import RED from 'node-red';
import { fileURLToPath } from 'url';
import { loadSettings } from './settings/settings.js';
import { deepMerge } from './settings/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const themeDir = path.resolve(__dirname, '../theme');

export const start = async ({ overrides } = {}) => {
  const app = express();
  const server = http.createServer(app);

  const baseSettings = await loadSettings();
  const settings = overrides ? deepMerge(baseSettings, overrides) : baseSettings;

  app.use('/theme', express.static(themeDir));

  RED.init(server, settings);
  // Ensure Zendesk Garden theme plugin is registered even if not installed under userDir
  try {
    const themeModule = await import('@node-red-contrib-themes/theme-collection');
    const register = (themeModule && (themeModule.default || themeModule));
    if (typeof register === 'function') {
      register(RED);
      console.log('Loaded @node-red-contrib-themes/theme-collection');
    }
  } catch (err) {
    // Non-fatal: if the plugin is not installed, Node-RED may still serve our local /theme overrides
    console.warn('Theme collection plugin not found or failed to load:', err?.message);
  }
  app.use(settings.httpAdminRoot || '/', RED.httpAdmin);
  if (settings.httpNodeRoot !== false) {
    app.use(settings.httpNodeRoot || '/', RED.httpNode);
  }

  await RED.start();

  await new Promise((resolve, reject) => {
    server.listen(settings.uiPort || 1880, settings.uiHost || '0.0.0.0', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

  const address = server.address();
  if (address && typeof address !== 'string') {
    console.log(`Node-RED editor: http://${address.address === '0.0.0.0' ? 'localhost' : address.address}:${address.port}${settings.httpAdminRoot || '/'}`);
  }

  return { app, server, settings };
};

export default start;

