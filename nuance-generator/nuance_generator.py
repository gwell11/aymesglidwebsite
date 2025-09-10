import librosa
import numpy as np
import soundfile as sf
import random
import os
from pathlib import Path
import json
from typing import Dict, List, Tuple, Optional
import scipy.signal

class AINoiseGenerator:
    """Generate unique procedural audio samples using AI techniques"""
    
    def __init__(self):
        self.sr = 44100
        self.effect_bank = [
            'chorus', 'delay', 'reverb', 'distortion', 'filter_sweep', 
            'pitch_shift', 'granular', 'bit_crush', 'flanger', 'phaser'
        ]
    
    def apply_random_effects(self, audio: np.ndarray) -> np.ndarray:
        """Apply random combination of audio effects to make each sound unique"""
        # Randomly choose 1-3 effects
        num_effects = random.randint(1, 3)
        chosen_effects = random.sample(self.effect_bank, num_effects)
        
        processed_audio = audio.copy()
        
        for effect in chosen_effects:
            if effect == 'chorus':
                processed_audio = self._apply_chorus(processed_audio)
            elif effect == 'delay':
                processed_audio = self._apply_delay(processed_audio)
            elif effect == 'reverb':
                processed_audio = self._apply_reverb(processed_audio)
            elif effect == 'distortion':
                processed_audio = self._apply_distortion(processed_audio)
            elif effect == 'filter_sweep':
                processed_audio = self._apply_filter_sweep(processed_audio)
            elif effect == 'pitch_shift':
                processed_audio = self._apply_pitch_shift(processed_audio)
            elif effect == 'granular':
                processed_audio = self._apply_granular(processed_audio)
            elif effect == 'bit_crush':
                processed_audio = self._apply_bit_crush(processed_audio)
            elif effect == 'flanger':
                processed_audio = self._apply_flanger(processed_audio)
            elif effect == 'phaser':
                processed_audio = self._apply_phaser(processed_audio)
        
        return processed_audio
    
    def _apply_chorus(self, audio: np.ndarray) -> np.ndarray:
        """Apply chorus effect with random parameters"""
        delay_samples = random.randint(int(0.01 * self.sr), int(0.03 * self.sr))
        depth = random.uniform(0.3, 0.8)
        rate = random.uniform(1, 5)
        
        # Create delayed version with modulation
        t = np.linspace(0, len(audio) / self.sr, len(audio))
        modulation = depth * np.sin(2 * np.pi * rate * t)
        
        # Simple chorus approximation
        delayed = np.zeros_like(audio)
        for i in range(len(audio)):
            delay_offset = int(delay_samples + modulation[i] * delay_samples * 0.5)
            if i - delay_offset >= 0:
                delayed[i] = audio[i - delay_offset]
        
        return 0.7 * audio + 0.3 * delayed
    
    def _apply_delay(self, audio: np.ndarray) -> np.ndarray:
        """Apply delay effect with random parameters"""
        delay_time = random.uniform(0.1, 0.4)  # 100-400ms delay
        feedback = random.uniform(0.2, 0.6)
        mix = random.uniform(0.2, 0.5)
        
        delay_samples = int(delay_time * self.sr)
        delayed = np.zeros(len(audio) + delay_samples)
        delayed[:len(audio)] = audio
        
        # Apply feedback
        for i in range(delay_samples, len(delayed)):
            if i - delay_samples < len(audio):
                delayed[i] += feedback * delayed[i - delay_samples]
        
        # Mix with original
        output = np.zeros_like(audio)
        for i in range(len(audio)):
            output[i] = (1 - mix) * audio[i] + mix * delayed[i + delay_samples]
        
        return output
    
    def _apply_reverb(self, audio: np.ndarray) -> np.ndarray:
        """Apply reverb effect using multiple delays"""
        reverb_time = random.uniform(0.5, 2.0)
        wetness = random.uniform(0.2, 0.6)
        
        # Create multiple delays for reverb approximation
        delays = [
            int(0.03 * self.sr),
            int(0.05 * self.sr), 
            int(0.08 * self.sr),
            int(0.13 * self.sr)
        ]
        
        reverb_signal = np.zeros_like(audio)
        for delay in delays:
            if len(audio) > delay:
                delayed = np.zeros_like(audio)
                delayed[delay:] = audio[:-delay]
                reverb_signal += delayed * random.uniform(0.1, 0.3)
        
        # Apply decay
        decay_envelope = np.exp(-np.linspace(0, reverb_time * 3, len(audio)))
        reverb_signal *= decay_envelope
        
        return (1 - wetness) * audio + wetness * reverb_signal
    
    def _apply_distortion(self, audio: np.ndarray) -> np.ndarray:
        """Apply distortion effect"""
        drive = random.uniform(2, 8)
        mix = random.uniform(0.3, 0.7)
        
        # Soft clipping distortion
        distorted = np.tanh(drive * audio) / np.tanh(drive)
        
        return (1 - mix) * audio + mix * distorted
    
    def _apply_filter_sweep(self, audio: np.ndarray) -> np.ndarray:
        """Apply sweeping filter effect"""
        start_freq = random.uniform(200, 1000)
        end_freq = random.uniform(2000, 8000)
        
        # Create frequency sweep
        t = np.linspace(0, len(audio) / self.sr, len(audio))
        cutoff_freq = start_freq * (end_freq / start_freq) ** (t / t[-1])
        
        # Apply simple filter approximation
        filtered = audio.copy()
        for i in range(1, len(audio)):
            # Simple low-pass filter
            alpha = min(0.5, cutoff_freq[i] / (self.sr / 2))
            filtered[i] = alpha * audio[i] + (1 - alpha) * filtered[i-1]
        
        return filtered
    
    def _apply_pitch_shift(self, audio: np.ndarray) -> np.ndarray:
        """Apply pitch shifting"""
        shift_ratio = random.uniform(0.7, 1.4)  # -30% to +40% pitch
        
        # Simple pitch shift by resampling
        if shift_ratio != 1.0:
            indices = np.arange(len(audio)) * shift_ratio
            indices = np.clip(indices, 0, len(audio) - 1).astype(int)
            shifted = audio[indices]
            
            # Resize to original length
            if len(shifted) != len(audio):
                shifted = np.interp(np.linspace(0, 1, len(audio)), 
                                  np.linspace(0, 1, len(shifted)), shifted)
            return shifted
        return audio
    
    def _apply_granular(self, audio: np.ndarray) -> np.ndarray:
        """Apply granular synthesis effects"""
        grain_size = random.randint(int(0.01 * self.sr), int(0.05 * self.sr))
        density = random.uniform(0.3, 0.8)
        
        granular = np.zeros_like(audio)
        
        # Create grains at random positions
        num_grains = int(len(audio) / grain_size * density)
        for _ in range(num_grains):
            start_pos = random.randint(0, max(1, len(audio) - grain_size))
            grain_start = random.randint(0, max(1, len(audio) - grain_size))
            
            # Extract and place grain
            grain = audio[grain_start:grain_start + grain_size]
            end_pos = min(start_pos + len(grain), len(granular))
            granular[start_pos:end_pos] += grain[:end_pos - start_pos] * random.uniform(0.3, 0.8)
        
        return granular * random.uniform(0.5, 1.0)
    
    def _apply_bit_crush(self, audio: np.ndarray) -> np.ndarray:
        """Apply bit crushing effect"""
        bits = random.randint(4, 12)
        sample_rate_reduction = random.randint(2, 8)
        
        # Reduce bit depth
        max_val = 2 ** (bits - 1)
        crushed = np.round(audio * max_val) / max_val
        
        # Reduce sample rate
        if sample_rate_reduction > 1:
            indices = np.arange(0, len(audio), sample_rate_reduction)
            reduced = crushed[indices]
            # Upsample back
            crushed = np.repeat(reduced, sample_rate_reduction)[:len(audio)]
        
        return crushed
    
    def _apply_flanger(self, audio: np.ndarray) -> np.ndarray:
        """Apply flanger effect"""
        rate = random.uniform(0.2, 2.0)
        depth = random.uniform(0.001, 0.01)  # in seconds
        feedback = random.uniform(0.2, 0.7)
        
        t = np.linspace(0, len(audio) / self.sr, len(audio))
        delay_mod = depth * (1 + np.sin(2 * np.pi * rate * t)) / 2
        
        flanged = audio.copy()
        for i in range(len(audio)):
            delay_samples = int(delay_mod[i] * self.sr)
            if i - delay_samples >= 0:
                flanged[i] += feedback * audio[i - delay_samples]
        
        return flanged
    
    def _apply_phaser(self, audio: np.ndarray) -> np.ndarray:
        """Apply phaser effect"""
        rate = random.uniform(0.5, 3.0)
        depth = random.uniform(0.3, 0.8)
        
        t = np.linspace(0, len(audio) / self.sr, len(audio))
        phase_mod = depth * np.sin(2 * np.pi * rate * t)
        
        # Simple phase modulation
        phased = audio * (1 + phase_mod)
        
        return 0.7 * audio + 0.3 * phased
        
    def generate_texture_pad(self, duration: float = 2.0, base_freq: float = 220.0) -> np.ndarray:
        """Generate ambient texture pad with unique characteristics"""
        sr = 44100
        t = np.linspace(0, duration, int(sr * duration), False)
        
        # Create unique harmonic series with random variations
        harmonics = [1, random.uniform(1.8, 2.2), random.uniform(2.8, 3.2), 
                    random.uniform(4.5, 5.5), random.uniform(7.0, 8.0)]
        amplitudes = [1.0, random.uniform(0.3, 0.7), random.uniform(0.1, 0.4),
                     random.uniform(0.05, 0.2), random.uniform(0.02, 0.1)]
        
        sound = np.zeros_like(t)
        for harmonic, amp in zip(harmonics, amplitudes):
            freq = base_freq * harmonic
            # Add random phase and frequency modulation for uniqueness
            phase = random.uniform(0, 2 * np.pi)
            fm_rate = random.uniform(0.1, 0.5)
            fm_depth = random.uniform(0.01, 0.05)
            
            carrier = np.sin(2 * np.pi * freq * t + phase + 
                           fm_depth * np.sin(2 * np.pi * fm_rate * t))
            sound += amp * carrier
        
        # Unique envelope with random attack and decay
        attack_time = random.uniform(0.1, 0.5)
        release_time = random.uniform(0.3, 1.0)
        attack_samples = int(attack_time * sr)
        release_samples = int(release_time * sr)
        
        envelope = np.ones_like(t)
        if len(envelope) > attack_samples:
            envelope[:attack_samples] = np.linspace(0, 1, attack_samples)
        if len(envelope) > release_samples:
            envelope[-release_samples:] = np.linspace(1, 0, release_samples)
        
        # Add subtle noise for texture
        noise_level = random.uniform(0.02, 0.08)
        texture_noise = np.random.normal(0, noise_level, len(t))
        
        base_sound = (sound * envelope + texture_noise) * random.uniform(0.15, 0.35)
        
        # Apply random effects for uniqueness
        return self.apply_random_effects(base_sound)
    
    def generate_percussive_hit(self, hit_type: str = 'hit') -> np.ndarray:
        """Generate unique percussive sounds using physical modeling"""
        sr = 44100
        
        if hit_type == 'crash':
            # Cymbal-like crash using noise and resonance
            duration = random.uniform(1.5, 3.0)
            t = np.linspace(0, duration, int(sr * duration), False)
            
            # High-frequency noise burst
            noise = np.random.normal(0, 1, len(t))
            
            # Multiple resonant frequencies (metallic harmonics)
            resonances = [
                random.uniform(3000, 5000),
                random.uniform(7000, 9000), 
                random.uniform(12000, 15000),
                random.uniform(18000, 22000)
            ]
            
            crash_sound = np.zeros_like(t)
            for freq in resonances:
                # Create resonant filter
                q_factor = random.uniform(20, 50)  # High Q for metallic ring
                b, a = scipy.signal.butter(2, freq, btype='high', fs=sr)
                resonant_noise = scipy.signal.filtfilt(b, a, noise)
                
                # Add slight frequency modulation
                mod_rate = random.uniform(0.5, 2.0)
                freq_mod = 1 + 0.01 * np.sin(2 * np.pi * mod_rate * t)
                crash_sound += resonant_noise * freq_mod * random.uniform(0.2, 0.5)
            
            # Sharp attack, long decay
            envelope = np.exp(-t * random.uniform(1.5, 3.0))
            base_crash = crash_sound * envelope * random.uniform(0.15, 0.25)
            return self.apply_random_effects(base_crash)
            
        elif hit_type == 'click':
            # Sharp transient click
            duration = random.uniform(0.05, 0.15)
            t = np.linspace(0, duration, int(sr * duration), False)
            
            # High-frequency burst
            click_freq = random.uniform(2000, 8000)
            click = np.sin(2 * np.pi * click_freq * t)
            
            # Add some harmonics for texture
            for harmonic in [2, 3, 5]:
                h_freq = click_freq * harmonic
                if h_freq < sr / 2:  # Avoid aliasing
                    click += random.uniform(0.1, 0.3) * np.sin(2 * np.pi * h_freq * t)
            
            # Very sharp envelope
            envelope = np.exp(-t * random.uniform(50, 100))
            base_click = click * envelope * random.uniform(0.3, 0.5)
            return self.apply_random_effects(base_click)
            
        else:  # 'hit'
            # Drum-like percussive hit
            duration = random.uniform(0.2, 0.8)
            t = np.linspace(0, duration, int(sr * duration), False)
            
            # Fundamental frequency (like a drum)
            fundamental = random.uniform(60, 200)
            
            # Drum-like overtone series (not harmonic)
            overtones = [
                fundamental * random.uniform(1.8, 2.2),
                fundamental * random.uniform(2.8, 3.5),
                fundamental * random.uniform(4.0, 5.5)
            ]
            
            drum_sound = np.sin(2 * np.pi * fundamental * t)
            for overtone in overtones:
                drum_sound += random.uniform(0.2, 0.4) * np.sin(2 * np.pi * overtone * t)
            
            # Add some noise for snare-like texture
            noise_level = random.uniform(0.1, 0.3)
            noise = np.random.normal(0, noise_level, len(t))
            
            # High-pass filter the noise for snare character
            b, a = scipy.signal.butter(2, 1000, btype='high', fs=sr)
            filtered_noise = scipy.signal.filtfilt(b, a, noise)
            
            drum_sound += filtered_noise
            
            # Drum-like envelope (quick attack, exponential decay)
            envelope = np.exp(-t * random.uniform(8, 15))
            base_sound = drum_sound * envelope * random.uniform(0.2, 0.4)
            
            # Apply random effects for uniqueness
            return self.apply_random_effects(base_sound)
    
    def generate_riser(self, duration: float = 2.0) -> np.ndarray:
        """Generate unique riser/sweep sounds"""
        t = np.linspace(0, duration, int(duration * self.sr))
        
        # Frequency sweep
        start_freq = random.uniform(100, 500)
        end_freq = random.uniform(2000, 8000)
        
        # Exponential frequency sweep
        freq_curve = start_freq * (end_freq / start_freq) ** (t / duration)
        
        # Multiple oscillators with slight detuning
        sound = np.zeros_like(t)
        for i in range(3):
            detune = random.uniform(0.98, 1.02)
            sound += np.sin(2 * np.pi * freq_curve * detune * t) / 3
        
        # Add filtered noise
        noise = np.random.normal(0, 0.3, len(t))
        # Simple high-pass effect by differencing
        noise = np.diff(np.concatenate([[0], noise]))
        sound += noise
        
        # Rising envelope
        envelope = (t / duration) ** 2
        
        base_sound = sound * envelope * 0.4
        
        # Apply random effects for uniqueness
        return self.apply_random_effects(base_sound)
    
    def generate_vocal_chop(self) -> np.ndarray:
        """Generate unique vocal-like texture with formant synthesis"""
        sr = 44100
        duration = random.uniform(0.3, 0.8)
        t = np.linspace(0, duration, int(sr * duration), False)
        
        # Create formant-like resonances (vocal tract simulation)
        formant_freqs = [
            random.uniform(700, 900),   # F1 - openness
            random.uniform(1200, 1600), # F2 - tongue position  
            random.uniform(2400, 3000), # F3 - lip rounding
        ]
        formant_bws = [60, 90, 120]  # bandwidths
        
        # Base excitation (simulated vocal cords)
        f0 = random.uniform(120, 200)  # fundamental frequency
        excitation = np.sin(2 * np.pi * f0 * t)
        
        # Add some breathiness/noise
        breath_level = random.uniform(0.1, 0.3)
        excitation += breath_level * np.random.normal(0, 1, len(t))
        
        # Apply formant filtering
        vocal_sound = excitation
        for freq, bw in zip(formant_freqs, formant_bws):
            # Create resonant filter for each formant
            b, a = scipy.signal.butter(2, [freq - bw/2, freq + bw/2], 
                                     btype='band', fs=sr)
            formant_response = scipy.signal.filtfilt(b, a, excitation)
            vocal_sound += formant_response * random.uniform(0.3, 0.8)
        
        # Random pitch modulation for expressiveness
        vibrato_rate = random.uniform(4, 8)
        vibrato_depth = random.uniform(0.02, 0.05)
        pitch_mod = 1 + vibrato_depth * np.sin(2 * np.pi * vibrato_rate * t)
        
        # Apply pitch modulation by time-stretching (simplified)
        vocal_sound = vocal_sound * pitch_mod
        
        # Dynamic envelope with random articulation
        attack = random.uniform(0.02, 0.1)
        sustain = random.uniform(0.3, 0.7)
        release = duration - attack - sustain
        
        attack_samples = int(attack * sr)
        sustain_samples = int(sustain * sr)
        release_samples = len(t) - attack_samples - sustain_samples
        
        envelope = np.concatenate([
            np.linspace(0, 1, attack_samples),
            np.ones(sustain_samples),
            np.linspace(1, 0, max(1, release_samples))
        ])
        
        # Ensure envelope matches signal length
        if len(envelope) != len(vocal_sound):
            envelope = np.interp(np.linspace(0, 1, len(vocal_sound)), 
                               np.linspace(0, 1, len(envelope)), envelope)
        
        base_sound = vocal_sound * envelope * random.uniform(0.2, 0.4)
        
        # Apply random effects for uniqueness
        return self.apply_random_effects(base_sound)
    
    def generate_glitch(self):
        """Generate digital glitch sounds"""
        duration = random.uniform(0.1, 0.4)
        t = np.linspace(0, duration, int(duration * self.sr))
        
        # Digital-style sound
        freq = random.uniform(200, 2000)
        
        # Bit-crush effect simulation
        levels = random.randint(4, 16)
        sound = np.sin(2 * np.pi * freq * t)
        sound = np.round(sound * levels) / levels
        
        # Add some aliasing-like effects
        alias_freq = random.uniform(freq * 0.7, freq * 1.3)
        sound += 0.3 * np.sin(2 * np.pi * alias_freq * t)
        
        # Sharp envelope
        envelope = np.exp(-8 * t)
        
        base_sound = sound * envelope * 0.35
        
        # Apply random effects for uniqueness
        return self.apply_random_effects(base_sound)

class NuanceCatalog:
    """Manages a library of audio samples for adding nuances to songs"""
    
    def __init__(self, samples_dir: str = "samples"):
        self.samples_dir = Path(samples_dir)
        self.samples = {
            'percussion': [],  # one-shots, fills, crashes
            'texture': [],     # ambient layers, pads
            'riser': [],       # build-ups, sweeps
            'fx': []          # vocal chops, glitches
        }
        self.ai_generator = AINoiseGenerator()
        self.recent_samples = {k: [] for k in self.samples.keys()}  # Track recent usage
        self.ai_generation_rate = 0.85  # Default rate for AI generation
        self.load_samples()
    
    def load_samples(self):
        """Load all samples from the samples directory"""
        if not self.samples_dir.exists():
            print(f"Samples directory {self.samples_dir} not found. Creating with example structure...")
            self.create_sample_structure()
            return
        
        for category in self.samples.keys():
            category_path = self.samples_dir / category
            if category_path.exists():
                for file_path in category_path.glob("*.wav"):
                    try:
                        audio, sr = librosa.load(str(file_path), sr=None)
                        self.samples[category].append({
                            'path': str(file_path),
                            'audio': audio,
                            'sr': sr,
                            'duration': len(audio) / sr,
                            'type': 'file',
                            'name': file_path.stem
                        })
                    except Exception as e:
                        print(f"Error loading {file_path}: {e}")
        
        print(f"Loaded samples: {[(k, len(v)) for k, v in self.samples.items()]}")
        print("AI generator ready for procedural sounds")
    
    def create_sample_structure(self):
        """Create example directory structure for samples"""
        for category in self.samples.keys():
            (self.samples_dir / category).mkdir(parents=True, exist_ok=True)
        
        # Create a README for users
        readme_content = """
# Nuance Generator Samples

Place your audio samples (.wav files) in the following directories:

- `percussion/` - Drum hits, crashes, fills
- `texture/` - Ambient sounds, pads, atmospheres  
- `riser/` - Build-ups, sweeps, risers
- `fx/` - Vocal chops, glitches, sound effects

All samples should be WAV files and relatively short (< 10 seconds).

Note: The AI will also generate unique procedural sounds automatically!
        """
        with open(self.samples_dir / "README.md", 'w') as f:
            f.write(readme_content)
    
    def generate_ai_sample(self, category: str) -> Dict:
        """Generate a unique AI sample for the given category"""
        sr = 44100
        unique_id = random.randint(10000, 99999)  # Unique identifier
        
        if category == 'percussion':
            hit_types = ['crash', 'click', 'hit']
            hit_type = random.choice(hit_types)
            audio = self.ai_generator.generate_percussive_hit(hit_type)
            name = f"ai_{hit_type}_{unique_id}"
            
        elif category == 'texture':
            audio = self.ai_generator.generate_texture_pad(
                duration=random.uniform(1.5, 3.0),
                base_freq=random.uniform(80, 300)
            )
            name = f"ai_texture_{unique_id}"
            
        elif category == 'riser':
            audio = self.ai_generator.generate_riser(
                duration=random.uniform(1.0, 2.5)
            )
            name = f"ai_riser_{unique_id}"
            
        elif category == 'fx':
            fx_types = ['vocal_chop', 'glitch']
            fx_type = random.choice(fx_types)
            if fx_type == 'vocal_chop':
                audio = self.ai_generator.generate_vocal_chop()
            else:
                audio = self.ai_generator.generate_glitch()
            name = f"ai_{fx_type}_{unique_id}"
        
        else:
            # Fallback
            audio = np.random.normal(0, 0.1, sr // 4)
            name = f"ai_fallback_{unique_id}"
        
        return {
            'audio': audio,
            'sr': sr,
            'duration': len(audio) / sr,
            'type': 'ai_generated',
            'name': name,
            'category': category
        }
    
    def get_smart_sample(self, category: str, context=None) -> Dict:
        """Get a sample with smart selection to avoid repetition"""
        available_samples = self.samples[category].copy()
        
        # Use dynamic AI generation rate based on creativity setting
        use_ai = random.random() < self.ai_generation_rate or len(available_samples) == 0
        
        if use_ai:
            return self.generate_ai_sample(category)
        
        # Remove recently used samples to encourage variety
        recent = self.recent_samples[category]
        if len(recent) > 0 and len(available_samples) > len(recent):
            available_samples = [s for s in available_samples if s['name'] not in recent]
        
        # If we filtered out everything, reset recent list
        if not available_samples:
            available_samples = self.samples[category].copy()
            self.recent_samples[category] = []
        
        # Select sample
        sample = random.choice(available_samples)
        
        # Track usage (keep last 3 samples)
        self.recent_samples[category].append(sample['name'])
        if len(self.recent_samples[category]) > 3:
            self.recent_samples[category].pop(0)
        
        return sample
    
    def get_random_sample(self, category: str) -> Dict:
        """Get a random sample from a category (legacy method)"""
        return self.get_smart_sample(category)

class SongNuanceGenerator:
    """Main class for analyzing songs and adding nuances"""
    
    def __init__(self, samples_dir: str = "samples"):
        self.catalog = NuanceCatalog(samples_dir)
        self.default_params = {
            'creativity_level': 0.85,  # How often to use AI vs samples (0-1)
            'nuance_density': 1.0,     # Multiplier for number of nuances (0.1-3.0)
            'intensity': 0.7,          # Volume/energy level (0.1-1.0)
            'texture_preference': 0.5, # Balance between types (0=percussion, 1=texture)
            'randomness': 0.5,         # Timing randomness (0-1)
            'frequency_range': 'full', # 'low', 'mid', 'high', 'full'
            'stereo_width': 0.5,       # Stereo spread (0-1)
            'vintage_mode': False,     # Apply vintage processing
        }
        self.analysis_cache = {}
    
    def analyze_song(self, audio_path: str) -> Dict:
        """Analyze a song to extract musical features"""
        print(f"Analyzing {audio_path}...")
        
        # Load audio
        y, sr = librosa.load(audio_path, sr=None)
        
        # Extract tempo and beats
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
        
        # Extract downbeats (stronger beats)
        # For now, assume every 4th beat is a downbeat
        downbeats = beats[::4]
        
        # Detect sections using spectral features
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        # Simplify section detection for now
        sections = self._detect_sections(chroma, beats)
        
        analysis = {
            'audio': y,
            'sr': sr,
            'tempo': tempo,
            'beats': beats,
            'downbeats': downbeats,
            'sections': sections,
            'duration': len(y) / sr
        }
        
        print(f"Analysis complete: {float(tempo):.1f} BPM, {len(beats)} beats, {len(sections)} sections")
        return analysis
    
    def _detect_sections(self, chroma, beats, segment_length=8):
        """Simple section detection based on spectral changes"""
        # For MVP, just create sections every 8 bars (32 beats)
        sections = []
        bars_per_section = 8
        beats_per_bar = 4
        beats_per_section = bars_per_section * beats_per_bar
        
        for i in range(0, len(beats), beats_per_section):
            if i < len(beats):
                sections.append({
                    'start_beat': i,
                    'start_time': beats[i] if i < len(beats) else beats[-1],
                    'type': 'verse' if (i // beats_per_section) % 2 == 0 else 'chorus'
                })
        
        return sections
    
    def schedule_nuances(self, analysis: Dict, params=None) -> List[Dict]:
        """Schedule when and where to place nuances based on parameters"""
        if params is None:
            params = self.default_params
            
        events = []
        beats = analysis['beats']
        sections = analysis['sections']
        tempo = analysis['tempo']
        
        # Apply nuance density parameter (0.1 to 3.0)
        base_placement_chance = 0.08 * params['nuance_density']
        
        # Apply texture preference to type selection
        texture_bias = params['texture_preference']  # 0=percussion, 1=texture
        
        # Go through beats and decide where to place nuances
        for i, beat_time in enumerate(beats):
            beat_in_bar = i % 4
            bar_number = i // 4
            
            # Apply randomness parameter to timing
            randomness = params['randomness']
            timing_offset = random.uniform(-randomness * 0.1, randomness * 0.1)
            actual_time = beat_time + timing_offset
            
            # Higher chance at end of bars (beat 3 of 4)
            if beat_in_bar == 3:
                chance = base_placement_chance * 1.8
            # Lower chance on downbeats
            elif beat_in_bar == 0:
                chance = base_placement_chance * 0.2
            else:
                chance = base_placement_chance
            
            # Every 8 bars, higher chance for bigger effects
            if bar_number % 8 == 7:
                chance *= 2.5
                preferred_type = 'riser' if random.random() < 0.7 else 'fx'
            else:
                # Use texture preference to influence type selection
                type_weights = {
                    'percussion': (1 - texture_bias) * 2,
                    'texture': texture_bias * 2,
                    'riser': 0.3,
                    'fx': 0.5
                }
                
                # Normalize weights
                total_weight = sum(type_weights.values())
                if total_weight > 0:
                    type_probs = {k: v/total_weight for k, v in type_weights.items()}
                    rand = random.random()
                    cumulative = 0
                    for nuance_type, prob in type_probs.items():
                        cumulative += prob
                        if rand <= cumulative:
                            preferred_type = nuance_type
                            break
                    else:
                        preferred_type = 'texture'
                else:
                    preferred_type = 'texture'
            
            # Random placement decision
            if random.random() < chance:
                # Add some humanized timing jitter (±50ms)
                jitter = random.uniform(-0.05, 0.05)
                
                # Smarter volume scaling based on type and context
                base_volume = self._calculate_smart_volume(preferred_type, beat_in_bar, bar_number)
                
                events.append({
                    'time': beat_time + jitter,
                    'type': preferred_type,
                    'beat_index': i,
                    'bar_number': bar_number,
                    'volume_scale': base_volume,
                    'context': {
                        'beat_in_bar': beat_in_bar,
                        'section_boundary': bar_number % 8 == 7,
                        'tempo': float(tempo)
                    }
                })
        
        print(f"Scheduled {len(events)} nuance events (reduced for better taste)")
        return events
    
    def _calculate_smart_volume(self, sample_type: str, beat_in_bar: int, bar_number: int) -> float:
        """Calculate volume based on context for better mixing"""
        base_volumes = {
            'texture': random.uniform(0.15, 0.25),    # Very subtle
            'percussion': random.uniform(0.20, 0.35), # Moderate
            'fx': random.uniform(0.18, 0.30),         # Depends on type
            'riser': random.uniform(0.25, 0.40)       # Can be more prominent
        }
        
        volume = base_volumes.get(sample_type, 0.2)
        
        # Reduce volume on downbeats (don't compete with main rhythm)
        if beat_in_bar == 0:
            volume *= 0.6
        
        # Slight volume variation for human feel
        volume *= random.uniform(0.8, 1.2)
        
        # Ensure we don't go too loud
        return min(volume, 0.4)
    
    def apply_nuances(self, analysis: Dict, events: List[Dict], params=None) -> np.ndarray:
        """Apply the scheduled nuances to the original audio with parameter control"""
        if params is None:
            params = self.default_params
            
        output_audio = analysis['audio'].copy()
        sr = analysis['sr']
        
        # Update the catalog's AI generation rate based on creativity parameter
        original_ai_rate = 0.85  # Current rate
        self.catalog.ai_generation_rate = params['creativity_level']
        
        for event in events:
            # Get a smart sample for this event 
            sample_data = self.catalog.get_smart_sample(event['type'], event.get('context', {}))
            if sample_data is None:
                print(f"No samples available for type: {event['type']}")
                continue
            
            # Calculate timing
            start_sample = int(event['time'] * sr)
            sample_audio = sample_data['audio']
            sample_sr = sample_data.get('sr', sr)
            
            # Resample if necessary
            if sample_sr != sr:
                sample_audio = librosa.resample(sample_audio, orig_sr=sample_sr, target_sr=sr)
            
            # Apply intensity parameter to volume scaling
            volume_scale = event['volume_scale'] * params['intensity']
            
            # Additional volume reduction for AI-generated samples (they can be loud)
            if sample_data.get('type') == 'ai_generated':
                volume_scale *= 0.7
            
            # Adaptive volume based on original song's loudness at this point
            if start_sample < len(output_audio):
                # Sample a small window around the insertion point
                window_start = max(0, start_sample - sr // 10)  # 100ms before
                window_end = min(len(output_audio), start_sample + sr // 10)  # 100ms after
                
                if len(output_audio.shape) == 1:
                    local_rms = np.sqrt(np.mean(output_audio[window_start:window_end] ** 2))
                else:
                    local_rms = np.sqrt(np.mean(output_audio[:, window_start:window_end] ** 2))
                
                # Reduce nuance volume if the song is already loud at this point
                if local_rms > 0.3:
                    volume_scale *= 0.5
                elif local_rms > 0.2:
                    volume_scale *= 0.7
            
            sample_audio = sample_audio * volume_scale
            
            # Optional: Add subtle filtering for better integration
            if event['type'] == 'texture' and random.random() < 0.3:
                # Sometimes apply a subtle low-pass filter to textures
                sample_audio = self._apply_subtle_filter(sample_audio, sr)
            
            # Mix into output (handle mono/stereo)
            end_sample = start_sample + len(sample_audio)
            
            # Ensure we don't go beyond the original audio length
            if start_sample < len(output_audio):
                actual_end = min(end_sample, len(output_audio))
                sample_length = actual_end - start_sample
                
                if len(output_audio.shape) == 1:  # Mono
                    if len(sample_audio.shape) == 1:
                        output_audio[start_sample:actual_end] += sample_audio[:sample_length]
                    else:
                        # Mix stereo sample to mono
                        output_audio[start_sample:actual_end] += np.mean(sample_audio[:sample_length], axis=0)
                else:  # Stereo
                    if len(sample_audio.shape) == 1:
                        # Duplicate mono sample to stereo
                        for ch in range(output_audio.shape[0]):
                            output_audio[ch, start_sample:actual_end] += sample_audio[:sample_length]
                    else:
                        for ch in range(min(output_audio.shape[0], sample_audio.shape[0])):
                            output_audio[ch, start_sample:actual_end] += sample_audio[ch, :sample_length]
        
        return output_audio
    
    def _apply_subtle_filter(self, audio, sr):
        """Apply a subtle low-pass filter for better integration"""
        # Simple one-pole low-pass filter
        cutoff = random.uniform(3000, 8000)  # Random cutoff frequency
        alpha = 2 * np.pi * cutoff / sr
        alpha = alpha / (1 + alpha)  # Normalize
        
        filtered = np.zeros_like(audio)
        filtered[0] = audio[0]
        for i in range(1, len(audio)):
            filtered[i] = alpha * audio[i] + (1 - alpha) * filtered[i-1]
        
        return filtered
    
    def process_song(self, input_path: str, output_path: str, params=None) -> Dict:
        """Main function to process a song and add nuances with customizable parameters"""
        print(f"Processing {input_path} -> {output_path}")
        
        # Merge user params with defaults
        if params is None:
            params = {}
        combined_params = {**self.default_params, **params}
        
        # Analyze the song
        analysis = self.analyze_song(input_path)
        
        # Schedule nuances with parameters
        events = self.schedule_nuances(analysis, combined_params)
        
        # Apply nuances with parameters
        output_audio = self.apply_nuances(analysis, events, combined_params)
        
        # Normalize to prevent clipping
        max_val = np.max(np.abs(output_audio))
        if max_val > 0.95:
            output_audio = output_audio * (0.95 / max_val)
        
        # Save output
        sf.write(output_path, output_audio, analysis['sr'])
        
        # Create nuance map
        nuance_map = {
            'input_file': input_path,
            'output_file': output_path,
            'analysis': {
                'tempo': float(analysis['tempo']),
                'duration': analysis['duration'],
                'num_beats': len(analysis['beats']),
                'num_sections': len(analysis['sections'])
            },
            'events': events
        }
        
        # Save nuance map
        map_path = output_path.replace('.wav', '_nuance_map.json')
        with open(map_path, 'w') as f:
            json.dump(nuance_map, f, indent=2)
        
        print(f"Processing complete! Added {len(events)} nuances.")
        print(f"Nuance map saved to: {map_path}")
        
        return nuance_map

# Example usage
if __name__ == "__main__":
    generator = SongNuanceGenerator()
    
    # Example: process a song
    # generator.process_song("input_song.wav", "output_song_with_nuances.wav")
    print("Nuance Generator initialized. Place samples in the 'samples/' directory and call process_song().")
