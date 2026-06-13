'use client';

class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  // Ambient sound state
  private ambientGain: GainNode | null = null;
  private activeAmbientNodes: any[] = [];
  private ambientType: 'none' | 'rain' | 'breeze' | 'resonance' = 'none';
  private ambientVolume: number = 0.2; // default
  private rainInterval: any = null;
  private streamInterval: any = null;

  constructor() {
    // Lazy initialize to support server-rendering and browser security policies
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      // Pause or mute active ambient sounds
      if (this.ambientGain) {
        this.ambientGain.gain.setValueAtTime(0, this.audioCtx?.currentTime || 0);
      }
    } else {
      if (this.ambientGain && this.audioCtx) {
        this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.audioCtx.currentTime);
      }
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    // Resume context if suspended (common browser security behavior)
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (this.audioCtx && !this.ambientGain) {
      this.ambientGain = this.audioCtx.createGain();
      // Set current volume, or 0 if muted
      this.ambientGain.gain.setValueAtTime(
        this.soundEnabled ? this.ambientVolume : 0,
        this.audioCtx.currentTime
      );
      this.ambientGain.connect(this.audioCtx.destination);
    }
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.audioCtx && this.soundEnabled) {
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.audioCtx.currentTime);
    }
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public getAmbientType(): string {
    return this.ambientType;
  }

  public setAmbientType(type: 'none' | 'rain' | 'breeze' | 'resonance') {
    this.initCtx();
    if (this.ambientType === type) return;

    this.stopAmbient();
    this.ambientType = type;

    if (!this.soundEnabled || type === 'none' || !this.audioCtx) return;

    if (type === 'rain') {
      this.startRainSynth();
    } else if (type === 'breeze') {
      this.startBreezeSynth();
    } else if (type === 'resonance') {
      this.startResonanceSynth();
    }
  }

  private stopAmbient() {
    // Clear intervals
    if (this.rainInterval) {
      clearInterval(this.rainInterval);
      this.rainInterval = null;
    }
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }

    // Stop and disconnect nodes
    this.activeAmbientNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    this.activeAmbientNodes = [];
  }

  // Create a 2-second white noise buffer that can be looped
  private createNoiseBuffer(): AudioBuffer {
    if (!this.audioCtx) throw new Error('AudioContext not initialized');
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private startRainSynth() {
    if (!this.audioCtx || !this.ambientGain) return;
    const now = this.audioCtx.currentTime;

    try {
      // 1. Generate soft steady hiss (rain background)
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(0.4, now);

      const backgroundGain = this.audioCtx.createGain();
      backgroundGain.gain.setValueAtTime(0.06, now);

      noise.connect(filter);
      filter.connect(backgroundGain);
      backgroundGain.connect(this.ambientGain);

      noise.start(now);
      this.activeAmbientNodes.push(noise);

      // 2. Schedule random raindrop clicks (foreground)
      this.rainInterval = setInterval(() => {
        if (!this.audioCtx || !this.ambientGain || !this.soundEnabled) return;
        const clickTime = this.audioCtx.currentTime;

        // Trigger a tiny raindrop impact (short sine pluck with rapid pitch decay)
        const osc = this.audioCtx.createOscillator();
        const pluckGain = this.audioCtx.createGain();

        osc.type = 'sine';
        // Random frequency between 1200 and 2200 Hz
        const startFreq = 1200 + Math.random() * 1000;
        osc.frequency.setValueAtTime(startFreq, clickTime);
        osc.frequency.exponentialRampToValueAtTime(100, clickTime + 0.03);

        pluckGain.gain.setValueAtTime(0.005 + Math.random() * 0.015, clickTime);
        pluckGain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.03);

        osc.connect(pluckGain);
        pluckGain.connect(this.ambientGain);

        osc.start(clickTime);
        osc.stop(clickTime + 0.04);
      }, 75); // fast crackles of rain drops
    } catch (e) {
      console.warn('Failed to start Rain Synth:', e);
    }
  }

  private startBreezeSynth() {
    if (!this.audioCtx || !this.ambientGain) return;
    const now = this.audioCtx.currentTime;

    try {
      // Create noise source
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      // Create a bandpass filter with low Q to simulate wind
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(0.8, now);

      // Create an LFO to sweep the filter frequency slowly (making it sweep up and down like breeze gusts)
      const lfo = this.audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.07, now); // very slow 0.07 Hz (takes ~14s per cycle)

      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(250, now); // Sweep +/- 250 Hz

      // Connect LFO to filter frequency
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const windGain = this.audioCtx.createGain();
      windGain.gain.setValueAtTime(0.18, now);

      noise.connect(filter);
      filter.connect(windGain);
      windGain.connect(this.ambientGain);

      lfo.start(now);
      noise.start(now);

      this.activeAmbientNodes.push(lfo);
      this.activeAmbientNodes.push(noise);
    } catch (e) {
      console.warn('Failed to start Breeze Synth:', e);
    }
  }

  private startResonanceSynth() {
    if (!this.audioCtx || !this.ambientGain) return;
    const now = this.audioCtx.currentTime;

    try {
      // 1. Dual low-frequency meditative drone (fundamental + perfect fifth)
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const droneGain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, now); // A2 (110 Hz)
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(165, now); // E3 (165 Hz) - Perfect Fifth

      droneGain.gain.setValueAtTime(0.08, now);

      // Connect drone to gain
      osc1.connect(droneGain);
      osc2.connect(droneGain);
      droneGain.connect(this.ambientGain);

      osc1.start(now);
      osc2.start(now);

      this.activeAmbientNodes.push(osc1);
      this.activeAmbientNodes.push(osc2);

      // 2. Spiritual high-frequency bell drops triggered occasionally (stream-like)
      this.streamInterval = setInterval(() => {
        if (!this.audioCtx || !this.ambientGain || !this.soundEnabled) return;
        const dropTime = this.audioCtx.currentTime;

        // Occasional soft ambient chime ring
        const bell = this.audioCtx.createOscillator();
        const bellGain = this.audioCtx.createGain();

        bell.type = 'sine';
        // Spiritual harmonic frequency
        const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        const chosenFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
        bell.frequency.setValueAtTime(chosenFreq, dropTime);

        bellGain.gain.setValueAtTime(0.001, dropTime);
        bellGain.gain.linearRampToValueAtTime(0.012, dropTime + 0.15); // soft swell
        bellGain.gain.exponentialRampToValueAtTime(0.0001, dropTime + 2.5); // long decay

        bell.connect(bellGain);
        bellGain.connect(this.ambientGain);

        bell.start(dropTime);
        bell.stop(dropTime + 2.6);
      }, 4000 + Math.random() * 3000); // every 4-7 seconds
    } catch (e) {
      console.warn('Failed to start Resonance Synth:', e);
    }
  }

  /**
   * Plays a crisp click sound
   */
  public playClick(type: 'mechanical' | 'soft' | 'bubble' | 'bead' = 'mechanical') {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      if (type === 'mechanical') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.04);
        
        gainNode.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.05);
      } else if (type === 'soft') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.06);
        
        gainNode.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.07);
      } else if (type === 'bubble') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.audioCtx.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.09);
      } else {
        // Wooden bead slide-colliding click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(550, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, this.audioCtx.currentTime + 0.035);

        gainNode.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.035);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.04);

        // Add a secondary high frequency transient to simulate wooden touch click
        const oscTransient = this.audioCtx.createOscillator();
        const gainTransient = this.audioCtx.createGain();

        oscTransient.type = 'sine';
        oscTransient.frequency.setValueAtTime(1600, this.audioCtx.currentTime);
        oscTransient.frequency.setValueAtTime(1200, this.audioCtx.currentTime + 0.005);

        gainTransient.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
        gainTransient.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.008);

        oscTransient.connect(gainTransient);
        gainTransient.connect(this.audioCtx.destination);

        oscTransient.start();
        oscTransient.stop(this.audioCtx.currentTime + 0.01);
      }
    } catch (e) {
      console.warn('Click audio playback failed:', e);
    }
  }

  /**
   * Plays a peaceful, spiritually resonant dual-bell chime upon completion
   */
  public playGoalChime() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // We create a dual harmonic chime (C5 + E5 + G5) for a beautiful major-chord wind chime effect
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      const gains = [0.15, 0.1, 0.08];

      freqs.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        // Add a slight vibrato
        const vibrato = this.audioCtx.createOscillator();
        const vibratoGain = this.audioCtx.createGain();
        vibrato.frequency.value = 5.5; // Hz
        vibratoGain.gain.value = 3; // depth in Hz
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        gainNode.gain.setValueAtTime(0.001, now);
        // Soft swell attack
        gainNode.gain.linearRampToValueAtTime(gains[idx], now + 0.08);
        // Beautiful long spiritual decay
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        vibrato.start(now);
        osc.start(now);
        
        vibrato.stop(now + 1.8);
        osc.stop(now + 1.8);
      });
    } catch (e) {
      console.warn('Chime audio playback failed:', e);
    }
  }
}

// Export a singleton instance
export const audioService = new SoundSynthesizer();
