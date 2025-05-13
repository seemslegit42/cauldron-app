/**
 * Setup script for Autogen Studio
 * 
 * This script installs the required Python dependencies for Autogen Studio.
 * It should be run once before using Autogen Studio.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the path to the Autogen Studio directory
const autogenStudioDir = path.resolve(__dirname, 'autogen-studio');

// Check if the directory exists
if (!fs.existsSync(autogenStudioDir)) {
  console.error('Autogen Studio directory not found:', autogenStudioDir);
  process.exit(1);
}

// Create app directory if it doesn't exist
const appDir = path.resolve(autogenStudioDir, '.autogenstudio');
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

console.log('Installing Autogen Studio dependencies...');

// Use pip to install the dependencies
const pip = spawn('pip', [
  'install',
  '-e',
  '.',
], {
  cwd: autogenStudioDir,
  stdio: 'inherit',
  shell: true
});

pip.on('close', (code) => {
  if (code !== 0) {
    console.error(`pip install failed with code ${code}`);
    process.exit(1);
  }

  console.log('Installing frontend dependencies...');

  // Install frontend dependencies
  const yarn = spawn('yarn', [
    'install',
  ], {
    cwd: path.resolve(autogenStudioDir, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  yarn.on('close', (code) => {
    if (code !== 0) {
      console.error(`yarn install failed with code ${code}`);
      process.exit(1);
    }

    console.log('Building frontend...');

    // Build the frontend
    const build = spawn('yarn', [
      'build',
    ], {
      cwd: path.resolve(autogenStudioDir, 'frontend'),
      stdio: 'inherit',
      shell: true
    });

    build.on('close', (code) => {
      if (code !== 0) {
        console.error(`yarn build failed with code ${code}`);
        process.exit(1);
      }

      console.log('Autogen Studio setup completed successfully!');
    });
  });
});
