"use client";
import React, { useState, useRef, useEffect } from 'react';

interface AudioParameters {
  gain: number;          // input drive (linear)
  reverbSize: number;    // reverb tail length in seconds
  reverbDecay: number;   // tail decay shape (higher = shorter/tighter)
  delayTime: number;     // delay time in seconds
  delayFeedback: number; // delay feedback (0..0.95)
  mix: number;           // wet amount (0 = dry, 1 = fully wet)
}

interface EffectPreset {
  name: string;
  description: string;
  params: AudioParameters;
}

export default function SimpleAudioProcessor({ className = "" }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [compareOriginal, setCompareOriginal] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  const [parameters, setParameters] = useState<AudioParameters>({
    gain: 1.0,
    reverbSize: 2.0,
    reverbDecay: 2.0,
    delayTime: 0.25,
    delayFeedback: 0.3,
    mix: 0.35,
  });

  const presets: EffectPreset[] = [
    {
      name: "🎤 Vocal",
      description: "Tight plate-style space",
      params: { gain: 1.0, reverbSize: 1.4, reverbDecay: 2.4, delayTime: 0.18, delayFeedback: 0.18, mix: 0.28 },
    },
    {
      name: "🎸 Instrument",
      description: "Warm room with slap-back",
      params: { gain: 1.0, reverbSize: 2.0, reverbDecay: 2.0, delayTime: 0.22, delayFeedback: 0.28, mix: 0.34 },
    },
    {
      name: "🎙️ Podcast",
      description: "Dry & clear, barely-there air",
      params: { gain: 1.1, reverbSize: 0.5, reverbDecay: 3.2, delayTime: 0.1, delayFeedback: 0.05, mix: 0.12 },
    },
    {
      name: "🌌 Ambient",
      description: "Long, lush, washed-out",
      params: { gain: 0.95, reverbSize: 3.6, reverbDecay: 1.3, delayTime: 0.4, delayFeedback: 0.45, mix: 0.55 },
    },
  ];

  // Clean up any object URLs on unmount.
  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const trackUrl = (url: string) => {
    urlsRef.current.push(url);
    return url;
  };

  // Stereo-decorrelated reverb impulse response with a smooth exponential
  // decay. Independent noise per channel gives the tail real stereo width;
  // the convolver's built-in normalization keeps loudness consistent.
  const createReverbImpulse = (ctx: BaseAudioContext, duration: number, decay: number): AudioBuffer => {
    const rate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(rate * duration));
    const impulse = ctx.createBuffer(2, length, rate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      // One-pole smoothing makes the noise less "gritty" (a touch of damping).
      let last = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, decay);
        const noise = Math.random() * 2 - 1;
        last = 0.6 * last + 0.4 * noise; // gentle lowpass on the noise
        data[i] = last * env;
      }
    }
    return impulse;
  };

  // Build and render the full effects chain offline.
  const applyAudioEffects = async (audioBuffer: AudioBuffer, params: AudioParameters): Promise<AudioBuffer> => {
    const rate = audioBuffer.sampleRate;
    // Extend the render so reverb + delay tails ring out instead of being cut.
    const tailSeconds = params.reverbSize + params.delayTime * 12 + 0.5;
    const renderLength = audioBuffer.length + Math.ceil(tailSeconds * rate);

    const ctx = new OfflineAudioContext(2, renderLength, rate);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const input = ctx.createGain();
    input.gain.value = params.gain;

    // --- Dry / wet busses with an equal-power crossfade ---
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    const wetBus = ctx.createGain(); // effects sum here before the wet level
    const theta = params.mix * 0.5 * Math.PI;
    dry.gain.value = Math.cos(theta);
    wet.gain.value = Math.sin(theta);

    // --- Reverb ---
    const convolver = ctx.createConvolver();
    convolver.buffer = createReverbImpulse(ctx, params.reverbSize, params.reverbDecay);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.9;

    // --- Delay with feedback ---
    const delay = ctx.createDelay(2.0);
    delay.delayTime.value = params.delayTime;
    const feedback = ctx.createGain();
    feedback.gain.value = Math.min(params.delayFeedback, 0.92);
    // Tame the high end inside the feedback loop so repeats darken naturally.
    const fbDamp = ctx.createBiquadFilter();
    fbDamp.type = 'lowpass';
    fbDamp.frequency.value = 6000;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.5;

    // Gentle lowpass on the whole wet bus for warmth (no harsh fizzy tail).
    const wetDamp = ctx.createBiquadFilter();
    wetDamp.type = 'lowpass';
    wetDamp.frequency.value = 9000;

    // --- Wiring ---
    source.connect(input);

    // Dry path
    input.connect(dry);
    dry.connect(ctx.destination);

    // Reverb path -> wet bus
    input.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(wetBus);

    // Delay path (with feedback loop) -> wet bus
    input.connect(delay);
    delay.connect(fbDamp);
    fbDamp.connect(feedback);
    feedback.connect(delay); // feedback loop
    fbDamp.connect(delayGain);
    delayGain.connect(wetBus);

    // Wet bus -> damping -> wet level -> out
    wetBus.connect(wetDamp);
    wetDamp.connect(wet);
    wet.connect(ctx.destination);

    source.start(0);
    const rendered = await ctx.startRendering();
    normalizePeak(rendered, 0.97); // guarantee no clipping
    return rendered;
  };

  // Scale the buffer down so its peak sits just below full scale. Only ever
  // attenuates — never boosts the noise floor.
  const normalizePeak = (buffer: AudioBuffer, target: number) => {
    let peak = 0;
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < data.length; i++) {
        const a = Math.abs(data[i]);
        if (a > peak) peak = a;
      }
    }
    if (peak > target && peak > 0) {
      const scale = target / peak;
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const data = buffer.getChannelData(c);
        for (let i = 0; i < data.length; i++) data[i] *= scale;
      }
    }
  };

  // Generate a short demo phrase (a little arpeggiated chord) so the processor
  // can be tried instantly with no upload.
  const generateDemoBuffer = async (): Promise<AudioBuffer> => {
    const rate = 44100;
    const seconds = 2.4;
    const ctx = new OfflineAudioContext(2, Math.ceil(rate * seconds), rate);
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    // C major-ish arpeggio
    const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63];
    notes.forEach((freq, i) => {
      const t0 = i * 0.32;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime(0.9, t0 + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.55);
      osc.connect(env);
      env.connect(master);
      osc.start(t0);
      osc.stop(t0 + 0.6);
    });

    return ctx.startRendering();
  };

  const decodeFile = async (file: File): Promise<AudioBuffer> => {
    const arrayBuffer = await file.arrayBuffer();
    const ctx = new AudioContext();
    try {
      return await ctx.decodeAudioData(arrayBuffer);
    } finally {
      ctx.close();
    }
  };

  const runProcessing = async (audioBuffer: AudioBuffer, label: string) => {
    setIsProcessing(true);
    setMessage(`Processing ${label}…`);
    setProcessedUrl(null);
    setCompareOriginal(false);

    try {
      // Encode the (untouched) original for A/B comparison.
      const originalWav = audioBufferToWav(audioBuffer);
      setOriginalUrl(trackUrl(URL.createObjectURL(new Blob([originalWav], { type: 'audio/wav' }))));

      const processed = await applyAudioEffects(audioBuffer, parameters);
      const wav = audioBufferToWav(processed);
      setProcessedUrl(trackUrl(URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }))));
      setMessage('✅ Done — A/B against the original below, or download the result.');
    } catch (err) {
      setMessage('❌ Could not process that audio. Try a WAV/MP3 file.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await decodeFile(file);
      await runProcessing(buffer, file.name);
    } catch (err) {
      setMessage('❌ Could not read that file. Try a WAV or MP3.');
      console.error(err);
    }
  };

  const handleDemo = async () => {
    setIsProcessing(true);
    setMessage('Generating demo sound…');
    try {
      const buffer = await generateDemoBuffer();
      await runProcessing(buffer, 'demo sound');
    } catch (err) {
      setMessage('❌ Demo generation failed.');
      console.error(err);
      setIsProcessing(false);
    }
  };

  // 16-bit PCM WAV encoder.
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;

    const arrayBuffer = new ArrayBuffer(44 + length * blockAlign);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * blockAlign, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 8 * bytesPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, length * blockAlign, true);

    const channels: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let c = 0; c < numChannels; c++) {
        const s = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }
    return arrayBuffer;
  };

  const setParam = (key: keyof AudioParameters, value: number) =>
    setParameters((p) => ({ ...p, [key]: value }));

  const activeUrl = compareOriginal ? originalUrl : processedUrl;

  return (
    <div className={`bg-gray-900/90 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2 flex-wrap">
        🎵 Audio Effects Processor
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">REVERB · DELAY</span>
      </h3>
      <p className="text-gray-400 mb-4 text-sm">
        Runs entirely in your browser with the Web Audio API — convolution reverb, a feedback delay,
        and peak-normalized output (so it never clips). Upload a clip or try the built-in demo.
      </p>

      <div className="space-y-4">
        {/* Source */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
          />
          <button
            onClick={handleDemo}
            disabled={isProcessing}
            className="px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            ▶ Try demo sound
          </button>
        </div>

        {/* Presets */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold text-sm mb-3">Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setParameters(preset.params)}
                disabled={isProcessing}
                className="p-3 rounded text-sm text-left bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs opacity-70">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Controls */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold text-sm mb-3">Controls</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Slider label="Input Gain" value={parameters.gain} min={0.5} max={2} step={0.05}
              display={`${parameters.gain.toFixed(2)}×`} disabled={isProcessing}
              onChange={(v) => setParam('gain', v)} />
            <Slider label="Mix (wet)" value={parameters.mix} min={0} max={1} step={0.01}
              display={`${Math.round(parameters.mix * 100)}%`} disabled={isProcessing}
              onChange={(v) => setParam('mix', v)} />
            <Slider label="Reverb Size" value={parameters.reverbSize} min={0.2} max={5} step={0.1}
              display={`${parameters.reverbSize.toFixed(1)} s`} disabled={isProcessing}
              onChange={(v) => setParam('reverbSize', v)} />
            <Slider label="Reverb Decay" value={parameters.reverbDecay} min={0.5} max={4} step={0.1}
              display={`${parameters.reverbDecay.toFixed(1)}`} disabled={isProcessing}
              onChange={(v) => setParam('reverbDecay', v)} />
            <Slider label="Delay Time" value={parameters.delayTime} min={0.02} max={1} step={0.01}
              display={`${Math.round(parameters.delayTime * 1000)} ms`} disabled={isProcessing}
              onChange={(v) => setParam('delayTime', v)} />
            <Slider label="Delay Feedback" value={parameters.delayFeedback} min={0} max={0.92} step={0.01}
              display={`${Math.round(parameters.delayFeedback * 100)}%`} disabled={isProcessing}
              onChange={(v) => setParam('delayFeedback', v)} />
          </div>
        </div>

        {/* Status */}
        {message && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-sm text-gray-300">{message}</p>
          </div>
        )}

        {/* Result + A/B */}
        {processedUrl && !isProcessing && (
          <div className="bg-green-900/15 border border-green-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h4 className="text-green-400 font-semibold">Result</h4>
              {originalUrl && (
                <div className="inline-flex rounded-md overflow-hidden border border-gray-600 text-xs">
                  <button
                    onClick={() => setCompareOriginal(false)}
                    className={`px-3 py-1.5 transition-colors ${!compareOriginal ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    Processed
                  </button>
                  <button
                    onClick={() => setCompareOriginal(true)}
                    className={`px-3 py-1.5 transition-colors ${compareOriginal ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    Original
                  </button>
                </div>
              )}
            </div>
            <audio key={activeUrl ?? ''} controls className="w-full mb-3" src={activeUrl ?? undefined} />
            <a
              href={processedUrl}
              download="processed_audio.wav"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              📥 Download processed WAV
            </a>
          </div>
        )}

        {/* Spinner */}
        {isProcessing && (
          <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-blue-400 text-sm">{message || 'Processing…'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  disabled: boolean;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, display, disabled, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-xs text-gray-400">{label}</label>
        <span className="text-xs text-blue-400 tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}
