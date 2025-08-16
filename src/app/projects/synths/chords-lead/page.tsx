"use client";
import { useState } from 'react';
import { FaChevronLeft, FaHome, FaRegDotCircle, FaSyncAlt, FaSlidersH } from 'react-icons/fa';

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

  const handleChordTypeChange = (idx: number, type: string) => {
    setChords(chords.map((c, i) => i === idx ? { ...c, type } : c));
  };
  const handleParamChange = (idx: number, value: number) => {
    setParams(params.map((p, i) => i === idx ? value : p));
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-200 via-gray-400 to-gray-300 text-gray-900 relative overflow-hidden">
      <div className="flex flex-col items-center">
        {/* OP-1 Inspired Synth Body */}
  <div className="relative bg-gradient-to-br from-gray-100 via-gray-300 to-gray-200 rounded-2xl shadow-2xl border-4 border-gray-400 p-2 pt-2 pb-4 flex flex-col items-center" style={{width: 260, minHeight: 60, maxWidth: 320}}>
          {/* Bezel highlight */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{boxShadow: '0 0 32px 8px #0002, 0 2px 8px #fff3 inset'}} />

          {/* Top Row: Back, Home, Rotary Encoder (moved to right), and centered Screen fully on synth body */}
          <div className="flex items-center justify-between w-full mb-1 px-1">
            {/* Back & Home */}
            <div className="flex flex-col gap-2 mr-2">
              <button className="w-7 h-7 bg-gray-300 hover:bg-gray-200 rounded-full flex items-center justify-center shadow border border-gray-400 active:scale-95 transition-transform" title="Back">
                <FaChevronLeft size={14} />
              </button>
              <button className="w-7 h-7 bg-gray-300 hover:bg-gray-200 rounded-full flex items-center justify-center shadow border border-gray-400 active:scale-95 transition-transform" title="Home">
                <FaHome size={14} />
              </button>
            </div>
            {/* Sound Design button */}
            <button className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow border-2 border-indigo-800 active:scale-95 transition-transform mx-2" title="Sound Design" onClick={() => { setScreen(screen === 'sound-design' ? 'main' : 'sound-design'); setEncoderFocus('sound'); }}>
              <FaSlidersH size={18} className="text-white" />
            </button>
            {/* Rotary Encoder: left/right/click, context-sensitive */}
            <div className="ml-2 flex flex-col items-center">
              <button className="w-8 h-8 bg-gray-400 hover:bg-gray-300 rounded-full flex items-center justify-center shadow-2xl border-2 border-gray-500 active:scale-95 transition-transform mb-1" title="Encoder Left" onClick={() => {
                if (encoderFocus === 'key') setSelectedKey((selectedKey + 6) % 7);
                else if (encoderFocus === 'scale') setScale(prev => {
                  const keys = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
                  let idx = keys.indexOf(prev);
                  return keys[(idx + 11) % 12];
                });
                else if (encoderFocus === 'sound') setSoundParamIdx(i => (i + soundParams.length - 1) % soundParams.length);
              }}>
                <span className="text-lg font-bold">&#8592;</span>
              </button>
              <button className="w-8 h-8 bg-gray-400 hover:bg-gray-300 rounded-full flex items-center justify-center shadow-2xl border-2 border-gray-500 active:scale-95 transition-transform mb-1" title="Encoder Click" onClick={() => {
                if (screen === 'main') {
                  if (encoderFocus === 'key') setScreen('chord-select');
                  else if (encoderFocus === 'scale') setEncoderFocus('key');
                } else if (screen === 'chord-select') {
                  setScreen('main');
                } else if (screen === 'sound-design') {
                  setEncoderFocus(f => f === 'sound' ? 'key' : 'sound');
                }
              }}>
                <FaRegDotCircle size={18} className="text-indigo-700 animate-pulse" />
              </button>
              <button className="w-8 h-8 bg-gray-400 hover:bg-gray-300 rounded-full flex items-center justify-center shadow-2xl border-2 border-gray-500 active:scale-95 transition-transform" title="Encoder Right" onClick={() => {
                if (encoderFocus === 'key') setSelectedKey((selectedKey + 1) % 7);
                else if (encoderFocus === 'scale') setScale(prev => {
                  const keys = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
                  let idx = keys.indexOf(prev);
                  return keys[(idx + 1) % 12];
                });
                else if (encoderFocus === 'sound') setSoundParamIdx(i => (i + 1) % soundParams.length);
              }}>
                <span className="text-lg font-bold">&#8594;</span>
              </button>
            </div>
          </div>
          {/* Centered Screen fully on synth body, all interactive/status text inside */}
          <div className="flex justify-center w-full mb-1">
            <div className="w-48 h-16 bg-black/90 rounded-md flex flex-col items-center justify-center border-4 border-gray-300 shadow-inner relative mx-2">
              <div className="text-[0.7rem] text-gray-300 absolute top-1 left-2">Chord Synth</div>
              {screen === 'main' && (
                <div className="flex flex-col items-center w-full">
                  {/* Key layout on screen */}
                  <div className="flex justify-center gap-1 mb-1 w-full">
                    {chords.map((chord, idx) => (
                      <div key={idx} className={`flex flex-col items-center w-6 ${selectedKey === idx ? 'bg-yellow-300 rounded-md' : ''}`} style={{padding: '1px'}}>
                        <span className={`text-xs font-bold ${selectedKey === idx ? 'text-black' : 'text-white'}`}>{chord.note}</span>
                        <span className={`text-[0.6rem] ${selectedKey === idx ? 'text-black' : 'text-pink-200'}`}>{chord.type}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white">Key/Scale:</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${encoderFocus === 'scale' ? 'bg-yellow-300 text-black' : 'text-yellow-300'}`}>{scale}</span>
                    <button className="ml-1 px-1 py-0.5 rounded bg-indigo-700 hover:bg-indigo-600 text-xs text-white" onClick={() => setChords(defaultChords)} title="Reset Chords">
                      <FaSyncAlt />
                    </button>
                  </div>
                  <div className="text-[0.7rem] text-pink-200 mt-1">{soundParams.map((param, idx) => `${param.name}: ${params[idx]}`).join(' | ')}</div>
                  <div className="flex gap-2 mt-1">
                    <button className={`text-xs px-2 py-0.5 rounded ${encoderFocus === 'key' ? 'bg-yellow-300 text-black' : 'bg-gray-700 text-white'}`} onClick={() => setEncoderFocus('key')}>Key</button>
                    <button className={`text-xs px-2 py-0.5 rounded ${encoderFocus === 'scale' ? 'bg-yellow-300 text-black' : 'bg-gray-700 text-white'}`} onClick={() => setEncoderFocus('scale')}>Scale</button>
                  </div>
                </div>
              )}
              {screen === 'chord-select' && (
                <div className="flex flex-col items-center w-full">
                  <div className="text-xs text-white mb-1">Select Chord for <span className="text-yellow-300">{chords[selectedKey].note}</span></div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {chordTypes.map(type => (
                      <button key={type} className={`px-2 py-1 rounded text-xs font-bold ${chords[selectedKey].type === type ? 'bg-yellow-300 text-black' : 'bg-gray-700 text-white hover:bg-yellow-200 hover:text-black'}`} onClick={() => { handleChordTypeChange(selectedKey, type); setScreen('main'); }}>{type}</button>
                    ))}
                  </div>
                </div>
              )}
              {screen === 'sound-design' && (
                <div className="flex flex-col items-center w-full">
                  <div className="text-xs text-white mb-1">Sound Design</div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-pink-200 mb-1">{soundParams[soundParamIdx].name}</span>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-0.5 rounded bg-gray-700 text-white text-xs" onClick={() => setParams(p => p.map((v, i) => i === soundParamIdx ? Math.max(0, v - 0.05) : v))}>-</button>
                      <span className="text-xs text-yellow-300 font-bold">{params[soundParamIdx].toFixed(2)}</span>
                      <button className="px-2 py-0.5 rounded bg-gray-700 text-white text-xs" onClick={() => setParams(p => p.map((v, i) => i === soundParamIdx ? Math.min(1, v + 0.05) : v))}>+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 7 Keyboard Keys: 3 on top, 4 on bottom (HiChord style) - navigation only, no text except on screen */}
          <div className="flex flex-col items-center mb-1 mt-1 gap-1">
            <div className="flex gap-1 mb-1">
              {chords.slice(0, 3).map((_, idx) => (
                <button
                  key={idx}
                  className={`w-7 h-7 rounded-lg border-2 shadow font-bold text-xs mb-1 transition-all duration-150 ${selectedKey === idx ? 'bg-yellow-300 border-yellow-500 scale-105' : 'bg-white border-gray-400 hover:bg-yellow-100'}`}
                  style={{boxShadow: selectedKey === idx ? '0 2px 8px #fffa, 0 1px 4px #0006 inset' : '0 1px 4px #0002, 0 1px 2px #fff2 inset'}}
                  onClick={() => setSelectedKey(idx)}
                />
              ))}
            </div>
            <div className="flex gap-1">
              {chords.slice(3).map((_, idx) => (
                <button
                  key={idx+3}
                  className={`w-8 h-10 rounded-lg border-2 shadow font-bold text-xs mb-1 transition-all duration-150 ${selectedKey === idx+3 ? 'bg-yellow-300 border-yellow-500 scale-105' : 'bg-white border-gray-400 hover:bg-yellow-100'}`}
                  style={{boxShadow: selectedKey === idx+3 ? '0 2px 8px #fffa, 0 1px 4px #0006 inset' : '0 1px 4px #0002, 0 1px 2px #fff2 inset'}}
                  onClick={() => setSelectedKey(idx+3)}
                />
              ))}
            </div>
          </div>

          {/* Key/Scale Selector removed from below synth, now only on screen and navigable by encoder */}
        </div>
        {/* Drop shadow for synth body */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[180px] h-6 bg-black/20 rounded-b-2xl blur-2xl z-0" style={{filter:'blur(8px)'}} />
      </div>
    </main>
  );
}
