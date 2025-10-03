import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

export default {
  uiHost: '0.0.0.0',
  uiPort: 1880,
  httpAdminRoot: '/',
  httpNodeRoot: '/',
  userDir: path.join(projectRoot, 'var'),
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
