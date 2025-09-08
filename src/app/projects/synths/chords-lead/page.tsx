"use client";
import { useState, useRef, useCallback } from 'react';
import { FaRegDotCircle, FaSyncAlt, FaSlidersH } from 'react-icons/fa';
import PCBTraces from '../../../../components/PCBTraces';

// Note frequencies in Hz
const noteFrequencies: { [key: string]: number } = {
  'C': 261.63,
  'D': 293.66,
  'E': 329.63,
  'F': 349.23,
  'G': 392.00,
  'A': 440.00,
  'B': 493.88,
};

// Chord intervals (semitones from root)
const chordIntervals: { [key: string]: number[] } = {
  'Maj': [0, 4, 7],
  'min': [0, 3, 7],
  '7': [0, 4, 7, 10],
  'Maj7': [0, 4, 7, 11],
  'min7': [0, 3, 7, 10],
  'dim': [0, 3, 6],
  'aug': [0, 4, 8],
};

const chordTypes = ['Maj', 'min', '7', 'Maj7', 'min7', 'dim', 'aug'];
const defaultChords = [
  { note: 'C', type: 'Maj' },
  { note: 'D', type: 'min' },
  { note: 'E', type: 'min' },
  { note: 'F', type: 'Maj' },
  { note: 'G', type: 'Maj' },
  { note: 'A', type: 'min' },
  { note: 'B', type: 'dim' },
];
const soundParams = [
  { name: 'Attack', min: 0, max: 1, step: 0.01, default: 0.1 },
  { name: 'Decay', min: 0, max: 1, step: 0.01, default: 0.2 },
  { name: 'Sustain', min: 0, max: 1, step: 0.01, default: 0.7 },
  { name: 'Release', min: 0, max: 1, step: 0.01, default: 0.3 },
  { name: 'Filter', min: 0, max: 1, step: 0.01, default: 0.5 },
];

export default function ChordsSynth2D() {
  const [chords, setChords] = useState(defaultChords);
  const [selectedKey, setSelectedKey] = useState(0);
  const [scale, setScale] = useState('C');
  const [screen, setScreen] = useState<'main' | 'chord-select' | 'sound-design'>('main');
  const [encoderFocus, setEncoderFocus] = useState<'key' | 'scale' | 'sound'>('key');
  const [soundParamIdx, setSoundParamIdx] = useState(0);
  const [params, setParams] = useState(soundParams.map(p => p.default));
  
  // Audio context and active oscillators
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Stop all currently playing sounds
  const stopAllSounds = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    activeOscillatorsRef.current.forEach(oscillator => {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch (e) {
        // Oscillator already stopped
      }
    });
    activeOscillatorsRef.current = [];
  }, []);

  // Play chord function
  const playChord = useCallback((chordIndex: number) => {
    const audioContext = initAudioContext();
    if (!audioContext) return;

    // Stop all currently playing sounds first
    stopAllSounds();

    const chord = chords[chordIndex];
    const rootFreq = noteFrequencies[chord.note];
    const intervals = chordIntervals[chord.type];
    
    const oscillators: OscillatorNode[] = [];
    
    intervals.forEach((interval, i) => {
      const frequency = rootFreq * Math.pow(2, interval / 12);
      
      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect audio nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set oscillator properties
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      // Set ADSR envelope
      const now = audioContext.currentTime;
      const attack = params[0]; // Attack
      const decay = params[1];  // Decay
      const sustain = params[2]; // Sustain
      const release = params[3]; // Release
      
      // Initial volume based on note position in chord
      const volume = (0.15 / intervals.length) * (1 - i * 0.1);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + attack);
      gainNode.gain.linearRampToValueAtTime(volume * sustain, now + attack + decay);
      
      oscillator.start(now);
      oscillators.push(oscillator);
      
      // Auto-stop after 2 seconds
      setTimeout(() => {
        if (gainNode.gain) {
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + release);
          setTimeout(() => {
            try {
              oscillator.stop();
              oscillator.disconnect();
              // Remove from active oscillators array
              const index = activeOscillatorsRef.current.indexOf(oscillator);
              if (index > -1) {
                activeOscillatorsRef.current.splice(index, 1);
              }
            } catch (e) {
              // Oscillator already stopped
            }
          }, release * 1000);
        }
      }, 2000);
    });
    
    // Store active oscillators
    activeOscillatorsRef.current = oscillators;
  }, [chords, params, initAudioContext, stopAllSounds]);

  const handleChordTypeChange = (idx: number, type: string) => {
    setChords(chords.map((c, i) => i === idx ? { ...c, type } : c));
  };

  const handleKeyPress = (idx: number) => {
    setSelectedKey(idx);
    playChord(idx);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 relative">
      <PCBTraces />
      {/* Main Synth Body - WIDE */}
      <div className="relative bg-gradient-to-b from-gray-100 to-gray-300 rounded-lg shadow-2xl border-2 border-gray-500 p-6 flex flex-col items-center relative z-10" style={{ width: 580, height: 450 }}>
        <div className="absolute inset-0 rounded-lg pointer-events-none" style={{boxShadow: '0 0 30px rgba(0,0,0,0.3), 0 4px 12px rgba(255,255,255,0.6) inset'}} />

        {/* Top Section: Screen + Controls */}
        <div className="flex items-start justify-center w-full mb-6">
          {/* Screen (Horizontal) */}
          <div className="bg-black rounded-md border-2 border-gray-500 shadow-inner flex flex-col items-center justify-center" style={{ width: 320, height: 180 }}>
            {/* Screen Content */}
            {screen === 'main' && (
              <div className="flex flex-col items-center w-full p-2">
                <div className="flex justify-center gap-1 mb-2 w-full">
                  {chords.map((chord, idx) => (
                    <div key={idx} className={`flex flex-col items-center w-8 p-1 rounded-sm ${selectedKey === idx ? 'bg-yellow-300' : ''}`}>
                      <span className={`text-xs font-bold ${selectedKey === idx ? 'text-black' : 'text-white'}`}>{chord.note}</span>
                      <span className={`text-[0.6rem] ${selectedKey === idx ? 'text-black' : 'text-pink-200'}`}>{chord.type}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-white">Key/Scale:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${encoderFocus === 'scale' ? 'bg-yellow-300 text-black' : 'text-yellow-300'}`}>{scale}</span>
                </div>
                <div className="text-[0.7rem] text-pink-200 mt-2 truncate w-full px-2 text-center">{soundParams.map((param, idx) => `${param.name}: ${params[idx]}`).join(' | ')}</div>
                <div className="flex gap-2 mt-4">
                  <button className={`text-xs px-2 py-0.5 rounded ${encoderFocus === 'key' ? 'bg-yellow-300 text-black' : 'bg-gray-700 text-white'}`} onClick={() => setEncoderFocus('key')}>Key</button>
                  <button className={`text-xs px-2 py-0.5 rounded ${encoderFocus === 'scale' ? 'bg-yellow-300 text-black' : 'bg-gray-700 text-white'}`} onClick={() => setEncoderFocus('scale')}>Scale</button>
                </div>
              </div>
            )}
            {screen === 'chord-select' && (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="text-sm text-white mb-2">Select Chord for <span className="text-yellow-300">{chords[selectedKey].note}</span></div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {chordTypes.map(type => (
                    <button key={type} className={`px-3 py-1 rounded text-sm font-bold ${chords[selectedKey].type === type ? 'bg-yellow-300 text-black' : 'bg-gray-700 text-white hover:bg-yellow-200 hover:text-black'}`} onClick={() => { handleChordTypeChange(selectedKey, type); setScreen('main'); }}>{type}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls (Encoder) */}
          <div className="flex flex-col items-center ml-8">
            <button 
              className="w-12 h-12 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-800 active:scale-95 transition-all duration-150 relative" 
              title="Sound Design" 
              onClick={() => { setScreen(screen === 'sound-design' ? 'main' : 'sound-design'); setEncoderFocus('sound'); }}
            >
              <FaSlidersH size={24} className="text-white drop-shadow-sm" />
              <div className="absolute inset-0 rounded-full bg-white opacity-20"></div>
            </button>
            <div className="flex flex-col items-center mt-4">
              <button 
                className="w-10 h-10 bg-gradient-to-b from-gray-300 to-gray-500 hover:from-gray-200 hover:to-gray-400 rounded-full flex items-center justify-center shadow-md border-2 border-gray-600 active:scale-95 transition-all duration-150 mb-2" 
                title="Encoder Left" 
                onClick={() => { if (encoderFocus === 'key') setSelectedKey((selectedKey + 6) % 7); }}
              >
                <span className="text-xl font-bold text-gray-700 drop-shadow-sm">&larr;</span>
              </button>
              <button 
                className="w-10 h-10 bg-gradient-to-b from-gray-300 to-gray-500 hover:from-gray-200 hover:to-gray-400 rounded-full flex items-center justify-center shadow-md border-2 border-gray-600 active:scale-95 transition-all duration-150 mb-2 relative" 
                title="Encoder Click" 
                onClick={() => { if (screen === 'main') setScreen('chord-select'); else setScreen('main'); }}
              >
                <FaRegDotCircle size={20} className="text-blue-700 drop-shadow-sm" />
                {screen === 'chord-select' && (
                  <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-pulse"></div>
                )}
              </button>
              <button 
                className="w-10 h-10 bg-gradient-to-b from-gray-300 to-gray-500 hover:from-gray-200 hover:to-gray-400 rounded-full flex items-center justify-center shadow-md border-2 border-gray-600 active:scale-95 transition-all duration-150" 
                title="Encoder Right" 
                onClick={() => { if (encoderFocus === 'key') setSelectedKey((selectedKey + 1) % 7); }}
              >
                <span className="text-xl font-bold text-gray-700 drop-shadow-sm">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Keys */}
        <div className="flex flex-col items-center mt-2">
          {/* Top row of keys (3) */}
          <div className="flex gap-3 mb-2">
            {chords.slice(0, 3).map((chord, idx) => (
              <button
                key={idx}
                className={`w-16 h-20 rounded-lg border-2 shadow-md transition-all duration-150 flex flex-col items-center justify-center relative overflow-hidden ${
                  selectedKey === idx 
                    ? 'bg-yellow-300 border-yellow-500 scale-105' 
                    : 'bg-white border-gray-400 hover:bg-yellow-100 hover:scale-102'
                }`}
                style={{
                  boxShadow: selectedKey === idx 
                    ? '0 4px 12px rgba(255,255,0,0.5), 0 2px 5px rgba(0,0,0,0.4) inset' 
                    : '0 2px 6px rgba(0,0,0,0.2), 0 2px 4px rgba(255,255,255,0.4) inset'
                }}
                onClick={() => handleKeyPress(idx)}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = selectedKey === idx ? 'scale(1.05)' : 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = selectedKey === idx ? 'scale(1.05)' : 'scale(1)'}
              >
                {selectedKey === idx && (
                  <div className="absolute inset-0 bg-yellow-400 opacity-20 rounded-lg animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
          {/* Bottom row of keys (4) */}
          <div className="flex gap-3">
            {chords.slice(3).map((chord, idx) => (
              <button
                key={idx + 3}
                className={`w-16 h-24 rounded-lg border-2 shadow-md transition-all duration-150 flex flex-col items-center justify-center relative overflow-hidden ${
                  selectedKey === idx + 3 
                    ? 'bg-yellow-300 border-yellow-500 scale-105' 
                    : 'bg-white border-gray-400 hover:bg-yellow-100 hover:scale-102'
                }`}
                style={{
                  boxShadow: selectedKey === idx + 3 
                    ? '0 4px 12px rgba(255,255,0,0.5), 0 2px 5px rgba(0,0,0,0.4) inset' 
                    : '0 2px 6px rgba(0,0,0,0.2), 0 2px 4px rgba(255,255,255,0.4) inset'
                }}
                onClick={() => handleKeyPress(idx + 3)}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = selectedKey === idx + 3 ? 'scale(1.05)' : 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = selectedKey === idx + 3 ? 'scale(1.05)' : 'scale(1)'}
              >
                {selectedKey === idx + 3 && (
                  <div className="absolute inset-0 bg-yellow-400 opacity-20 rounded-lg animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
