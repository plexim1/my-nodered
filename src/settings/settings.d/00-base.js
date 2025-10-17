import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as uuid from 'uuid';
import jwt from 'jsonwebtoken';
import imageSize from 'image-size';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

const env = process.env || {};
const parsePort = (v, d) => {
  const n = Number.parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};
const uiHost = env.UI_HOST || '0.0.0.0';
const uiPort = parsePort(env.UI_PORT ?? env.PORT, 1880);
const httpAdminRoot = env.HTTP_ADMIN_ROOT ?? '/';
const httpNodeRoot = env.HTTP_NODE_ROOT ?? '/';
const userDir = env.USER_DIR || env.USERDIR || path.join(projectRoot, 'var');

export default {
  uiHost,
  uiPort,
  httpAdminRoot,
  httpNodeRoot,
  userDir,
  flowFile: 'flows.json',
  functionGlobalContext: {},
  logging: {
    console: {
      level: 'info',
      metrics: false,
      audit: false,
    },
  },
};

