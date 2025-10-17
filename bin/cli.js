#!/usr/bin/env node

import 'dotenv/config';
import { start } from '../src/server.js';

const banner = `\nmy-nodered :: Node-RED + custom runtime\n--------------------------------------`;

console.log(banner);

start().catch((error) => {
  console.error('Failed to start Node-RED runtime');
  console.error(error);
  process.exit(1);
});
