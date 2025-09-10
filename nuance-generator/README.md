# AI Song Nuance Generator

An AI tool that automatically adds subtle nuances, samples, and textures to songs to make them feel less repetitive and more unique.

## Features

- 🎵 **Automatic Analysis**: Detects BPM, beats, and song structure
- 🎛️ **Smart Placement**: Adds nuances at musically appropriate spots
- 🎨 **Customizable Samples**: Use your own sample library
- 📊 **Nuance Mapping**: Logs what was added where
- 🔧 **Subtle Enhancement**: Keeps additions tasteful and non-overpowering

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up sample library:**
   ```bash
   # The script will create a samples/ directory structure
   python nuance_generator.py
   ```

3. **Add your samples:**
   Place WAV files in the appropriate directories:
   - `samples/percussion/` - Drum hits, crashes, fills
   - `samples/texture/` - Ambient sounds, pads, atmospheres
   - `samples/riser/` - Build-ups, sweeps, risers
   - `samples/fx/` - Vocal chops, glitches, sound effects

## Usage

### Command Line Interface

```bash
# Basic usage
python cli.py input_song.wav output_song.wav

# Dry run (analyze only)
python cli.py input_song.wav output_song.wav --dry-run

# Custom samples directory
python cli.py input_song.wav output_song.wav --samples-dir my_samples/
```

### Python API

```python
from nuance_generator import SongNuanceGenerator

# Initialize generator
generator = SongNuanceGenerator("samples/")

# Process a song
result = generator.process_song("input.wav", "output.wav")

# The result includes analysis data and nuance events
print(f"Added {len(result['events'])} nuances")
```

## How It Works

1. **Song Analysis**
   - Extracts tempo and beat grid using librosa
   - Detects song sections (verse, chorus, etc.)
   - Identifies musical downbeats and phrase boundaries

2. **Nuance Scheduling**
   - Randomly places samples at musically appropriate spots
   - Higher probability at ends of bars/phrases
   - Section changes trigger bigger effects (risers, sweeps)
   - Adds humanized timing jitter (±30ms)

3. **Intelligent Mixing**
   - Keeps nuance volume low (-18 to -12 LUFS)
   - Prevents clipping with automatic normalization
   - Maintains original song's overall loudness

## Example Output

```
Processing input_song.wav -> output_song.wav
Analyzing input_song.wav...
Analysis complete: 120.0 BPM, 256 beats, 8 sections
Scheduled 15 nuance events
Processing complete! Added 15 nuances.
Nuance map saved to: output_song_nuance_map.json
```

## Sample Requirements

- **Format**: WAV files recommended
- **Length**: Keep samples under 10 seconds
- **Quality**: 44.1kHz or higher sample rate
- **Organization**: Sort by type for best results

## Tips for Best Results

- **Percussion**: Short one-shots work best (crashes, hits, fills)
- **Textures**: Ambient pads and atmospheres add depth
- **Risers**: Build-ups should peak around 2-4 seconds
- **FX**: Vocal chops and glitches add character

## Future Features

- [ ] Real-time processing for DAWs
- [ ] Style profiles (lo-fi, trap, ambient)
- [ ] AI-trained placement models
- [ ] VST/AU plugin version
- [ ] Web interface integration

## Technical Details

Built with:
- **librosa**: Audio analysis and beat tracking
- **numpy**: Audio processing and manipulation
- **soundfile**: High-quality audio I/O
- **Python 3.8+**: Core runtime

## Troubleshooting

**No samples loaded**: Make sure WAV files are in the correct subdirectories

**Import errors**: Install dependencies with `pip install -r requirements.txt`

**Audio quality issues**: Use high-quality source files and samples

**Timing issues**: Check that your samples aren't too long or loud
