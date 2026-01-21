# AnimalAI Features

## MVP Features (Implemented)

### Core Functionality
- **Text Input**: Describe beats in natural language
  - Examples: "funky disco beat", "fast rock groove", "laid back jazz"
  - Enter key support for quick generation
  - Input validation and feedback

- **Generate Button**: Creates drum patterns via pydrums CLI
  - Spawns Python subprocess
  - Real-time status updates
  - Error handling and user feedback
  - Loading state during generation

- **MIDI Playback**: Play generated beats
  - Tone.js integration
  - Acoustic drum samples from Tone.js CDN
  - General MIDI drum mapping
  - High-quality audio rendering

### Transport Controls
- **Play/Stop Button**: Control playback
  - Visual feedback (button color change)
  - Keyboard-friendly
  - Disabled when no pattern loaded

- **Loop Toggle**: Enable/disable continuous playback
  - Real-time loop state updates
  - Syncs with Tone.Transport
  - Visual active state indication

### Mode Switcher
- **Jam Mode** (Default)
  - Auto-play generated patterns
  - Loop enabled by default
  - Perfect for experimentation
  - One-click workflow: type → generate → hear

- **Write Mode**
  - Manual playback control
  - Loop disabled by default
  - Ideal for composition
  - Better for focused listening

### User Interface
- **Header**: Branding with gradient title
- **Status Bar**:
  - Current operation status
  - Generated file name display
  - Real-time feedback
- **Mode Indicator**: Shows current mode and description
- **Responsive Layout**: Clean, functional design

## Technical Implementation

### Frontend (React + Vite)
- **Component**: Single App.jsx component
- **State Management**: React hooks (useState, useRef, useEffect)
- **Styling**: Custom CSS with gradient accents
- **Hot Module Replacement**: Instant updates during development

### Backend (Electron)
- **IPC Handlers**:
  - `generate-pattern`: Spawns pydrums CLI
  - `read-midi-file`: Reads MIDI data for playback
- **Process Management**: Child process spawning
- **File System**: MIDI file discovery and reading
- **Error Handling**: Comprehensive error catching

### Audio (Tone.js)
- **MIDI Parsing**: @tonejs/midi for file parsing
- **Sampler**: Tone.Sampler with drum kit
- **Transport**: Tone.Transport for playback control
- **Part**: Tone.Part for note scheduling
- **Loop**: Built-in loop support

### Python Integration
- **CLI Command**: `pydrums generate -d "description"`
- **Working Directory**: Managed via spawn options
- **Output**: Captures stdout/stderr for debugging
- **Exit Codes**: Proper error handling

## User Experience

### Jam Mode Workflow
1. App opens in Jam Mode
2. Type "groovy funk beat"
3. Press Enter
4. Pattern generates (5-10 seconds)
5. Automatically starts playing on loop
6. Type next description and repeat

### Write Mode Workflow
1. Switch to Write Mode
2. Type "fast rock groove"
3. Press Enter or click Generate
4. Pattern generates
5. Click Play to hear it
6. Pattern plays once (no loop)
7. Can replay or generate new pattern

## Keyboard Shortcuts
- **Enter**: Generate pattern (when input focused)
- Future: Space for Play/Stop, L for Loop toggle

## File Management
- **Auto-discovery**: Finds most recent MIDI file
- **File naming**: Based on description (sanitized)
- **Location**: `~/pydrums/midi_output/`
- **Format**: Standard MIDI (.mid)

## Performance
- **Generation Time**: 5-10 seconds (depends on Ollama)
- **Playback Latency**: <100ms
- **Sample Loading**: Lazy load from CDN
- **Memory**: Efficient cleanup of Tone.js objects

## Error Handling
- **No Description**: User feedback prompts for input
- **Generation Failure**: Error message with details
- **No MIDI File**: Catches and reports missing output
- **Sample Load**: Console logging for debugging
- **IPC Errors**: Comprehensive error reporting

## Future Enhancement Ideas

### Audio Features
- Tempo control (BPM slider)
- Volume control
- Metronome click track
- Audio export to WAV/MP3
- Custom drum kit selection
- Effects (reverb, compression)

### Pattern Management
- Pattern library/history
- Save favorite patterns
- Export to various formats
- Pattern tags and search
- Compare patterns side-by-side

### Visualization
- Waveform display
- Piano roll view
- Drum grid editor
- Beat visualization
- Playback progress bar

### Workflow
- Batch generation
- Pattern variations
- Random generation
- Style presets
- Undo/redo

### Integration
- DAW export
- MIDI output to hardware
- VST plugin support
- Sync with external clock

### UI/UX
- Dark/light theme
- Customizable layouts
- Keyboard shortcuts
- Drag-and-drop
- Touch support

## Known Limitations

- Single pattern at a time
- No BPM control (uses default 120)
- Limited to pydrums available styles
- Internet required for drum samples
- No pattern editing
- No audio export
- Generation time depends on Ollama speed

## Dependencies

**Production:**
- react ^18.2.0
- react-dom ^18.2.0
- tone ^14.7.77
- @tonejs/midi ^2.0.28

**Development:**
- @vitejs/plugin-react ^4.2.1
- vite ^5.0.12
- electron ^28.2.0
- electron-builder ^24.9.1
- concurrently ^8.2.2
- wait-on ^7.2.0

**Python:**
- pydrums (from parent directory)
- Ollama (external dependency)
