# AnimalAI - Drum Beat Generator UI

AI-powered drum beat generator desktop app built with React + Electron.

## Features

- Text-based drum pattern generation using pydrums
- Real-time MIDI playback with Tone.js
- Play/Stop transport controls
- Loop toggle for continuous playback
- Jam Mode (auto-play, loop enabled) vs Write Mode (manual play, loop disabled)

## Development

### Prerequisites

- Node.js 18+
- Python 3.9+ with pydrums installed
- pydrums virtualenv at `~/pydrums/.venv`

### Setup

```bash
npm install
```

### Run Development Server

```bash
npm start
```

This will:
1. Start Vite dev server on http://localhost:5173
2. Launch Electron app
3. Enable hot reload for React components

### Build

```bash
npm run build
npm run package
```

## Usage

1. Enter a description (e.g., "funky disco beat", "fast rock groove")
2. Click Generate or press Enter
3. Pattern is generated and saved to `~/pydrums/midi_output/`
4. In Jam Mode: Pattern auto-plays with loop enabled
5. In Write Mode: Click Play to hear the pattern

## Mode Descriptions

- **Jam Mode**: Best for experimentation and jamming. Auto-plays generated patterns with loop enabled by default.
- **Write Mode**: Best for composition. Manual playback control with loop disabled by default.

## Project Structure

```
animalai-ui/
├── electron/
│   └── main.js          # Electron main process
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # App styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## How It Works

1. User enters a beat description
2. Electron main process spawns `pydrums generate -d "description"`
3. pydrums generates MIDI file in `~/pydrums/midi_output/`
4. Electron reads the MIDI file and sends it to the renderer
5. Tone.js loads and plays the MIDI with drum samples
6. Loop controls allow continuous playback

## Tech Stack

- **React**: UI framework
- **Electron**: Desktop app framework
- **Vite**: Build tool with fast HMR
- **Tone.js**: Web Audio framework for MIDI playback
- **@tonejs/midi**: MIDI file parsing
- **pydrums**: AI drum pattern generation (Python CLI)
