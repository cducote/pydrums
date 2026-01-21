import React, { useState, useRef, useEffect } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import './App.css';

const { ipcRenderer } = window.require('electron');

const MODE = {
  JAM: 'jam',
  WRITE: 'write',
};

function App() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [mode, setMode] = useState(MODE.JAM);
  const [currentMidiPath, setCurrentMidiPath] = useState(null);
  const [status, setStatus] = useState('Ready');

  const partRef = useRef(null);
  const midiDataRef = useRef(null);

  // Update loop state when mode changes
  useEffect(() => {
    if (mode === MODE.JAM) {
      setLoopEnabled(true);
    } else {
      setLoopEnabled(false);
    }
  }, [mode]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setStatus('Please enter a description');
      return;
    }

    setIsGenerating(true);
    setStatus('Generating pattern...');

    try {
      const result = await ipcRenderer.invoke('generate-pattern', description);
      console.log('Generated:', result);

      setCurrentMidiPath(result.midiPath);
      setStatus(`Generated: ${result.fileName}`);

      // Load the MIDI file
      await loadMidiFile(result.midiPath);

      // Auto-play in Jam mode
      if (mode === MODE.JAM) {
        await playPattern();
      }
    } catch (error) {
      console.error('Generation error:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadMidiFile = async (midiPath) => {
    try {
      const midiArrayBuffer = await ipcRenderer.invoke('read-midi-file', midiPath);
      const uint8Array = new Uint8Array(midiArrayBuffer);
      const midi = new Midi(uint8Array);

      midiDataRef.current = midi;
      console.log('MIDI loaded:', midi);
    } catch (error) {
      console.error('Error loading MIDI:', error);
      throw error;
    }
  };

  const playPattern = async () => {
    if (!midiDataRef.current) {
      setStatus('No pattern loaded');
      return;
    }

    // Stop any currently playing pattern
    if (partRef.current) {
      partRef.current.stop();
      partRef.current.dispose();
      partRef.current = null;
    }

    // Start Tone.js audio context
    await Tone.start();

    const midi = midiDataRef.current;

    // Create a sampler with drum sounds
    const drumSampler = new Tone.Sampler({
      urls: {
        'C1': 'kick',
        'D1': 'snare',
        'F#1': 'hihat-closed',
        'A#1': 'hihat-open',
        'E2': 'tom-low',
        'B2': 'tom-mid',
        'D3': 'tom-high',
        'C#2': 'crash',
        'D#2': 'ride',
      },
      baseUrl: "https://tonejs.github.io/audio/drum-samples/acoustic-kit/",
      onload: () => {
        console.log('Drum samples loaded');
      }
    }).toDestination();

    // Convert MIDI notes to Tone.js events
    const notes = [];
    midi.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        notes.push({
          time: note.time,
          note: note.name,
          duration: note.duration,
          velocity: note.velocity,
        });
      });
    });

    // Create a Part for playback
    const part = new Tone.Part((time, note) => {
      drumSampler.triggerAttackRelease(
        note.note,
        note.duration,
        time,
        note.velocity
      );
    }, notes);

    // Set loop
    part.loop = loopEnabled;
    part.loopEnd = midi.duration;

    partRef.current = part;

    // Start playback
    Tone.Transport.bpm.value = midi.header.tempos[0]?.bpm || 120;
    part.start(0);
    Tone.Transport.start();

    setIsPlaying(true);
    setStatus('Playing...');

    // If not looping, stop after the pattern finishes
    if (!loopEnabled) {
      setTimeout(() => {
        stopPattern();
      }, midi.duration * 1000);
    }
  };

  const stopPattern = () => {
    if (partRef.current) {
      partRef.current.stop();
      partRef.current.dispose();
      partRef.current = null;
    }
    Tone.Transport.stop();
    setIsPlaying(false);
    setStatus('Stopped');
  };

  const togglePlayStop = () => {
    if (isPlaying) {
      stopPattern();
    } else {
      playPattern();
    }
  };

  const toggleLoop = () => {
    const newLoopState = !loopEnabled;
    setLoopEnabled(newLoopState);

    // Update the current part if playing
    if (partRef.current) {
      partRef.current.loop = newLoopState;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleGenerate();
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setStatus(`Switched to ${newMode.toUpperCase()} mode`);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🥁 AnimalAI</h1>
        <p>AI-Powered Drum Beat Generator</p>
      </header>

      <div className="mode-switcher">
        <button
          className={`mode-btn ${mode === MODE.JAM ? 'active' : ''}`}
          onClick={() => switchMode(MODE.JAM)}
        >
          Jam Mode
        </button>
        <button
          className={`mode-btn ${mode === MODE.WRITE ? 'active' : ''}`}
          onClick={() => switchMode(MODE.WRITE)}
        >
          Write Mode
        </button>
      </div>

      <div className="main-content">
        <div className="input-section">
          <input
            type="text"
            className="description-input"
            placeholder='Describe your beat (e.g., "funky disco beat", "fast rock groove")'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
          />
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div className="transport-controls">
          <button
            className={`control-btn play-stop ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlayStop}
            disabled={!currentMidiPath}
          >
            {isPlaying ? '⏸ Stop' : '▶ Play'}
          </button>
          <button
            className={`control-btn loop ${loopEnabled ? 'active' : ''}`}
            onClick={toggleLoop}
            disabled={!currentMidiPath}
          >
            {loopEnabled ? '🔁 Loop: ON' : '🔁 Loop: OFF'}
          </button>
        </div>

        <div className="status-bar">
          <span className="status-text">{status}</span>
          {currentMidiPath && (
            <span className="file-info">
              {currentMidiPath.split('/').pop()}
            </span>
          )}
        </div>
      </div>

      <footer className="footer">
        <p className="mode-description">
          {mode === MODE.JAM
            ? '🎸 JAM MODE: Auto-play with loop enabled by default'
            : '✍️ WRITE MODE: Manual playback, loop disabled by default'}
        </p>
      </footer>
    </div>
  );
}

export default App;
