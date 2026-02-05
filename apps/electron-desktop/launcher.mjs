#!/usr/bin/env node

/**
 * Simple Electron Launcher for Development
 * 
 * Usage: node launcher.mjs
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting Electron...');
console.log(`App directory: ${__dirname}`);

// Find electron binary
const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');

console.log(`Electron path: ${electronPath}`);
console.log('');

// Spawn electron
const electron = spawn(electronPath, ['.'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

electron.on('exit', (code) => {
  console.log(`Electron exited with code ${code}`);
  process.exit(code || 0);
});

electron.on('error', (err) => {
  console.error('Failed to start Electron:', err);
  process.exit(1);
});
