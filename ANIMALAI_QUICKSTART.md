# AnimalAI Quick Start Guide

## What You Have

A working MVP of AnimalAI - an Electron + React desktop app that generates drum beats using the pydrums CLI.

## Directory Structure

```
~/pydrums/
├── animalai-ui/           # The new Electron + React app
│   ├── electron/
│   │   └── main.js        # Electron main process (Python bridge)
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # App styles
│   │   └── main.jsx       # React entry
│   └── package.json
├── midi_output/           # Generated MIDI files
└── .venv/                 # Python virtualenv with pydrums
```

## Running the App

```bash
cd ~/pydrums/animalai-ui
npm start
```

This will:
1. Start Vite dev server on http://localhost:5173
2. Launch the Electron desktop app
3. Open DevTools for debugging

## Using AnimalAI

### Jam Mode (Default)
1. Type a beat description: "funky disco beat"
2. Press Enter or click Generate
3. Beat auto-plays with loop enabled
4. Perfect for experimentation and jamming

### Write Mode
1. Click "Write Mode" button
2. Type a beat description: "fast rock groove"
3. Press Enter or click Generate
4. Click Play to hear the beat
5. Loop is disabled by default
6. Perfect for composition and one-shot listening

### Controls
- **Generate Button**: Creates a new drum pattern
- **Play/Stop**: Control playback
- **Loop Toggle**: Enable/disable continuous playback
- **Mode Switcher**: Toggle between Jam and Write modes

## How It Works

1. You type a description (e.g., "groovy funk beat")
2. Electron spawns: `pydrums generate -d "groovy funk beat"`
3. pydrums generates MIDI file in `~/pydrums/midi_output/`
4. App loads MIDI and plays it using Tone.js
5. Drum samples are fetched from Tone.js CDN

## Features Implemented

- Text input for beat descriptions
- Generate button with Enter key support
- Play/Stop transport controls
- Loop toggle
- Jam Mode (auto-play, loop enabled)
- Write Mode (manual play, loop disabled)
- MIDI playback with Tone.js
- Status bar showing current file and state
- Real-time feedback during generation

## Example Descriptions

Try these in the app:
- "funky disco beat"
- "fast rock groove"
- "laid back jazz shuffle"
- "reggae one drop"
- "afro-cuban pattern"
- "double-time metal blast"

## Development

### File Structure
- `electron/main.js` - Electron main process, handles Python CLI calls
- `src/App.jsx` - Main UI component with all features
- `src/App.css` - All styling

### Making Changes
1. Edit React components in `src/`
2. Vite will hot-reload automatically
3. Electron needs restart for main process changes

### Debugging
- React DevTools are open by default
- Console logs show pydrums output
- Check `~/pydrums/midi_output/` for generated files

## Next Steps (Future Enhancements)

Potential improvements:
- Add tempo slider
- Save favorite patterns
- Export patterns to DAW
- Visual waveform display
- Pattern history/library
- Custom drum kit selection
- BPM display and control

## Troubleshooting

**App won't start:**
- Check that pydrums is installed: `~/pydrums/.venv/bin/pydrums --help`
- Make sure you're in the animalai-ui directory
- Run `npm install` if dependencies are missing

**No sound:**
- Click Play button (in Write mode)
- Check that samples loaded (console logs)
- Make sure volume is up

**Generation fails:**
- Check Ollama is running: `ollama list`
- Check pydrums works: `~/pydrums/.venv/bin/pydrums generate -d "test"`

## Technical Details

**Stack:**
- React 18 - UI framework
- Electron 28 - Desktop wrapper
- Vite 5 - Build tool with HMR
- Tone.js 14 - Web Audio + MIDI playback
- @tonejs/midi - MIDI file parsing

**Python Integration:**
- Uses Node.js `child_process.spawn()`
- Spawns pydrums CLI from Electron main process
- Reads generated MIDI files via IPC
- All communication through Electron IPC handlers

**Audio:**
- Tone.js Sampler with acoustic drum samples
- MIDI notes mapped to General MIDI drum mapping
- Transport controls for playback
- Loop implemented via Tone.Part

Enjoy creating beats with AnimalAI!
