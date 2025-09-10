#!/usr/bin/env python3
"""
Test script for the AI Song Nuance Generator
Generates synthetic test audio and processes it
"""

import numpy as np
import soundfile as sf
from nuance_generator import SongNuanceGenerator
import os

def generate_test_song(duration=30, bpm=120, filename="test_song.wav"):
    """Generate a simple test song with basic beat pattern"""
    sr = 44100
    samples = int(duration * sr)
    
    # Create time axis
    t = np.linspace(0, duration, samples)
    
    # Basic 4/4 beat pattern
    beat_freq = bpm / 60  # beats per second
    
    # Create kick drum pattern (every beat)
    kick_pattern = np.sin(2 * np.pi * beat_freq * t) > 0.8
    kick = kick_pattern * np.exp(-5 * (t % (1/beat_freq))) * np.sin(2 * np.pi * 60 * t)
    
    # Create hi-hat pattern (twice per beat)
    hihat_freq = beat_freq * 2
    hihat_pattern = np.sin(2 * np.pi * hihat_freq * t) > 0.9
    hihat = hihat_pattern * np.exp(-20 * (t % (1/hihat_freq))) * np.random.normal(0, 0.1, len(t))
    
    # Create simple chord progression
    chord_freq = beat_freq / 4  # chord changes every 4 beats
    chord_notes = [261.63, 329.63, 392.00, 523.25]  # C, E, G, C
    chord = np.zeros_like(t)
    
    for i, freq in enumerate(chord_notes):
        chord_gate = ((t * chord_freq) % 1) < 0.8  # 80% of each chord duration
        chord_phase = ((t * chord_freq).astype(int) % 4) == i
        chord += chord_gate * chord_phase * 0.3 * np.sin(2 * np.pi * freq * t)
    
    # Mix everything together
    song = kick * 0.6 + hihat * 0.3 + chord * 0.4
    
    # Normalize
    song = song / np.max(np.abs(song)) * 0.8
    
    # Save
    sf.write(filename, song, sr)
    print(f"Generated test song: {filename} ({duration}s, {bpm} BPM)")
    return filename

def create_test_samples():
    """Create simple test samples for each category"""
    sr = 44100
    samples_dir = "samples"
    
    # Create directories
    categories = ['percussion', 'texture', 'riser', 'fx']
    for cat in categories:
        os.makedirs(f"{samples_dir}/{cat}", exist_ok=True)
    
    # Generate percussion samples
    for i in range(3):
        # Simple crash cymbal
        duration = 0.5
        t = np.linspace(0, duration, int(duration * sr))
        crash = np.random.normal(0, 1, len(t)) * np.exp(-3 * t) * (1 + np.sin(2 * np.pi * 8000 * t) * 0.1)
        sf.write(f"{samples_dir}/percussion/crash_{i+1}.wav", crash * 0.7, sr)
    
    # Generate texture samples  
    for i in range(3):
        # Simple pad sound
        duration = 2.0
        t = np.linspace(0, duration, int(duration * sr))
        freq = 220 * (i + 1)
        pad = 0.3 * np.sin(2 * np.pi * freq * t) * np.exp(-0.5 * t)
        sf.write(f"{samples_dir}/texture/pad_{i+1}.wav", pad, sr)
    
    # Generate riser samples
    for i in range(2):
        # Simple white noise riser
        duration = 1.5
        t = np.linspace(0, duration, int(duration * sr))
        riser = np.random.normal(0, 0.5, len(t)) * (t / duration) ** 2
        # Add some filtering effect
        riser = riser * (1 + np.sin(2 * np.pi * 1000 * (t / duration) * t) * 0.3)
        sf.write(f"{samples_dir}/riser/riser_{i+1}.wav", riser, sr)
    
    # Generate FX samples
    for i in range(3):
        # Simple glitch/pop
        duration = 0.2
        t = np.linspace(0, duration, int(duration * sr))
        fx = np.sin(2 * np.pi * 1000 * (i + 1) * t) * np.exp(-10 * t)
        sf.write(f"{samples_dir}/fx/glitch_{i+1}.wav", fx * 0.5, sr)
    
    print("Created test samples in samples/ directory")

def run_test():
    """Run a complete test of the nuance generator"""
    print("=== AI Song Nuance Generator Test ===\n")
    
    # Step 1: Create test samples
    print("1. Creating test samples...")
    create_test_samples()
    
    # Step 2: Generate test song
    print("\n2. Generating test song...")
    test_song = generate_test_song(duration=20, bpm=128)
    
    # Step 3: Initialize generator
    print("\n3. Initializing nuance generator...")
    generator = SongNuanceGenerator("samples")
    
    # Step 4: Process the song
    print("\n4. Processing song with nuances...")
    try:
        result = generator.process_song(test_song, "test_song_with_nuances.wav")
        
        print(f"\n=== Results ===")
        print(f"✅ Successfully added {len(result['events'])} nuances")
        print(f"📄 Original: {test_song}")
        print(f"🎵 Enhanced: test_song_with_nuances.wav")
        print(f"📊 Nuance map: test_song_with_nuances_nuance_map.json")
        
        # Show some events
        print(f"\n📝 Sample events:")
        for i, event in enumerate(result['events'][:5]):
            print(f"  {i+1}. {event['type']} at {event['time']:.2f}s (bar {event['bar_number']})")
        
        if len(result['events']) > 5:
            print(f"  ... and {len(result['events']) - 5} more")
            
        print(f"\n🎉 Test completed successfully!")
        print(f"Listen to both files to hear the difference!")
        
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
