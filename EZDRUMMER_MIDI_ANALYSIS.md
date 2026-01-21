# EZDrummer MIDI Library Analysis

## Overview

EZDrummer stores a massive library of professional MIDI drum grooves in:
```
/Library/Application Support/EZDrummer/Midi/
```

These files contain rich metadata both in the **file path structure** and **within the MIDI files themselves**.

## What We Can Extract Programmatically

### 1. File Path Metadata (Highly Structured!)

EZDrummer uses a very organized folder structure:

```
/Library/Application Support/EZDrummer/Midi/
  └── {LIBRARY_CODE}@{LIBRARY_NAME}/
      └── {BPM}-S{GROOVE_NUM}@{SECTION}/
          └── Variation_{NUM}.mid
```

**Example:**
```
1918@EZX_UK_POP/136-S055@BRIDGE/Variation_01.mid
```

**Extracted Metadata:**
- **Library Code**: `1918`
- **Library Name**: `EZX UK POP`
- **BPM**: `136` (from folder name!)
- **Groove Number**: `055`
- **Section**: `BRIDGE` (INTRO, VERSE, CHORUS, BRIDGE, FILLS, etc.)
- **Variation**: `1` (usually 1-4 variations per groove)

### 2. MIDI File Metadata

**From the MIDI header:**
- **Tempo**: Embedded BPM (e.g., 136.0001450668214)
- **Time Signature**: e.g., 4/4, 3/4, 6/8
- **Duration**: In seconds and bars
- **PPQ**: Pulses per quarter note (resolution, usually 9600 for EZDrummer)
- **Track Count**: Usually 1 track for drums

**From the MIDI tracks:**
- **Total Notes**: Count of all drum hits
- **Note Range**: MIDI note numbers (36-49 for standard drums)
- **Channel**: MIDI channel (usually 0 for drums)
- **Instrument**: Often labeled as "acoustic grand piano" (MIDI default)

### 3. Drum Note Breakdown

**We can analyze which drums are used and how often:**

Example from `136-S055@BRIDGE/Variation_01.mid`:
```json
{
  "Kick": 24,
  "Floor Tom": 63,
  "Snare (Rim)": 16,
  "Tom High": 3,
  "Crash": 1,
  "Snare": 2
}
```

**General MIDI Drum Mapping (Standard):**
- 36 = Kick
- 38 = Snare
- 40 = Snare (Rim)
- 42 = Hi-Hat Closed
- 43 = Floor Tom
- 44 = Hi-Hat Pedal
- 46 = Hi-Hat Open
- 47 = Tom Mid
- 48 = Tom High
- 49 = Crash
- 51 = Ride
- 53 = Ride Bell

**Note:** Some EZDrummer files use non-standard MIDI notes (e.g., MIDI 21, 26, 61) which map to specific EZDrummer kit pieces.

## Library Organization

### Library Types

1. **Core Libraries**:
   - `02_@EZDRUMMER_2_MODERN#VINTAGE`
   - `02_@EZDRUMMER_2_PERCUSSION`
   - `02_@EZDRUMMER_3`
   - `02_@EZDRUMMER_3_PERCUSSION`

2. **EZX Expansion Libraries**:
   - `1918@EZX_UK_POP`
   - `1943@EZX_SIGNATURE_-_PART_1`
   - Many more expansion packs

### Groove Sections

EZDrummer organizes grooves by **song sections**:
- `INTRO`
- `VERSE`
- `PRE_CHORUS`
- `CHORUS`
- `BRIDGE`
- `FILLS`
- `OUTRO`

### BPM Organization

Each groove is organized by BPM ranges, making it easy to find grooves at specific tempos:
- `079-S010@_DEEPER_BEATER_79_BPM`
- `110-S020@_TEA_TOWELS_110_BPM`
- `120-S030@_CARNABY_STREET_120_BPM`
- `136-S055@BRIDGE`

## Programmatic Access

### Using the Analyzer Script

**Analyze a single file:**
```bash
node analyze_ezdrummer_midi.js "/Library/Application Support/EZDrummer/Midi/1918@EZX_UK_POP/136-S055@BRIDGE/Variation_01.mid"
```

**Scan the entire library:**
```bash
node analyze_ezdrummer_midi.js
```

### API Functions

```javascript
const { analyzeMidiFile, scanEZDrummerLibrary, parseFilePathMetadata } = require('./analyze_ezdrummer_midi');

// Analyze a single file
const metadata = analyzeMidiFile('/path/to/file.mid');

// Scan library (returns first N files)
const results = scanEZDrummerLibrary(100);

// Parse file path only
const pathMeta = parseFilePathMetadata('/Library/Application Support/EZDrummer/Midi/1918@EZX_UK_POP/136-S055@BRIDGE/Variation_01.mid');
// Returns: { libraryCode: '1918', libraryName: 'EZX UK POP', bpm: 136, grooveNumber: '055', section: 'BRIDGE', variation: 1 }
```

## Potential Use Cases for AnimalAI

### 1. **Browse EZDrummer Grooves**
- Build a UI to browse all EZDrummer MIDI files
- Filter by BPM, section, library, style
- Preview grooves before loading in EZDrummer

### 2. **Play EZDrummer Grooves Directly**
- Load EZDrummer MIDI files into Tone.js
- Play them with the same acoustic samples
- No need to open EZDrummer for quick previews

### 3. **Hybrid Workflow**
- Generate patterns with pydrums AI
- Compare with similar EZDrummer grooves
- Mix AI-generated + EZDrummer patterns

### 4. **Learn from EZDrummer**
- Analyze patterns to understand groove structure
- Train AI models on EZDrummer patterns
- Extract common patterns by section type

### 5. **Smart Search**
- "Find all BRIDGE sections at 120-140 BPM"
- "Show me all INTRO grooves in the UK POP library"
- "Find grooves with heavy kick and snare rim"

### 6. **Export to EZDrummer**
- Generate patterns with pydrums
- Export in EZDrummer-compatible format
- Load directly into EZDrummer for high-quality rendering

## Example: Full Metadata from UK POP Bridge

```json
{
  "filePath": "/Library/Application Support/EZDrummer/Midi/1918@EZX_UK_POP/136-S055@BRIDGE/Variation_01.mid",
  "fileName": "Variation_01.mid",
  "libraryCode": "1918",
  "libraryName": "EZX UK POP",
  "bpm": 136,
  "grooveNumber": "055",
  "section": "BRIDGE",
  "variation": 1,
  "duration": 13.96,
  "durationBars": 7.91,
  "ppq": 9600,
  "tempo": 136.0001450668214,
  "timeSignature": [4, 4],
  "tracks": 1,
  "totalNotes": 109,
  "drumNotes": {
    "Kick": 24,
    "Floor Tom": 63,
    "Snare (Rim)": 16,
    "Tom High": 3,
    "Crash": 1,
    "Snare": 2
  }
}
```

## Key Insights

1. **Rich Metadata**: Both file structure AND MIDI data contain valuable info
2. **Highly Organized**: EZDrummer's folder structure is predictable and parseable
3. **Professional Quality**: These are real, human-played grooves
4. **Variety**: Multiple variations per groove for natural feel
5. **Section-Based**: Organized by song structure (INTRO, VERSE, etc.)
6. **BPM Metadata**: BPM is embedded in both folder name AND MIDI tempo
7. **Standard MIDI**: Mostly follows General MIDI drum mapping
8. **High Resolution**: PPQ of 9600 = very precise timing

## Next Steps for AnimalAI

Consider adding:
- **EZDrummer Browser**: UI to explore your EZDrummer library
- **Hybrid Mode**: Generate with AI + pick from EZDrummer
- **Smart Matching**: Find similar EZDrummer grooves to AI generations
- **Export to EZDrummer**: Save AI patterns in EZDrummer format
- **Learning Mode**: Analyze EZDrummer patterns to improve AI generation

The combination of AI-generated patterns (pydrums) + professional library (EZDrummer) could be very powerful!
