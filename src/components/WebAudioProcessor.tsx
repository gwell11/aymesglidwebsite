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

export default function WebAudioProcessor({ className = '' }: WebAudioProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [processedAudio, setProcessedAudio] = useState<string | null>(null);
  const [message, setMessage] = useState('');
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setMessage(`Loaded: ${file.name}`);
    } else {
      setMessage('Please select a valid audio file');
    }
  };

  const processAudio = async () => {
    if (!audioFile) {
      setMessage('Please select an audio file first');
      return;
    }

    setIsProcessing(true);
    setMessage('Processing audio...');

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext || AudioContext)();
      
      // Read file as array buffer
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Apply audio effects using Web Audio API
      const processedBuffer = await applyAudioEffects(audioContext, audioBuffer, parameters);
      
      // Convert back to downloadable format
      const wav = audioBufferToWav(processedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      setProcessedAudio(url);
      setMessage('🎉 Audio processed successfully! Click download to get your enhanced audio.');
      
    } catch (error) {
      console.error('Processing error:', error);
      setMessage('Error processing audio. Please try a different file or check browser compatibility.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyAudioEffects = async (audioContext: AudioContext, audioBuffer: AudioBuffer, params: typeof parameters): Promise<AudioBuffer> => {
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

    // Configure effects
    gainNode.gain.value = params.gain;
    biquadFilter.type = 'highpass';
    biquadFilter.frequency.value = params.filterFreq;
    
    // Create reverb impulse response
    const impulseBuffer = createReverbImpulse(offlineContext, params.reverbDuration, params.reverbDecay);
    convolver.buffer = impulseBuffer;

    // Configure delay
    delay.delayTime.value = params.delayTime;
    feedbackGain.gain.value = params.delayFeedback;

    // Connect effects chain
    source.connect(gainNode);
    gainNode.connect(biquadFilter);
    biquadFilter.connect(convolver);
    convolver.connect(delay);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay); // Feedback loop
    delay.connect(offlineContext.destination);

    // Also connect dry signal
    const dryGain = offlineContext.createGain();
    dryGain.gain.value = params.dryWetMix;
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
        🎵 AI Song Nuance Generator
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">WEB VERSION</span>
      </h3>
      
      <p className="text-gray-300 mb-4 text-sm">
        Upload your audio files and enhance them with AI-powered effects processing. All processing happens locally in your browser - no server uploads required!
        <span className="block mt-2 text-green-400 font-medium">
          ✨ Instant processing - Upload → Enhance → Download
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
        
        {/* Audio Parameters */}
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <h4 className="text-white font-semibold text-sm mb-3">🎛️ Audio Parameters</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-xs mb-1">Gain Boost</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={parameters.gain}
                onChange={(e) => setParameters(prev => ({ ...prev, gain: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-400 text-xs">{parameters.gain.toFixed(1)}x</span>
            </div>
            
            <div>
              <label className="block text-gray-300 text-xs mb-1">Filter (Hz)</label>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={parameters.filterFreq}
                onChange={(e) => setParameters(prev => ({ ...prev, filterFreq: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-400 text-xs">{parameters.filterFreq}Hz</span>
            </div>
            
            <div>
              <label className="block text-gray-300 text-xs mb-1">Reverb Time</label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={parameters.reverbDuration}
                onChange={(e) => setParameters(prev => ({ ...prev, reverbDuration: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-400 text-xs">{parameters.reverbDuration.toFixed(1)}s</span>
            </div>
            
            <div>
              <label className="block text-gray-300 text-xs mb-1">Delay Time</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={parameters.delayTime}
                onChange={(e) => setParameters(prev => ({ ...prev, delayTime: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-400 text-xs">{parameters.delayTime.toFixed(1)}s</span>
            </div>
            
            <div>
              <label className="block text-gray-300 text-xs mb-1">Delay Feedback</label>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.1"
                value={parameters.delayFeedback}
                onChange={(e) => setParameters(prev => ({ ...prev, delayFeedback: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-400 text-xs">{parameters.delayFeedback.toFixed(1)}</span>
            </div>
            
            <div>
              <label className="block text-gray-300 text-xs mb-1">Dry/Wet Mix</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parameters.dryWetMix}
                onChange={(e) => setParameters(prev => ({ ...prev, dryWetMix: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-400 text-xs">{parameters.dryWetMix.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={processAudio}
          disabled={isProcessing || !audioFile}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium"
        >
          {isProcessing ? 'Processing Audio...' : 'Process Audio'}
        </button>
        
        {processedAudio && (
          <div className="space-y-3">
            <audio controls className="w-full">
              <source src={processedAudio} type="audio/wav" />
            </audio>
            <a
              href={processedAudio}
              download="processed_audio.wav"
              className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center transition-colors duration-200"
            >
              📥 Download Processed Audio
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
        <strong className="text-gray-300">🌐 AI Audio Effects:</strong> Reverb, delay, filtering, and gain processing 
        using advanced Web Audio API. Real-time browser processing with downloadable results!
      </div>
    </div>
  );
}
