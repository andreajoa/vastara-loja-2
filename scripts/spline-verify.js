#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenePath = path.join(__dirname, '..', 'public', '3d-models', 'scene.splinecode');

if (fs.existsSync(scenePath)) {
  console.log('OK: Found scene at', scenePath);
  process.exit(0);
} else {
  console.error('MISSING: No `scene.splinecode` found at', scenePath);
  console.error('Please export from https://app.spline.design and place the file in /public/3d-models/');
  process.exit(2);
}
