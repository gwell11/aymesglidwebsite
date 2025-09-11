"use client";
import React, { useState, useRef } from 'react';

interface AudioParameters {
  gain: number;
  reverbDuration: number;
  reverbDecay: number;
  delayTime: number;
  delayFeedback: number;
  dryWetMix: number;
}

interface EffectPreset {
  name: string;
  description: string;
  params: AudioParameters;
}

export default function SimpleAudioProcessor({ className = "" }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [parameters, setParameters] = useState<AudioParameters>({
    gain: 1.1,
    reverbDuration: 2,
    reverbDecay: 2,
    delayTime: 0.2,
    delayFeedback: 0.3,
    dryWetMix: 0.7
  });

  // Simple presets - no "AI" nonsense, just good settings
  const presets: EffectPreset[] = [
    {
      name: "🎤 Vocal",
      description: "Clear vocal processing with subtle reverb",
      params: { gain: 1.2, reverbDuration: 1.5, reverbDecay: 2, delayTime: 0.12, delayFeedback: 0.15, dryWetMix: 0.8 }
    },
    {
      name: "🎸 Instrument",
      description: "Warm instrument enhancement",
      params: { gain: 1.2, reverbDuration: 2, reverbDecay: 2.2, delayTime: 0.2, delayFeedback: 0.25, dryWetMix: 0.7 }
    },
    {
      name: "🎙️ Podcast",
      description: "Clean speech with minimal reverb",
      params: { gain: 1.4, reverbDuration: 0.3, reverbDecay: 1, delayTime: 0.05, delayFeedback: 0.05, dryWetMix: 0.95 }
    },
    {
      name: "🎵 Ambient",
      description: "Spacious atmospheric processing",
      params: { gain: 1.1, reverbDuration: 2.5, reverbDecay: 2.8, delayTime: 0.3, delayFeedback: 0.3, dryWetMix: 0.65 }
    }
  ];

  // Create reverb impulse response
  const createReverbImpulse = (context: OfflineAudioContext, duration: number, decay: number): AudioBuffer => {
    const length = context.sampleRate * duration;
    const impulse = context.createBuffer(2, length, context.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = length - i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
      }
    }
    return impulse;
  };

  // Apply audio effects
  const applyAudioEffects = async (audioContext: AudioContext, audioBuffer: AudioBuffer, params: AudioParameters): Promise<AudioBuffer> => {
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    // Create audio nodes
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = offlineContext.createGain();
    const convolver = offlineContext.createConvolver();
    const delay = offlineContext.createDelay(1.0);
    const feedbackGain = offlineContext.createGain();

    // Configure effects
    gainNode.gain.value = params.gain;
    
    // Create and set reverb
    const impulseBuffer = createReverbImpulse(offlineContext, params.reverbDuration, params.reverbDecay);
    convolver.buffer = impulseBuffer;

    // Configure delay
    delay.delayTime.value = params.delayTime;
    feedbackGain.gain.value = params.delayFeedback;

    // Connect effects chain
    const dryGain = offlineContext.createGain();
    const wetGain = offlineContext.createGain();

    // Dry signal
    source.connect(gainNode);
    gainNode.connect(dryGain);
    dryGain.connect(offlineContext.destination);
    dryGain.gain.value = params.dryWetMix;

    // Wet signal with reverb
    gainNode.connect(convolver);
    convolver.connect(wetGain);

    // Wet signal with delay
    gainNode.connect(delay);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay); // Feedback loop
    delay.connect(wetGain);

    wetGain.connect(offlineContext.destination);
    wetGain.gain.value = 1 - params.dryWetMix;

    source.start(0);
    return await offlineContext.startRendering();
  };

  // Handle file upload and processing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setMessage('Processing audio...');
    setProcessedAudioUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const processedBuffer = await applyAudioEffects(audioContext, audioBuffer, parameters);

      // Convert to WAV
      const wavBuffer = audioBufferToWav(processedBuffer);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      setProcessedAudioUrl(url);
      setMessage('✅ Processing complete! Download your enhanced audio below.');
    } catch (error) {
      setMessage('❌ Error processing audio. Please try a different file.');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert AudioBuffer to WAV
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;

    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * bytesPerSample);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // WAV header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * bytesPerSample, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
    view.setUint16(32, numberOfChannels * bytesPerSample, true);
    view.setUint16(34, 8 * bytesPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * bytesPerSample, true);

    // Audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  return (
    <div className={`bg-gray-900/90 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🎵 Audio Effects Processor
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">REVERB + DELAY</span>
      </h3>
      
      <p className="text-gray-300 mb-4 text-sm">
        Simple audio effects processor that adds reverb and delay to your audio files. 
        Choose from different presets or adjust parameters manually for the sound you want.
        <span className="block mt-2 text-blue-400 font-medium">
          🎵 Upload Audio → 🎛️ Choose Settings → ✨ Download Result
        </span>
      </p>
      
      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
          />
        </div>

        {/* Presets */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold text-sm mb-3">🎛️ Effect Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setParameters(preset.params)}
                disabled={isProcessing}
                className="p-3 rounded text-sm transition-colors duration-200 text-left bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs opacity-80">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Controls */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold text-sm mb-3">🎚️ Manual Controls</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Gain</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={parameters.gain}
                onChange={(e) => setParameters({...parameters, gain: Number(e.target.value)})}
                disabled={isProcessing}
                className="w-full"
              />
              <span className="text-xs text-blue-400">{parameters.gain}x</span>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Reverb Duration</label>
              <input
                type="range"
                min="0.1"
                max="4"
                step="0.1"
                value={parameters.reverbDuration}
                onChange={(e) => setParameters({...parameters, reverbDuration: Number(e.target.value)})}
                disabled={isProcessing}
                className="w-full"
              />
              <span className="text-xs text-blue-400">{parameters.reverbDuration}s</span>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Delay Time</label>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={parameters.delayTime}
                onChange={(e) => setParameters({...parameters, delayTime: Number(e.target.value)})}
                disabled={isProcessing}
                className="w-full"
              />
              <span className="text-xs text-blue-400">{parameters.delayTime}s</span>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Dry/Wet Mix</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parameters.dryWetMix}
                onChange={(e) => setParameters({...parameters, dryWetMix: Number(e.target.value)})}
                disabled={isProcessing}
                className="w-full"
              />
              <span className="text-xs text-blue-400">{Math.round(parameters.dryWetMix * 100)}% dry</span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-sm text-gray-300">{message}</p>
          </div>
        )}

        {/* Download */}
        {processedAudioUrl && (
          <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">✅ Processing Complete!</h4>
            <audio controls className="w-full mb-3" src={processedAudioUrl} />
            <a
              href={processedAudioUrl}
              download="processed_audio.wav"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-200"
            >
              📥 Download Enhanced Audio
            </a>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-blue-400 text-sm">Processing your audio...</p>
          </div>
        )}
      </div>
    </div>
  );
}
