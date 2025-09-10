#!/usr/bin/env python3
"""
CLI interface for the AI Song Nuance Generator
"""

import argparse
import sys
from pathlib import Path
from nuance_generator import SongNuanceGenerator

def main():
    parser = argparse.ArgumentParser(description='Add AI-generated nuances to songs')
    parser.add_argument('input', help='Input audio file (WAV/MP3)')
    parser.add_argument('output', help='Output audio file (WAV)')
    parser.add_argument('--samples-dir', default='samples', help='Directory containing nuance samples')
    parser.add_argument('--dry-run', action='store_true', help='Analyze only, don\'t generate output')
    
    args = parser.parse_args()
    
    # Validate input file
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file '{args.input}' not found")
        sys.exit(1)
    
    # Initialize generator
    try:
        generator = SongNuanceGenerator(args.samples_dir)
    except Exception as e:
        print(f"Error initializing generator: {e}")
        sys.exit(1)
    
    if args.dry_run:
        # Just analyze the song
        analysis = generator.analyze_song(str(input_path))
        events = generator.schedule_nuances(analysis)
        print(f"\nAnalysis Results:")
        print(f"  Tempo: {float(analysis['tempo']):.1f} BPM")
        print(f"  Duration: {analysis['duration']:.1f} seconds")
        print(f"  Beats detected: {len(analysis['beats'])}")
        print(f"  Nuances scheduled: {len(events)}")
        
        # Show event details
        for i, event in enumerate(events[:10]):  # Show first 10
            print(f"  Event {i+1}: {event['type']} at {event['time']:.2f}s (bar {event['bar_number']})")
        if len(events) > 10:
            print(f"  ... and {len(events) - 10} more events")
    else:
        # Process the full song
        try:
            result = generator.process_song(str(input_path), args.output)
            print(f"\nSuccess! Enhanced song saved to: {args.output}")
            print(f"Nuance map saved to: {args.output.replace('.wav', '_nuance_map.json')}")
        except Exception as e:
            print(f"Error processing song: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
