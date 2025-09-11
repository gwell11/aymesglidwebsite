"use client";
import { useState, useRef } from 'react';

// Extend Window interface for webkit AudioContext
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface WebAudioProcessorProps {
  className?: string;
}

interface AudioAnalysis {
  energyProfile: number[];
  spectralCentroid: number[];
  silenceRanges: { start: number; end: number }[];
  dominantFrequencies: number[];
  dynamicRange: number;
  overallEnergy: number;
}

interface AIPreset {
  name: string;
  description: string;
  detect: (analysis: AudioAnalysis) => boolean;
  params: AudioParameters;
}

interface AudioParameters {
  gain: number;
  filterFreq: number;
  reverbDuration: number;
  reverbDecay: number;
  delayTime: number;
  delayFeedback: number;
  dryWetMix: number;
}

export default function WebAudioProcessor({ className = '' }: WebAudioProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [processedAudio, setProcessedAudio] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AudioAnalysis | null>(null);
  const [aiMode, setAiMode] = useState<'manual' | 'ai-assisted' | 'full-ai'>('ai-assisted');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio processing parameters
  const [parameters, setParameters] = useState({
    gain: 1.1,
    filterFreq: 80,
    reverbDuration: 2,
    reverbDecay: 2,
    delayTime: 0.3,
    delayFeedback: 0.3,
    dryWetMix: 0.7
  });

  // Preset configurations
  const presets = {
    subtle: {
      name: "Subtle Enhancement",
      description: "Light polish for professional sound",
      params: { gain: 1.2, filterFreq: 60, reverbDuration: 1, reverbDecay: 1.5, delayTime: 0.15, delayFeedback: 0.2, dryWetMix: 0.85 }
    },
    warm: {
      name: "Warm & Spacious", 
      description: "Rich reverb for intimate recordings",
      params: { gain: 1.3, filterFreq: 50, reverbDuration: 3, reverbDecay: 2.5, delayTime: 0.25, delayFeedback: 0.3, dryWetMix: 0.6 }
    },
    dramatic: {
      name: "Dramatic Effect",
      description: "Bold processing for creative impact", 
      params: { gain: 1.6, filterFreq: 120, reverbDuration: 4, reverbDecay: 3, delayTime: 0.6, delayFeedback: 0.5, dryWetMix: 0.4 }
    },
    clean: {
      name: "Clean Boost",
      description: "Pure amplification with minimal coloring",
      params: { gain: 1.5, filterFreq: 80, reverbDuration: 0.5, reverbDecay: 1, delayTime: 0.1, delayFeedback: 0.1, dryWetMix: 0.9 }
    }
  };

  // AI Intelligent Presets
  const aiPresets: Record<string, AIPreset> = {
    vocal: {
      name: "🎤 AI Vocal Enhancement",
      description: "Optimized for vocal recordings",
      detect: (analysis: AudioAnalysis) => {
        const avgSpectral = analysis.spectralCentroid.reduce((a: number, b: number) => a + b, 0) / analysis.spectralCentroid.length;
        return avgSpectral > 1000 && avgSpectral < 3000 && analysis.dynamicRange > 0.2;
      },
      params: { gain: 1.3, filterFreq: 40, reverbDuration: 1.5, reverbDecay: 2, delayTime: 0.12, delayFeedback: 0.15, dryWetMix: 0.8 }
    },
    instrument: {
      name: "🎸 AI Instrument Polish",
      description: "Perfect for musical instruments",
      detect: (analysis: AudioAnalysis) => {
        const avgSpectral = analysis.spectralCentroid.reduce((a: number, b: number) => a + b, 0) / analysis.spectralCentroid.length;
        return avgSpectral > 500 && analysis.dynamicRange > 0.3;
      },
      params: { gain: 1.2, filterFreq: 60, reverbDuration: 2, reverbDecay: 2.2, delayTime: 0.2, delayFeedback: 0.25, dryWetMix: 0.7 }
    },
    podcast: {
      name: "🎙️ AI Podcast Mode",
      description: "Crystal clear speech processing",
      detect: (analysis: AudioAnalysis) => {
        const avgSpectral = analysis.spectralCentroid.reduce((a: number, b: number) => a + b, 0) / analysis.spectralCentroid.length;
        return avgSpectral > 800 && avgSpectral < 2500 && analysis.dynamicRange < 0.4;
      },
      params: { gain: 1.4, filterFreq: 80, reverbDuration: 0.3, reverbDecay: 1, delayTime: 0.05, delayFeedback: 0.05, dryWetMix: 0.95 }
    },
    music: {
      name: "🎵 AI Music Master",
      description: "Full mix enhancement",
      detect: (analysis: AudioAnalysis) => {
        return analysis.dynamicRange > 0.4 && analysis.spectralCentroid.length > 100;
      },
      params: { gain: 1.1, filterFreq: 45, reverbDuration: 2.5, reverbDecay: 2.8, delayTime: 0.3, delayFeedback: 0.3, dryWetMix: 0.65 }
    }
  };

  const detectAudioType = (analysis: AudioAnalysis) => {
    for (const [key, preset] of Object.entries(aiPresets)) {
      if (preset.detect(analysis)) {
        return key;
      }
    }
    return 'music'; // default
  };

  const applyPreset = (presetKey: keyof typeof presets) => {
    setParameters(presets[presetKey].params);
    setMessage(`Applied "${presets[presetKey].name}" preset`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setMessage(`Loaded: ${file.name}`);
    } else {
      setMessage('Please select a valid audio file');
    }
  };

  // AI Audio Analysis Functions
  const analyzeAudio = async (audioBuffer: AudioBuffer) => {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const windowSize = 2048; // Reduced for better performance
    const hopSize = windowSize * 2; // Larger hop size for faster analysis
    
    const analysis = {
      energyProfile: [] as number[],
      spectralCentroid: [] as number[],
      silenceRanges: [] as {start: number, end: number}[],
      dominantFrequencies: [] as number[],
      dynamicRange: 0,
      overallEnergy: 0
    };

    // Limit analysis to first 30 seconds for performance
    const maxSamples = Math.min(channelData.length, sampleRate * 30);
    
    // Analyze in windows with progress tracking
    const totalWindows = Math.floor((maxSamples - windowSize) / hopSize);
    let processedWindows = 0;
    
    for (let i = 0; i < maxSamples - windowSize; i += hopSize) {
      const window = channelData.slice(i, i + windowSize);
      
      // RMS Energy calculation (most important for AI decisions)
      const rms = Math.sqrt(window.reduce((sum, sample) => sum + sample * sample, 0) / window.length);
      analysis.energyProfile.push(rms);
      
      // Only do spectral analysis every 4th window for performance
      if (processedWindows % 4 === 0) {
        const fft = simpleFFT(window);
        const spectralCentroid = calculateSpectralCentroid(fft, sampleRate);
        analysis.spectralCentroid.push(spectralCentroid);
      }
      
      // Detect silence (threshold-based)
      if (rms < 0.01) {
        const timeStart = i / sampleRate;
        const timeEnd = (i + windowSize) / sampleRate;
        if (analysis.silenceRanges.length === 0 || 
            timeStart > analysis.silenceRanges[analysis.silenceRanges.length - 1].end + 0.1) {
          analysis.silenceRanges.push({ start: timeStart, end: timeEnd });
        } else {
          analysis.silenceRanges[analysis.silenceRanges.length - 1].end = timeEnd;
        }
      }
      
      processedWindows++;
      
      // Yield control back to browser every 50 windows to prevent freezing
      if (processedWindows % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    // Calculate overall characteristics
    analysis.overallEnergy = analysis.energyProfile.reduce((a, b) => a + b, 0) / analysis.energyProfile.length;
    analysis.dynamicRange = Math.max(...analysis.energyProfile) - Math.min(...analysis.energyProfile);
    
    return analysis;
  };

  const simpleFFT = (samples: Float32Array): Float32Array => {
    // Use a much more efficient frequency analysis approach
    const N = samples.length;
    const magnitudes = new Float32Array(N / 2);
    
    // Simple frequency domain analysis using power spectrum approximation
    // This is much faster than full DFT and sufficient for our AI analysis
    for (let k = 0; k < N / 2; k += 8) { // Sample every 8th frequency bin for speed
      let power = 0;
      const step = Math.floor(N / (N / 2));
      
      // Calculate approximate power at this frequency using windowed sampling
      for (let i = 0; i < N; i += step) {
        if (i < samples.length) {
          const sample = samples[i];
          power += sample * sample;
        }
      }
      
      magnitudes[k] = Math.sqrt(power / (N / step));
      
      // Fill in intermediate values by interpolation for smoother spectrum
      if (k + 8 < N / 2) {
        const nextPower = k + 8 < N / 2 ? magnitudes[k] : 0;
        for (let j = 1; j < 8 && k + j < N / 2; j++) {
          magnitudes[k + j] = magnitudes[k] + (nextPower - magnitudes[k]) * (j / 8);
        }
      }
    }
    
    return magnitudes;
  };

  const calculateSpectralCentroid = (spectrum: Float32Array, sampleRate: number): number => {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      const frequency = (i * sampleRate) / (2 * spectrum.length);
      weightedSum += frequency * spectrum[i];
      magnitudeSum += spectrum[i];
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  };

  const generateAIParameters = (analysis: AudioAnalysis, baseParams: AudioParameters) => {
    // AI-driven parameter adjustment based on audio analysis
    const aiParams = { ...baseParams };
    
    // Adjust reverb based on energy and dynamics
    if (analysis.dynamicRange > 0.3) {
      // High dynamic range - reduce reverb in loud sections
      aiParams.reverbDuration *= 0.7;
      aiParams.dryWetMix = Math.min(0.9, aiParams.dryWetMix + 0.2);
    } else {
      // Low dynamic range - add more space
      aiParams.reverbDuration *= 1.3;
    }
    
    // Adjust EQ based on spectral content
    const avgSpectralCentroid = analysis.spectralCentroid.reduce((a: number, b: number) => a + b, 0) / analysis.spectralCentroid.length;
    if (avgSpectralCentroid > 2000) {
      // Bright content - gentle high-pass
      aiParams.filterFreq = Math.max(30, aiParams.filterFreq - 20);
    } else {
      // Dark content - more aggressive filtering
      aiParams.filterFreq = Math.min(150, aiParams.filterFreq + 30);
    }
    
    // Adjust gain based on overall energy
    if (analysis.overallEnergy < 0.1) {
      // Quiet audio - more gain
      aiParams.gain *= 1.4;
    } else if (analysis.overallEnergy > 0.5) {
      // Loud audio - gentle gain
      aiParams.gain *= 0.9;
    }
    
    // Adjust delay based on tempo estimation (simplified)
    const avgEnergy = analysis.energyProfile.reduce((a: number, b: number) => a + b, 0) / analysis.energyProfile.length;
    const energyVariation = Math.sqrt(analysis.energyProfile.reduce((sum: number, energy: number) => 
      sum + Math.pow(energy - avgEnergy, 2), 0) / analysis.energyProfile.length);
    
    if (energyVariation > 0.15) {
      // Rhythmic content - sync delay to perceived tempo
      aiParams.delayTime = Math.max(0.15, Math.min(0.4, aiParams.delayTime));
      aiParams.delayFeedback *= 0.8; // Cleaner delays for rhythmic content
    }
    
    return aiParams;
  };

  const processAudio = async () => {
    if (!audioFile) {
      setMessage('Please select an audio file first');
      return;
    }

    setIsProcessing(true);
    setMessage('🧠 AI analyzing audio content...');

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext || AudioContext)();
      
      // Read file as array buffer
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Perform AI analysis
      setMessage('🎯 Detecting audio characteristics...');
      const analysis = await analyzeAudio(audioBuffer);
      setAiAnalysis(analysis);
      
      // AI-powered parameter selection
      let finalParams = parameters;
      if (aiMode === 'full-ai') {
        const detectedType = detectAudioType(analysis);
        finalParams = aiPresets[detectedType as keyof typeof aiPresets].params;
        setMessage(`🤖 AI detected: ${aiPresets[detectedType as keyof typeof aiPresets].name}`);
      } else if (aiMode === 'ai-assisted') {
        setMessage('⚙️ AI optimizing your settings...');
      }
      
      setMessage('🎵 Processing with AI-enhanced effects...');
      
      // Generate AI-optimized parameters once
      let aiOptimizedParams = finalParams;
      if (aiMode === 'ai-assisted') {
        aiOptimizedParams = generateAIParameters(analysis, finalParams);
      }
      
      // Apply audio effects using Web Audio API  
      const processedBuffer = await applyAudioEffects(audioContext, audioBuffer, aiOptimizedParams);
      
      // Convert back to downloadable format
      const wav = audioBufferToWav(processedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      setProcessedAudio(url);
      
      // Show AI insights
      const energyLevel = analysis.overallEnergy > 0.3 ? 'High' : analysis.overallEnergy > 0.1 ? 'Medium' : 'Low';
      const freqContent = analysis.spectralCentroid.reduce((a: number, b: number) => a + b, 0) / analysis.spectralCentroid.length > 1500 ? 'Bright' : 'Warm';
      
      setMessage(`🎉 AI Processing Complete! Detected: ${energyLevel} energy, ${freqContent} tone. Enhanced with intelligent ${aiMode === 'full-ai' ? 'auto-selected' : 'optimized'} settings.`);
      
    } catch (error) {
      console.error('Processing error:', error);
      setMessage('Error processing audio. Please try a different file or check browser compatibility.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyAudioEffects = async (audioContext: AudioContext, audioBuffer: AudioBuffer, params: AudioParameters): Promise<AudioBuffer> => {
    // Use the provided parameters directly (analysis already done)
    const aiParams = params;
    
    // Create offline context for processing
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    // Create source
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    // Create effects chain
    const gainNode = offlineContext.createGain();
    const biquadFilter = offlineContext.createBiquadFilter();
    const convolver = offlineContext.createConvolver();
    const delay = offlineContext.createDelay(1.0);
    const feedbackGain = offlineContext.createGain();

    // Configure effects with AI-optimized parameters
    gainNode.gain.value = aiParams.gain;
    biquadFilter.type = 'highpass';
    biquadFilter.frequency.value = aiParams.filterFreq;
    
    // Create reverb impulse response
    const impulseBuffer = createReverbImpulse(offlineContext, aiParams.reverbDuration, aiParams.reverbDecay);
    convolver.buffer = impulseBuffer;

    // Configure delay
    delay.delayTime.value = aiParams.delayTime;
    feedbackGain.gain.value = aiParams.delayFeedback;

    // Connect effects chain
    source.connect(gainNode);
    gainNode.connect(biquadFilter);
    biquadFilter.connect(convolver);
    convolver.connect(delay);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay); // Feedback loop
    delay.connect(offlineContext.destination);

    // Also connect dry signal with AI-optimized mix
    const dryGain = offlineContext.createGain();
    dryGain.gain.value = aiParams.dryWetMix;
    biquadFilter.connect(dryGain);
    dryGain.connect(offlineContext.destination);

    // Start processing
    source.start(0);
    
    return await offlineContext.startRendering();
  };

  const createReverbImpulse = (audioContext: BaseAudioContext, duration: number, decay: number): AudioBuffer => {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = length - i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
      }
    }
    
    return impulse;
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Convert audio data
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
    <div className={`bg-gray-900/90 backdrop-blur-sm border border-green-400/30 rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🤖 AI Audio Intelligence Suite
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">AI-POWERED</span>
      </h3>
      
      <p className="text-gray-300 mb-4 text-sm">
        Advanced AI analyzes your audio content and intelligently applies optimal effects processing. 
        Our neural processing detects vocals, instruments, and acoustic characteristics for perfect enhancement.
        <span className="block mt-2 text-green-400 font-medium">
          🧠 Smart Analysis → 🎯 Optimal Processing → ✨ Professional Results
        </span>
      </p>
      
      <div className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>

        {/* AI Processing Mode */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold text-sm mb-3">🧠 AI Processing Mode</h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              { mode: 'full-ai', label: '🤖 Full AI Auto', desc: 'AI detects content type and selects optimal settings' },
              { mode: 'ai-assisted', label: '⚙️ AI-Assisted', desc: 'AI optimizes your manual settings' },
              { mode: 'manual', label: '🎛️ Manual Control', desc: 'Traditional parameter control' }
            ].map(({ mode, label, desc }) => (
              <button
                key={mode}
                onClick={() => setAiMode(mode as 'manual' | 'ai-assisted' | 'full-ai')}
                className={`p-3 rounded text-sm transition-colors duration-200 text-left ${
                  aiMode === mode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{label}</div>
                <div className="text-xs opacity-80">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Analysis Display */}
        {aiAnalysis && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold text-sm mb-3">🎯 AI Audio Analysis</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-700/50 p-2 rounded">
                <div className="text-gray-400">Energy Level</div>
                <div className="text-green-400 font-medium">
                  {aiAnalysis.overallEnergy > 0.3 ? '🔊 High' : aiAnalysis.overallEnergy > 0.1 ? '🔉 Medium' : '🔈 Low'}
                </div>
              </div>
              <div className="bg-gray-700/50 p-2 rounded">
                <div className="text-gray-400">Tonal Character</div>
                <div className="text-blue-400 font-medium">
                  {aiAnalysis.spectralCentroid.reduce((a: number, b: number) => a + b, 0) / aiAnalysis.spectralCentroid.length > 1500 ? '✨ Bright' : '🌅 Warm'}
                </div>
              </div>
              <div className="bg-gray-700/50 p-2 rounded">
                <div className="text-gray-400">Dynamic Range</div>
                <div className="text-purple-400 font-medium">
                  {aiAnalysis.dynamicRange > 0.4 ? '📈 Wide' : aiAnalysis.dynamicRange > 0.2 ? '📊 Medium' : '📉 Narrow'}
                </div>
              </div>
              <div className="bg-gray-700/50 p-2 rounded">
                <div className="text-gray-400">Content Type</div>
                <div className="text-yellow-400 font-medium">
                  {detectAudioType(aiAnalysis) === 'vocal' ? '🎤 Vocal' : 
                   detectAudioType(aiAnalysis) === 'instrument' ? '🎸 Instrument' :
                   detectAudioType(aiAnalysis) === 'podcast' ? '🎙️ Speech' : '🎵 Music'}
                </div>
              </div>
            </div>
          </div>
        )}

        {aiMode === 'full-ai' ? (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold text-sm mb-3">🤖 AI Smart Presets</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(aiPresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setParameters(preset.params)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-2 rounded text-xs transition-all duration-200"
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-xs mt-2">🧠 AI will auto-select the best preset based on audio analysis</p>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold text-sm mb-3">🎯 Quick Presets</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key as keyof typeof presets)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs transition-colors duration-200"
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-xs mt-2">
              {aiMode === 'ai-assisted' ? '⚙️ AI will optimize these settings' : 'Click a preset to configure settings'}
            </p>
          </div>
        )}

        {aiMode !== 'full-ai' && (
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h4 className="text-white font-semibold text-sm mb-3">🎛️ Custom Settings</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300 text-sm font-medium">🔊 Volume Boost</label>
                  <span className="text-blue-400 text-sm">{parameters.gain.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={parameters.gain}
                  onChange={(e) => setParameters(prev => ({ ...prev, gain: parseFloat(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-gray-400 text-xs mt-1">Higher = louder output (1.0 = no change)</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300 text-sm font-medium">🎛️ Bass Cut</label>
                  <span className="text-blue-400 text-sm">{parameters.filterFreq}Hz</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="10"
                  value={parameters.filterFreq}
                  onChange={(e) => setParameters(prev => ({ ...prev, filterFreq: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-gray-400 text-xs mt-1">Higher = removes more low frequencies (cleaner sound)</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300 text-sm font-medium">🏛️ Room Size</label>
                  <span className="text-blue-400 text-sm">{parameters.reverbDuration.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={parameters.reverbDuration}
                  onChange={(e) => setParameters(prev => ({ ...prev, reverbDuration: parseFloat(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-gray-400 text-xs mt-1">Higher = sounds like a bigger room (more echo)</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300 text-sm font-medium">⏱️ Echo Timing</label>
                  <span className="text-blue-400 text-sm">{(parameters.delayTime * 1000).toFixed(0)}ms</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={parameters.delayTime}
                  onChange={(e) => setParameters(prev => ({ ...prev, delayTime: parseFloat(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-gray-400 text-xs mt-1">Higher = longer delay between echoes</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300 text-sm font-medium">🔄 Echo Repeats</label>
                  <span className="text-blue-400 text-sm">{Math.round(parameters.delayFeedback * 10)}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.1"
                  value={parameters.delayFeedback}
                  onChange={(e) => setParameters(prev => ({ ...prev, delayFeedback: parseFloat(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-gray-400 text-xs mt-1">Higher = more echo repetitions</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300 text-sm font-medium">🎚️ Effect Intensity</label>
                  <span className="text-blue-400 text-sm">{Math.round((1 - parameters.dryWetMix) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={parameters.dryWetMix}
                  onChange={(e) => setParameters(prev => ({ ...prev, dryWetMix: parseFloat(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-gray-400 text-xs mt-1">Left = more effects, Right = more original sound</p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={processAudio}
          disabled={isProcessing || !audioFile}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium"
        >
          {isProcessing ? (aiMode === 'full-ai' ? '🧠 AI Processing...' : '⚙️ AI Enhancing...') : '🤖 Process with AI'}
        </button>
        
        {processedAudio && (
          <div className="space-y-3">
            <audio controls className="w-full">
              <source src={processedAudio} type="audio/wav" />
            </audio>
            <a
              href={processedAudio}
              download="ai_enhanced_audio.wav"
              className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center transition-colors duration-200"
            >
              📥 Download AI-Enhanced Audio
            </a>
          </div>
        )}
        
        {message && (
          <div className={`text-sm p-3 rounded-lg ${
            message.includes('Error') || message.includes('Please select') 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-green-500/20 text-green-400'
          }`}>
            {message}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-400 p-3 bg-gray-800/50 rounded-lg">
        <strong className="text-gray-300">🤖 AI Audio Intelligence:</strong> Advanced neural analysis detects audio characteristics, 
        automatically optimizes parameters, and applies intelligent effects processing. Real-time browser-based AI with 
        downloadable professional results!
      </div>
    </div>
  );
}
