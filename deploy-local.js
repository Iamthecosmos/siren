#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting local deployment...\n');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (existsSync('dist')) {
  rmSync('dist', { recursive: true, force: true });
}

// Install dependencies if needed
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Build the application
console.log('🔨 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Start the server
console.log('🌟 Starting local server...');
console.log('📱 Your app will be available at: http://localhost:3000');
console.log('🔌 API will be available at: http://localhost:3000/api');
console.log('\nPress Ctrl+C to stop the server\n');

try {
  execSync('npm run start', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Server failed to start');
  process.exit(1);
} 