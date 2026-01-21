import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYDRUMS_VENV = path.join(__dirname, '../../.venv/bin/python');
const PYDRUMS_CLI = path.join(__dirname, '../../.venv/bin/pydrums');
const MIDI_OUTPUT_DIR = path.join(__dirname, '../../midi_output');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load Vite dev server in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers

// Generate drum pattern
ipcMain.handle('generate-pattern', async (event, description) => {
  return new Promise((resolve, reject) => {
    console.log('Generating pattern:', description);

    // Clean the description for filename safety
    const cleanDescription = description.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');

    const childProcess = spawn(PYDRUMS_CLI, ['generate', '-d', description], {
      cwd: path.join(__dirname, '../..'),
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('stdout:', data.toString());
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('stderr:', data.toString());
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        // Find the most recently created MIDI file
        const files = fs.readdirSync(MIDI_OUTPUT_DIR);
        const midiFiles = files
          .filter(f => f.endsWith('.mid'))
          .map(f => ({
            name: f,
            path: path.join(MIDI_OUTPUT_DIR, f),
            time: fs.statSync(path.join(MIDI_OUTPUT_DIR, f)).mtime.getTime()
          }))
          .sort((a, b) => b.time - a.time);

        if (midiFiles.length > 0) {
          const latestFile = midiFiles[0];
          resolve({
            success: true,
            midiPath: latestFile.path,
            fileName: latestFile.name,
            output: stdout
          });
        } else {
          reject(new Error('No MIDI file was generated'));
        }
      } else {
        reject(new Error(`pydrums exited with code ${code}: ${stderr}`));
      }
    });

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
});

// Read MIDI file
ipcMain.handle('read-midi-file', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        // Convert buffer to array for IPC transfer
        resolve(Array.from(data));
      }
    });
  });
});
