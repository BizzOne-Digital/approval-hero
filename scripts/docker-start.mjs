#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webPort = process.env.WEB_PORT || '3000';
const children = [];

function start(label, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: root,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit',
  });
  child.on('exit', (code, signal) => {
    if (signal) return;
    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      process.exit(code);
    }
  });
  children.push(child);
  return child;
}

console.log('Starting Approval Hero (API + Web)...');
start('api', 'node', ['server/dist/server.js']);

const standalone = path.join(root, 'server.js');
if (fs.existsSync(standalone)) {
  start('web', 'node', ['server.js'], { PORT: webPort, HOSTNAME: '0.0.0.0' });
} else {
  start('web', 'node', ['node_modules/next/dist/bin/next', 'start', '-p', webPort]);
}

function shutdown() {
  children.forEach((c) => c.kill('SIGTERM'));
  setTimeout(() => process.exit(0), 2000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
