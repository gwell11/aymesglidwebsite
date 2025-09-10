const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let server;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Start local server
  startServer();
}

function startServer() {
  const expressApp = express();
  
  expressApp.use(express.static('public'));
  expressApp.use(express.json());
  
  // File upload endpoint
  expressApp.post('/upload', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const inputPath = req.file.path;
      const outputPath = `processed_${Date.now()}.wav`;
      
      // Run Python processing script
      const pythonProcess = spawn('python', [
        path.join(__dirname, 'python', 'process_audio.py'),
        inputPath,
        outputPath,
        JSON.stringify(req.body.parameters || {})
      ]);
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          res.json({ 
            success: true, 
            outputFile: outputPath,
            message: 'Audio processed successfully!' 
          });
        } else {
          res.status(500).json({ error: 'Processing failed' });
        }
        
        // Clean up input file
        fs.unlinkSync(inputPath);
      });
      
    } catch (error) {
      console.error('Processing error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  server = expressApp.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle file selection dialog
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['wav', 'mp3', 'flac', 'm4a'] }
    ]
  });
  
  return result;
});
