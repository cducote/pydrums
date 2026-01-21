#!/usr/bin/env node

/**
 * EZDrummer MIDI Library Analyzer
 * Extracts metadata from EZDrummer MIDI files programmatically
 */

const fs = require('fs');
const path = require('path');
const { Midi } = require('./animalai-ui/node_modules/@tonejs/midi');

const EZDRUMMER_MIDI_PATH = '/Library/Application Support/EZDrummer/Midi';

/**
 * Parse metadata from EZDrummer file path structure
 * Example: 1918@EZX_UK_POP/136-S055@BRIDGE/variation_01.mid
 */
function parseFilePathMetadata(filePath) {
  const parts = filePath.split('/');
  const metadata = {};

  // Extract library name (e.g., "1918@EZX_UK_POP")
  const libraryMatch = parts.find(p => p.includes('@'));
  if (libraryMatch) {
    const [code, ...nameParts] = libraryMatch.split('@');
    metadata.libraryCode = code;
    metadata.libraryName = nameParts.join('@').replace(/_/g, ' ');
  }

  // Extract groove info (e.g., "136-S055@BRIDGE")
  const grooveMatch = parts.find(p => p.match(/^\d+-S\d+@/));
  if (grooveMatch) {
    const match = grooveMatch.match(/^(\d+)-S(\d+)@(.+)$/);
    if (match) {
      metadata.bpm = parseInt(match[1]);
      metadata.grooveNumber = match[2];
      metadata.section = match[3].replace(/_/g, ' ');
    }
  }

  // Extract variation (e.g., "variation_01.mid")
  const fileName = path.basename(filePath);
  const variationMatch = fileName.match(/variation_(\d+)\.mid/i);
  if (variationMatch) {
    metadata.variation = parseInt(variationMatch[1]);
  }

  return metadata;
}

/**
 * Read MIDI file and extract all metadata
 */
function analyzeMidiFile(filePath) {
  try {
    const midiData = fs.readFileSync(filePath);
    const midi = new Midi(midiData);

    const pathMeta = parseFilePathMetadata(filePath);

    return {
      // File path metadata
      filePath: filePath,
      fileName: path.basename(filePath),
      ...pathMeta,

      // MIDI header metadata
      duration: midi.duration,
      durationBars: midi.durationTicks / midi.header.ppq / 4,
      ppq: midi.header.ppq,

      // Musical metadata
      tempo: midi.header.tempos?.[0]?.bpm || null,
      timeSignature: midi.header.timeSignatures?.[0]?.timeSignature || null,
      keySignature: midi.header.keySignatures?.[0] || null,

      // Track info
      tracks: midi.tracks.length,
      totalNotes: midi.tracks.reduce((sum, track) => sum + track.notes.length, 0),

      // Detailed track data
      trackDetails: midi.tracks.map((track, i) => ({
        index: i,
        name: track.name || 'Unnamed',
        channel: track.channel,
        instrument: track.instrument?.name || track.instrument?.number || 'N/A',
        noteCount: track.notes.length,
        noteRange: track.notes.length > 0 ? {
          min: Math.min(...track.notes.map(n => n.midi)),
          max: Math.max(...track.notes.map(n => n.midi)),
          minName: track.notes.reduce((min, n) => n.midi < min.midi ? n : min).name,
          maxName: track.notes.reduce((max, n) => n.midi > max.midi ? n : max).name,
        } : null,
        controlChanges: track.controlChanges ? Object.keys(track.controlChanges) : [],
      })),

      // Drum mapping (General MIDI drum notes)
      drumNotes: extractDrumNotes(midi),
    };
  } catch (error) {
    return {
      filePath: filePath,
      error: error.message,
    };
  }
}

/**
 * Extract and categorize drum notes
 */
function extractDrumNotes(midi) {
  const drumMap = {
    36: 'Kick',
    38: 'Snare',
    40: 'Snare (Rim)',
    42: 'Hi-Hat Closed',
    43: 'Floor Tom',
    44: 'Hi-Hat Pedal',
    45: 'Tom Low',
    46: 'Hi-Hat Open',
    47: 'Tom Mid',
    48: 'Tom High',
    49: 'Crash',
    51: 'Ride',
    53: 'Ride Bell',
    55: 'Splash',
    57: 'Crash 2',
  };

  const noteCounts = {};

  midi.tracks.forEach(track => {
    track.notes.forEach(note => {
      const drumName = drumMap[note.midi] || `MIDI ${note.midi}`;
      if (!noteCounts[drumName]) {
        noteCounts[drumName] = 0;
      }
      noteCounts[drumName]++;
    });
  });

  return noteCounts;
}

/**
 * Scan EZDrummer library and analyze all MIDI files
 */
function scanEZDrummerLibrary(maxFiles = 10) {
  const results = [];

  function scanDir(dir, depth = 0) {
    if (depth > 5 || results.length >= maxFiles) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (results.length >= maxFiles) break;

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanDir(fullPath, depth + 1);
        } else if (entry.name.toLowerCase().endsWith('.mid')) {
          const analysis = analyzeMidiFile(fullPath);
          results.push(analysis);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error.message);
    }
  }

  scanDir(EZDRUMMER_MIDI_PATH);
  return results;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Analyze specific file
    const filePath = args[0];
    console.log('=== ANALYZING SINGLE FILE ===\n');
    const result = analyzeMidiFile(filePath);
    console.log(JSON.stringify(result, null, 2));
  } else {
    // Scan library
    console.log('=== SCANNING EZDRUMMER LIBRARY ===\n');
    console.log('Scanning first 20 MIDI files...\n');
    const results = scanEZDrummerLibrary(20);

    console.log(`Found ${results.length} MIDI files\n`);
    console.log('=== SAMPLE RESULTS ===\n');

    results.slice(0, 5).forEach((result, i) => {
      console.log(`\n--- File ${i + 1}: ${result.fileName} ---`);
      console.log(`Library: ${result.libraryName || 'N/A'}`);
      console.log(`BPM: ${result.bpm || result.tempo || 'N/A'}`);
      console.log(`Section: ${result.section || 'N/A'}`);
      console.log(`Variation: ${result.variation || 'N/A'}`);
      console.log(`Duration: ${result.duration?.toFixed(2)}s (${result.durationBars?.toFixed(2)} bars)`);
      console.log(`Time Signature: ${result.timeSignature ? result.timeSignature.join('/') : 'N/A'}`);
      console.log(`Total Notes: ${result.totalNotes}`);
      console.log(`Drum Breakdown:`, result.drumNotes);
    });

    console.log('\n\n=== FULL JSON OUTPUT ===\n');
    console.log(JSON.stringify(results, null, 2));
  }
}

module.exports = {
  analyzeMidiFile,
  scanEZDrummerLibrary,
  parseFilePathMetadata,
};
