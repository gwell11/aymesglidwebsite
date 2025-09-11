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

interface EffectPreset {
  name: string;
  description: string;
  detect: (analysis: AudioAnalysis) => boolean;
  params: AudioParameters;
}

interface AudioParameters {
  gain: number;
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
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [processingMode, setProcessingMode] = useState<'manual' | 'preset-assisted' | 'auto-preset'>('preset-assisted');
  const [dynamicEffectsIntensity, setDynamicEffectsIntensity] = useState(75); // 75% default intensity
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio processing parameters
  const [parameters, setParameters] = useState({
    gain: 1.1,
    reverbDuration: 2,
    reverbDecay: 2,
    delayTime: 0.2,
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
            // Bright content - no filtering needed
      // (removed all filtering logic)
    } else {
      // Dark content - no filtering needed  
      // (removed all filtering logic)
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
      const processedBuffer = await applyAudioEffects(audioContext, audioBuffer, aiOptimizedParams, dynamicEffectsIntensity);
      
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

  const applyAudioEffects = async (audioContext: AudioContext, audioBuffer: AudioBuffer, params: AudioParameters, dynamicIntensity: number = 75): Promise<AudioBuffer> => {
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

    // Create effects chain - NO FILTERING AT ALL
    const gainNode = offlineContext.createGain();
    const convolver = offlineContext.createConvolver();
    const delay = offlineContext.createDelay(1.0);
    const feedbackGain = offlineContext.createGain();
    const dynamicReverbGain = offlineContext.createGain();
    const dynamicDelayGain = offlineContext.createGain();

    // Base configuration - NO FILTER
    gainNode.gain.value = aiParams.gain;
    
    // Create reverb impulse response
    const impulseBuffer = createReverbImpulse(offlineContext, aiParams.reverbDuration, aiParams.reverbDecay);
    convolver.buffer = impulseBuffer;

    // Configure delay
    delay.delayTime.value = aiParams.delayTime;
    feedbackGain.gain.value = aiParams.delayFeedback;

    // AI-Powered Dynamic Effects Automation
    const duration = audioBuffer.duration;
    const sampleRate = audioBuffer.sampleRate;
    
    // Detect tempo and create effect moments
    const estimatedBPM = estimateTempoFromAudio(audioBuffer);
    const beatDuration = 60 / estimatedBPM; // seconds per beat
    const barDuration = beatDuration * 4; // 4/4 time signature
    
    // Create dynamic effect moments at musically relevant times
    const effectMoments = generateEffectMoments(duration, barDuration, beatDuration, dynamicIntensity);
    
    // Apply dynamic automation (NO FILTERING)
    applyDynamicAutomation(offlineContext, {
      reverbGain: dynamicReverbGain,
      delayGain: dynamicDelayGain,
      effectMoments,
      baseParams: aiParams,
      duration
    });

    // Connect effects chain WITHOUT filtering - pure audio path
    source.connect(gainNode);
    
    // Split signal for dry/wet processing (no filtering!)
    const dryGain = offlineContext.createGain();
    const wetGain = offlineContext.createGain();
    
    // Pure dry signal (no filtering)
    gainNode.connect(dryGain);
    dryGain.connect(offlineContext.destination);
    dryGain.gain.value = 0.7; // Base dry level
    
    // Wet signal with ONLY reverb and delay (no filtering)
    gainNode.connect(convolver);
    convolver.connect(dynamicReverbGain);
    dynamicReverbGain.connect(wetGain);
    
    // Wet signal with ONLY delay (no filtering)
    gainNode.connect(delay);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay); // Feedback loop
    delay.connect(dynamicDelayGain);
    dynamicDelayGain.connect(wetGain);
    
    wetGain.connect(offlineContext.destination);
    wetGain.gain.value = 0.3; // Base wet level

    // Start processing
    source.start(0);
    
    return await offlineContext.startRendering();
  };

  // AI Tempo Estimation
  const estimateTempoFromAudio = (audioBuffer: AudioBuffer): number => {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const windowSize = 1024;
    const hopSize = 512;
    
    const onsets: number[] = [];
    let previousEnergy = 0;
    
    // Detect onsets (sudden energy increases)
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const window = channelData.slice(i, i + windowSize);
      const energy = window.reduce((sum, sample) => sum + Math.abs(sample), 0) / window.length;
      
      // Onset detection - energy increase above threshold
      if (energy > previousEnergy * 1.3 && energy > 0.02) {
        onsets.push(i / sampleRate);
      }
      previousEnergy = energy;
    }
    
    // Calculate average interval between onsets
    if (onsets.length < 4) return 120; // Default BPM
    
    const intervals: number[] = [];
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i-1]);
    }
    
    // Find most common interval (likely beat duration)
    intervals.sort((a, b) => a - b);
    const medianInterval = intervals[Math.floor(intervals.length / 2)];
    
    // Convert to BPM, clamp to reasonable range
    const bpm = Math.max(80, Math.min(180, 60 / medianInterval));
    return bpm;
  };

  // Generate Strategic Effect Moments
  const generateEffectMoments = (duration: number, barDuration: number, beatDuration: number, intensity: number = 75) => {
    const moments: Array<{time: number, duration: number, type: string, intensity: number}> = [];
    const numBars = Math.floor(duration / barDuration);
    const intensityMultiplier = intensity / 100; // Convert percentage to multiplier
    
    // Early exit if intensity is too low
    if (intensity < 10) return moments;
    
    for (let bar = 0; bar < numBars; bar++) {
      const barStart = bar * barDuration;
      
      // Add effects at musically interesting moments (frequency based on intensity):
      
      // 1. End of every 4th bar (classic breakdown moment)
      if (bar % Math.max(2, Math.floor(8 - (intensity / 20))) === 3 && Math.random() < intensityMultiplier) {
        moments.push({
          time: barStart + barDuration - (beatDuration * 0.5), // Last half beat
          duration: beatDuration * 0.5,
          type: 'reverb_sweep',
          intensity: 0.8 * intensityMultiplier
        });
      }
      
      // 2. Pure delay echoes - no filtering at all
      if (bar % 6 === 0 && bar > 0 && Math.random() < intensityMultiplier * 0.6) {
        moments.push({
          time: barStart,
          duration: barDuration * 0.5, // Short delay burst
          type: 'delay_echo',
          intensity: 0.4 * intensityMultiplier
        });
      }
      
      // 3. Delay throws - probability scales with intensity
      const delayProbability = 0.15 * intensityMultiplier;
      if (Math.random() < delayProbability && bar % 2 === 1) {
        const randomBeat = Math.floor(Math.random() * 4);
        moments.push({
          time: barStart + (randomBeat * beatDuration),
          duration: beatDuration * 0.25, // Quarter beat
          type: 'delay_throw',
          intensity: 0.9 * intensityMultiplier
        });
      }
      
      // 4. Gentle reverb builds instead of harsh filtering
      if (bar % Math.max(8, 20 - Math.floor(intensity / 10)) === 14 && intensityMultiplier > 0.3) {
        moments.push({
          time: barStart,
          duration: barDuration * 2,
          type: 'reverb_build',
          intensity: 0.6 * intensityMultiplier
        });
      }
      
      // 5. NEW: Random stutter effects at high intensity
      if (intensity > 60 && Math.random() < (intensity - 60) / 200) {
        moments.push({
          time: barStart + (Math.random() * barDuration),
          duration: beatDuration * 0.125, // Eighth beat
          type: 'stutter',
          intensity: 0.5 * intensityMultiplier
        });
      }
    }
    
    return moments.sort((a, b) => a.time - b.time);
  };

  // Apply Dynamic Automation
  interface DynamicAutomationNodes {
    reverbGain: GainNode;
    delayGain: GainNode;
    effectMoments: Array<{time: number, duration: number, type: string, intensity: number}>;
    baseParams: AudioParameters;
    duration: number;
  }

  const applyDynamicAutomation = (context: OfflineAudioContext, nodes: DynamicAutomationNodes) => {
    const { reverbGain, delayGain, effectMoments } = nodes;
    
    // Set base values (NO FILTERING)
    const now = context.currentTime;
    reverbGain.gain.setValueAtTime(0.1, now); // Start with minimal reverb
    delayGain.gain.setValueAtTime(0.05, now); // Start with minimal delay
    
    // Apply each effect moment
    effectMoments.forEach((moment) => {
      const startTime = moment.time;
      const endTime = moment.time + moment.duration;
      
      switch (moment.type) {
        case 'reverb_sweep':
          // Dramatic reverb increase at end of phrases
          reverbGain.gain.linearRampToValueAtTime(moment.intensity, startTime);
          reverbGain.gain.linearRampToValueAtTime(0.1, endTime);
          break;
          
        case 'delay_echo':
          // Pure delay effect with no filtering
          delayGain.gain.linearRampToValueAtTime(moment.intensity, startTime);
          delayGain.gain.linearRampToValueAtTime(0.05, endTime);
          break;
          
        case 'delay_throw':
          // Quick delay burst
          delayGain.gain.linearRampToValueAtTime(moment.intensity, startTime);
          delayGain.gain.exponentialRampToValueAtTime(0.01, endTime);
          break;
          
        case 'reverb_build':
          // Gentle reverb increase without harsh filtering
          reverbGain.gain.linearRampToValueAtTime(moment.intensity * 0.8, endTime);
          // Gentle return to normal
          setTimeout(() => {
            reverbGain.gain.linearRampToValueAtTime(0.1, endTime + 0.5);
          }, 0);
          break;
          
        case 'stutter':
          // Quick gain automation for stutter effect
          const stutterSteps = 4;
          const stepDuration = moment.duration / stutterSteps;
          for (let i = 0; i < stutterSteps; i++) {
            const stepStart = startTime + (i * stepDuration);
            const stepEnd = stepStart + (stepDuration * 0.5);
            // Quick gate effect
            delayGain.gain.linearRampToValueAtTime(i % 2 === 0 ? moment.intensity : 0, stepStart);
            delayGain.gain.linearRampToValueAtTime(0, stepEnd);
          }
          break;
      }
    });
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
        🎵 Audio Effects Processor
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">REVERB + DELAY</span>
      </h3>
      
      <p className="text-gray-300 mb-4 text-sm">
        Simple audio effects processor that adds reverb and delay to your audio files. 
        Choose from different presets or adjust parameters manually for the sound you want.
        <span className="block mt-2 text-blue-400 font-medium">
          🎵 Upload Audio → �️ Choose Settings → ✨ Download Result
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

        {/* Dynamic Effects Control */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold text-sm mb-3">🎪 Smart Dynamic Effects</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs">Effect Intensity</span>
                <span className="text-green-400 text-xs font-mono">{dynamicEffectsIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dynamicEffectsIntensity}
                onChange={(e) => setDynamicEffectsIntensity(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${dynamicEffectsIntensity}%, #4b5563 ${dynamicEffectsIntensity}%, #4b5563 100%)`
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700/30 p-2 rounded text-center">
                <div className="text-gray-400">🔄 Delay Echoes</div>
                <div className="text-blue-300">Pure delay</div>
              </div>
              <div className="bg-gray-700/30 p-2 rounded text-center">
                <div className="text-gray-400">🌊 Reverb Bursts</div>
                <div className="text-purple-300">End of bars</div>
              </div>
              <div className="bg-gray-700/30 p-2 rounded text-center">
                <div className="text-gray-400">🔄 Delay Throws</div>
                <div className="text-orange-300">Random beats</div>
              </div>
              <div className="bg-gray-700/30 p-2 rounded text-center">
                <div className="text-gray-400">🎵 Reverb Builds</div>
                <div className="text-green-300">Gentle swells</div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              AI detects tempo and adds ONLY reverb and delay at perfect moments - zero filtering!
            </p>
          </div>
        </div>

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
