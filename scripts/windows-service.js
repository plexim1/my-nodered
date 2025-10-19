// ESM script that installs/uninstalls a Windows Service using node-windows
// Driven by an external JSON config file (no inline env defaults here)

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const { Service } = require('node-windows');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = { cmd: undefined, config: undefined };
  const rest = [];
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === 'install' || a === 'uninstall') {
      args.cmd = a;
    } else if (a === '--config' || a === '-c') {
      args.config = argv[i + 1];
      i += 1;
    } else {
      rest.push(a);
    }
  }
  args.rest = rest;
  return args;
}

function resolveFrom(base, maybe) {
  if (!maybe) return undefined;
  return path.isAbsolute(maybe) ? maybe : path.resolve(base, maybe);
}

function loadConfig(configPath) {
  const defaultPath = path.resolve(repoRoot, 'service', 'windows-service.config.json');
  const finalPath = configPath ? resolveFrom(process.cwd(), configPath) : defaultPath;
  if (!fs.existsSync(finalPath)) {
    throw new Error(`Config file not found: ${finalPath}`);
  }
  const raw = fs.readFileSync(finalPath, 'utf8');
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse JSON config at ${finalPath}: ${e.message}`);
  }
  return { cfg, finalPath };
}

function buildEnv({ env = {}, envFile, baseDir }) {
  const list = [];
  // Load from env file first, so explicit env overrides can win
  if (envFile) {
    const filePath = resolveFrom(baseDir, envFile);
    if (!fs.existsSync(filePath)) {
      throw new Error(`envFile not found: ${filePath}`);
    }
    const parsed = dotenv.parse(fs.readFileSync(filePath));
    for (const [name, value] of Object.entries(parsed)) {
      list.push({ name, value: String(value) });
    }
  }
  // Merge explicit env object
  for (const [name, value] of Object.entries(env)) {
    list.push({ name, value: String(value) });
  }
  return list;
}

async function main() {
  const { cmd, config } = parseArgs(process.argv);
  if (!cmd) {
    console.error('Usage: node scripts/windows-service.js --config <path-to-config.json> <install|uninstall>');
    process.exit(2);
  }

  const { cfg, finalPath } = loadConfig(config);
  const baseDir = path.dirname(finalPath);

  const name = cfg.name || 'your-nodered';
  const description = cfg.description || 'Custom Node-RED runtime';
  const workingDirectory = resolveFrom(baseDir, cfg.workingDirectory || repoRoot);
  const script = resolveFrom(baseDir, cfg.script || path.resolve(repoRoot, 'bin', 'cli.js'));
  const nodeOptions = Array.isArray(cfg.nodeOptions) ? cfg.nodeOptions : undefined;
  const scriptOptions = Array.isArray(cfg.scriptOptions) ? cfg.scriptOptions : undefined;
  const env = buildEnv({ env: cfg.env || {}, envFile: cfg.envFile, baseDir });

  const svcOpts = {
    name,
    description,
    script,
    workingDirectory,
    env,
  };
  if (nodeOptions) svcOpts.nodeOptions = nodeOptions;
  if (scriptOptions) svcOpts.scriptOptions = scriptOptions;

  const svc = new Service(svcOpts);

  if (cmd === 'install') {
    svc.on('install', () => {
      console.log(`Service '${name}' installed.`);
      // Auto-start on install unless explicitly disabled
      if (cfg.startOnInstall !== false) {
        svc.start();
      }
    });
    svc.on('alreadyinstalled', () => {
      console.log(`Service '${name}' is already installed.`);
    });
    svc.on('invalidinstallation', () => {
      console.error('Invalid installation detected. Try uninstalling first.');
    });
    svc.on('error', (err) => {
      console.error('Service error:', err);
    });
    svc.install();
    return;
  }

  if (cmd === 'uninstall') {
    svc.on('uninstall', () => {
      console.log(`Service '${name}' uninstalled.`);
    });
    svc.on('error', (err) => {
      console.error('Service error:', err);
    });
    svc.uninstall();
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

