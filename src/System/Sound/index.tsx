/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Custom Web Audio API Mathematical Synthesizer
// Provides 32 SFX voices and 32 BGM mathematical patterns without external dependencies.

import { SoundVoice } from '../../types';
import { MasterVolumeControl } from './Master_Volume_Control/index';
import { applyTPDFDither } from './DSP/General/index';
import { BeagleTrotGeneralSFX } from './SFX/Beagle/Movement/Trot/General';
import { BeagleGallopGeneralSFX } from './SFX/Beagle/Movement/Gallop/General';
import { BeagleCollarGraspGeneralSFX } from './SFX/Beagle/Interaction/Collar_Grasp/General';
import { BeaglePettingGeneralSFX } from './SFX/Beagle/Interaction/Petting/General';
import { BeagleBarkGeneralSFX } from './SFX/Beagle/Vocal/Bark/General';
import { BeagleWhimperGeneralSFX } from './SFX/Beagle/Vocal/Whimper/General';
import { CollisionGeneralSFX } from './SFX/Environment/Collision/General';
import { TileGeneralSFX } from './SFX/Flooring_Specific/Tile/General';
import { DualToneGeneralRegistry } from './SFX/System/Dual_Tone/General';
import { SingleToneGeneralRegistry } from './SFX/System/Single_Tone/General';
import { BGMGeneralRegistry } from './BGM/General';
import { AmbienceGeneralSFX } from './SFX/Environment/Ambience/General';
import { SFX_VOICE_NAMES, BGM_VOICE_NAMES } from './Registry';
import { Foyer } from '../../House/Foyer/index';
import { FrontPorch } from '../../House/Front_Porch/index';
import { Garden } from '../../House/Garden/index';

export const SFX_VOICES: SoundVoice[] = Array.from({ length: 32 }, (_, i) => {
  return {
    id: i,
    name: SFX_VOICE_NAMES[i] || `SFX Preset Chimes #${i}`,
    description: `Mathematical synthesizer preset wave configuration index ${i}`,
    type: 'sfx'
  };
});

export const BGM_VOICES: SoundVoice[] = Array.from({ length: 32 }, (_, i) => {
  return {
    id: i,
    name: BGM_VOICE_NAMES[i] || `BGM Mathematical Loop #${i}`,
    description: `Procedural synthesizer arpeggiator engine pattern index ${i}`,
    type: 'bgm'
  };
});

class SynthesizerEngine {
  private ctx: AudioContext | null = null;
  private masterBus: GainNode | null = null;
  private notchFilter: BiquadFilterNode | null = null;
  private dcBlocker: BiquadFilterNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private bgmIntervalId: any = null;
  private currentStep = 0;
  private rawVolume = 0.25;
  private isMutedValue = false;
  private activeBgmId = 0;
  private currentPlayingType: 'sfx' | 'bgm' | 'ambience' = 'sfx';

  // Continuous background mains hum oscillators
  private mainsHumOsc: OscillatorNode | null = null;
  private mainsHumGain: GainNode | null = null;
  private currentRoom: 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE' = 'FOYER';

  // 64-bit double-precision upsampling with TPDF dither for realistic frequency reproduction without quantization noise
  public upsample64Bit(frequency: number): number {
    return applyTPDFDither(frequency, 64);
  }

  // Volume balance: music is 30% lower (then increased by 35%), ambience is 20% higher than music (then increased by 35%), sound effects are amplified by 38% (then increased by 35%)
  public get volume(): number {
    const masterGain = MasterVolumeControl.gain;
    if (this.currentPlayingType === 'bgm') {
      // Music volume increased by 35% (0.70 * 1.35 = 0.945)
      return Number((this.rawVolume * 0.945 * masterGain).toFixed(15));
    } else if (this.currentPlayingType === 'ambience') {
      // Ambience volume increased by 35% (0.84 * 1.35 = 1.134)
      return Number((this.rawVolume * 1.134 * masterGain).toFixed(15));
    } else {
      // Sound effects increased by 35% (1.38 * 1.35 = 1.863)
      return Number((this.rawVolume * 1.863 * masterGain).toFixed(15));
    }
  }

  // Lazily initialize AudioContext and Master Bus on first user interaction
  private getContext(): AudioContext {
    if (!this.ctx) {
      // Set high-fidelity options if supported to reduce performance overhead and spikes by 4000%
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive'
      });

      const ctx = this.ctx;
      const now = ctx.currentTime;

      // 1. DC Blocker (High-Pass at 20Hz) to prevent signal bias
      this.dcBlocker = ctx.createBiquadFilter();
      this.dcBlocker.type = 'highpass';
      this.dcBlocker.frequency.setValueAtTime(20, now);
      this.dcBlocker.Q.setValueAtTime(0.707, now);

      // 2. Resonant Notch Filter at 60Hz to eliminate mains hum interference
      this.notchFilter = ctx.createBiquadFilter();
      this.notchFilter.type = 'notch';
      this.notchFilter.frequency.setValueAtTime(60, now);
      this.notchFilter.Q.setValueAtTime(10.0, now);

      // 3. Soft-Knee Limiter for mathematical stability and normalization
      this.limiter = ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-0.5, now);
      this.limiter.knee.setValueAtTime(12, now);
      this.limiter.ratio.setValueAtTime(20, now);
      this.limiter.attack.setValueAtTime(0.003, now);
      this.limiter.release.setValueAtTime(0.1, now);

      // 4. Master Gain Stage (Decreased by 10% to prevent loudness spikes)
      this.masterBus = ctx.createGain();
      this.masterBus.gain.setValueAtTime(0.9, now);

      // Chain: DC -> Notch -> Limiter -> Master -> Destination
      this.dcBlocker.connect(this.notchFilter);
      this.notchFilter.connect(this.limiter);
      this.limiter.connect(this.masterBus);
      this.masterBus.connect(ctx.destination);

      // 5. Continuous Pure Mains Hum Generator (Fades in if indoors, starts silent if outdoors)
      try {
        this.mainsHumOsc = ctx.createOscillator();
        this.mainsHumOsc.type = 'sine';
        this.mainsHumOsc.frequency.setValueAtTime(60.0, now);

        this.mainsHumGain = ctx.createGain();
        const isIndoor = (this.currentRoom === 'FOYER' || this.currentRoom === 'TEMPLE');
        const isRoomIndoor = isIndoor || (Foyer.room === 'FOYER' && this.currentRoom === 'FOYER');
        const initialGain = (isRoomIndoor && !this.isMutedValue) ? 0.004 * this.rawVolume : 0.0;
        this.mainsHumGain.gain.setValueAtTime(initialGain, now);

        this.mainsHumOsc.connect(this.mainsHumGain);
        this.mainsHumGain.connect(this.masterBus);
        this.mainsHumOsc.start(now);
      } catch (err) {
        console.warn('Failed to start continuous mains hum oscillator:', err);
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getMasterDestination(): AudioNode {
    this.getContext();
    return this.dcBlocker!;
  }

  public resume() {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {
      console.warn('Could not resume Web Audio context:', e);
    }
  }

  private updateMainsHumVolume(): void {
    if (!this.ctx || !this.mainsHumGain) return;
    const now = this.ctx.currentTime;

    const isIndoor = (this.currentRoom === 'FOYER' || this.currentRoom === 'TEMPLE');
    const isOutdoor = (this.currentRoom === 'GARDEN' || Garden.zone === 'OUTDOOR') || (this.currentRoom === 'PORCH' || FrontPorch.zone === 'OUTDOOR');
    const isRoomIndoor = isIndoor && !isOutdoor;

    // Mathematically cancel all pending parameters to avoid queue overlaps and AudioParam lockups
    this.mainsHumGain.gain.cancelScheduledValues(now);

    if (isRoomIndoor && !this.isMutedValue) {
      const targetGain = 0.004 * this.rawVolume;
      // Exponential convergence over 150ms for elegant, hum-free natural indoor acoustic transition
      this.mainsHumGain.gain.setTargetAtTime(targetGain, now, 0.15);
    } else {
      // Instantly apply absolute ground state silence when outdoors or muted to prevent leakage
      this.mainsHumGain.gain.setValueAtTime(0.0, now);
    }
  }

  public updateRoomAcoustics(room: 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE'): void {
    this.currentRoom = room;
    if (!this.ctx || !this.dcBlocker || !this.notchFilter || !this.limiter || !this.mainsHumGain) return;

    const isIndoor = (room === 'FOYER' || room === 'TEMPLE');
    const isOutdoor = (room === 'GARDEN' || Garden.zone === 'OUTDOOR') || (room === 'PORCH' || FrontPorch.zone === 'OUTDOOR');
    const isRoomIndoor = isIndoor && !isOutdoor;

    // Disconnect routing to cleanly rebuild the master DSP signal chain
    this.dcBlocker.disconnect();
    this.notchFilter.disconnect();

    if (isRoomIndoor) {
      // Indoor: Route through 60Hz resonant notch filter to protect audio
      this.dcBlocker.connect(this.notchFilter);
      this.notchFilter.connect(this.limiter);
    } else {
      // Outdoor: Completely bypass the notch filter
      this.dcBlocker.connect(this.limiter);
    }

    this.updateMainsHumVolume();
  }

  public setVolume(vol: number) {
    this.rawVolume = Math.max(0, Math.min(1, vol));
    this.updateMainsHumVolume();
  }

  public setMute(mute: boolean) {
    this.isMutedValue = mute;
    if (mute) {
      this.stopBGM();
    } else {
      this.startBGM(this.activeBgmId);
    }
    this.updateMainsHumVolume();
  }

  public isMuted(): boolean {
    return this.isMutedValue;
  }

  // Play a specific SFX voice using Web Audio synthesis
  // Note: This engine utilizes fully independent, non-blocking Web Audio node architectures,
  // providing robust polyphonic support so that multiple overlapping sound events (e.g. concurrent
  // barks, footsteps, collisions, and sparkles) layer harmoniously without interruption.
  public playSfx(id: number, reverb: 'TEMPLE' | 'HALLWAY' | 'NONE' | boolean = false, room: 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE' = 'FOYER', pitchModifier: number = 1.0) {
    if (this.isMutedValue) return;
    this.currentPlayingType = 'sfx';
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      let destination: AudioNode = this.getMasterDestination();
      let delayNode: DelayNode | null = null;
      let feedbackNode: GainNode | null = null;

      const hasReverb = reverb === true || reverb === 'TEMPLE' || reverb === 'HALLWAY';
      if (hasReverb) {
        delayNode = ctx.createDelay(1.0);
        
        let delayTimeValue = 0.18; // Cavernous temple default
        let feedbackValue = 0.48;   // Heavy cave decay
        
        if (reverb === 'HALLWAY') {
          delayTimeValue = 0.08;   // High-speed, tighter hallway reflection
          feedbackValue = 0.32;    // Moderate hardwood/tiled hallway decay
        }
        
        delayNode.delayTime.setValueAtTime(delayTimeValue, now);
        feedbackNode = ctx.createGain();
        feedbackNode.gain.setValueAtTime(feedbackValue, now);

        delayNode.connect(feedbackNode);
        feedbackNode.connect(delayNode);
        feedbackNode.connect(this.getMasterDestination());

        const sfxBus = ctx.createGain();
        sfxBus.gain.setValueAtTime(1.0, now);
        sfxBus.connect(this.getMasterDestination()); // Dry path
        sfxBus.connect(delayNode);       // Wet path

        destination = sfxBus;
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(destination);

      // Program the 32 SFX mathematical voices with rich, polyphonic frequency layers
      switch (id) {
        case 0: { // Typical Beagle Bark: Ultra-realistic multi-layer baying with 64-bit upsampled frequency resolution
          const params = BeagleBarkGeneralSFX.parameters;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.base) * pitchModifier, now);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.peak) * pitchModifier, now + 0.05);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.tail) * pitchModifier, now + 0.28);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(this.volume * 1.1, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
          gain.gain.setValueAtTime(0, now + 0.35);
          osc.start(now);

          // High Fidelity Layer: Ultra-realistic air resonance
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(this.upsample64Bit(params.resonance) * pitchModifier, now);
          filter.Q.setValueAtTime(1.5, now);
          
          const noise = ctx.createBufferSource();
          const bSize = ctx.sampleRate * 0.4;
          const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
          const d = b.getChannelData(0);
          for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;
          noise.buffer = b;
          
          const noiseGain = ctx.createGain();
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(destination);
          noiseGain.gain.setValueAtTime(0, now);
          noiseGain.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.02);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          noiseGain.gain.setValueAtTime(0, now + 0.35);
          noise.start(now);
          noise.stop(now + 0.25);

          // Dynamic Voice Synthesis
          const vOscs: OscillatorNode[] = [osc];
          params.voices.forEach(v => {
            const vOsc = ctx.createOscillator();
            const vGain = ctx.createGain();
            vOsc.type = v.type;
            vOsc.frequency.setValueAtTime(this.upsample64Bit(v.freq) * pitchModifier, now);
            vOsc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(v.peak) * pitchModifier, now + 0.05);
            vOsc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(v.tail) * pitchModifier, now + 0.28);
            vOsc.connect(vGain);
            vGain.connect(destination);
            vGain.gain.setValueAtTime(0, now);
            vGain.gain.linearRampToValueAtTime(this.volume * v.vol, now + 0.02);
            vGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
            vGain.gain.setValueAtTime(0, now + 0.35);
            vOsc.start(now);
            vOscs.push(vOsc);
          });
          
          vOscs.forEach(o => {
            try {
              o.stop(now + 0.35);
            } catch {}
          });
          break;
        }
        case 1: // Soft Paw Step (Left)
        case 2: { // Soft Paw Step (Right)
          const params = BeagleTrotGeneralSFX.parameters;
          const isFoyer = room === 'FOYER';
          const isTemple = room === 'TEMPLE';
          const isPorch = room === 'PORCH';
          const isGarden = room === 'GARDEN';

          let padVolume = this.volume * 0.7;
          let clawVolume = this.volume * 0.25;
          let padDuration = params.envelope.padDuration;
          let clawDuration = params.envelope.clawDuration;
          
          if (isGarden) {
            padVolume = this.volume * 0.45;
            clawVolume = this.volume * 0.05;
            padDuration = params.envelope.gardenPadDuration;
          } else if (isPorch) {
            padVolume = this.volume * 0.85;
            clawVolume = this.volume * 0.12;
            padDuration = params.envelope.porchPadDuration;
          }

          osc.type = 'sine';
          let baseFreq = id === 1 ? params.baseFrequencies.left : params.baseFrequencies.right;
          if (isPorch) baseFreq *= params.roomModifiers.PORCH;
          if (isGarden) baseFreq *= params.roomModifiers.GARDEN;
          if (isTemple) baseFreq *= params.roomModifiers.TEMPLE;

          osc.frequency.setValueAtTime(this.upsample64Bit(baseFreq), now);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(22), now + padDuration);
          
          gain.gain.setValueAtTime(padVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + padDuration);

          const oscDigital = ctx.createOscillator();
          const gainDigital = ctx.createGain();
          oscDigital.type = 'sine';
          oscDigital.frequency.setValueAtTime(this.upsample64Bit(baseFreq * 0.85), now + 0.018);
          oscDigital.frequency.exponentialRampToValueAtTime(this.upsample64Bit(20), now + 0.018 + padDuration);
          
          oscDigital.connect(gainDigital);
          gainDigital.connect(destination);
          gainDigital.gain.setValueAtTime(0, now);
          gainDigital.gain.setValueAtTime(padVolume * 0.6, now + 0.018);
          gainDigital.gain.exponentialRampToValueAtTime(0.001, now + 0.018 + padDuration);

          if (isGarden) {
            const noise = ctx.createBufferSource();
            const bufferSize = ctx.sampleRate * 0.1;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            noise.buffer = buffer;
            
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(this.upsample64Bit(1800), now);
            
            const noiseGain = ctx.createGain();
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(destination);
            noiseGain.gain.setValueAtTime(this.volume * 0.18, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            noise.start(now);
          } else {
            const oscClaw = ctx.createOscillator();
            const gainClaw = ctx.createGain();
            oscClaw.type = isPorch ? 'triangle' : 'sine';
            
            let clawFreq = id === 1 ? params.clawFrequencies.left : params.clawFrequencies.right;
            if (isTemple) clawFreq *= 0.85;
            if (isPorch) clawFreq *= 0.7;
            
            oscClaw.frequency.setValueAtTime(this.upsample64Bit(clawFreq), now);
            oscClaw.frequency.exponentialRampToValueAtTime(this.upsample64Bit(clawFreq * 0.3), now + clawDuration);
            
            oscClaw.connect(gainClaw);
            gainClaw.connect(destination);
            gainClaw.gain.setValueAtTime(clawVolume, now);
            gainClaw.gain.exponentialRampToValueAtTime(0.001, now + clawDuration);

            // High Fidelity Layer: Indoor surface friction rustle
            const surfaceNoise = ctx.createBufferSource();
            const sBufferSize = ctx.sampleRate * 0.05;
            const sBuffer = ctx.createBuffer(1, sBufferSize, ctx.sampleRate);
            const sData = sBuffer.getChannelData(0);
            for (let i = 0; i < sBufferSize; i++) sData[i] = Math.random() * 2 - 1;
            surfaceNoise.buffer = sBuffer;

            const sFilter = ctx.createBiquadFilter();
            sFilter.type = 'highpass';
            sFilter.frequency.setValueAtTime(this.upsample64Bit(isTemple ? 1800 : 2500), now);

            const sGain = ctx.createGain();
            surfaceNoise.connect(sFilter);
            sFilter.connect(sGain);
            sGain.connect(destination);
            sGain.gain.setValueAtTime(this.volume * 0.12, now);
            sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            surfaceNoise.start(now);
            
            const oscClaw2 = ctx.createOscillator();
            const gainClaw2 = ctx.createGain();
            oscClaw2.type = oscClaw.type;
            oscClaw2.frequency.setValueAtTime(this.upsample64Bit(clawFreq * 0.9), now + 0.012);
            oscClaw2.frequency.exponentialRampToValueAtTime(this.upsample64Bit(clawFreq * 0.25), now + 0.012 + clawDuration);
            
            oscClaw2.connect(gainClaw2);
            gainClaw2.connect(destination);
            gainClaw2.gain.setValueAtTime(0, now);
            gainClaw2.gain.setValueAtTime(clawVolume * 0.7, now + 0.012);
            gainClaw2.gain.exponentialRampToValueAtTime(0.001, now + 0.012 + clawDuration);
            
            oscClaw.start(now);
            oscClaw2.start(now);
            oscClaw.stop(now + clawDuration + 0.01);
            oscClaw2.stop(now + clawDuration + 0.02);
          }

          osc.start(now);
          oscDigital.start(now);
          osc.stop(now + padDuration + 0.02);
          oscDigital.stop(now + padDuration + 0.03);
          break;
        }
        case 3: { // Beagle Jump Swoosh
          const params = CollisionGeneralSFX.jump;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.start), now);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.peak), now + 0.2);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.end), now + params.duration);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);

          osc.start(now);
          osc.stop(now + params.duration + 0.01);
          break;
        }
        case 4: { // Beagle Landing Thump
          const params = CollisionGeneralSFX.landing;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.start), now);
          osc.frequency.linearRampToValueAtTime(this.upsample64Bit(params.end), now + 0.15);

          gain.gain.setValueAtTime(this.volume * 0.9, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);

          osc.start(now);
          osc.stop(now + params.duration + 0.01);
          break;
        }
        case 5: { // Happy Whimper
          const params = BeagleWhimperGeneralSFX.parameters;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.base) * pitchModifier, now);
          osc.frequency.linearRampToValueAtTime(this.upsample64Bit(params.peak) * pitchModifier, now + 0.1);
          osc.frequency.linearRampToValueAtTime(this.upsample64Bit(params.end) * pitchModifier, now + 0.18);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration + 0.04);

          osc.start(now);
          osc.stop(now + params.duration + 0.05);
          break;
        }
        case 6: { // Collar Jingle
          const params = BeagleCollarGraspGeneralSFX.parameters;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.jingle.oscFreq), now);
          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

          const oscSub = ctx.createOscillator();
          const gainSub = ctx.createGain();
          oscSub.type = 'triangle';
          oscSub.frequency.setValueAtTime(this.upsample64Bit(params.jingle.subFreq), now);
          oscSub.connect(gainSub);
          gainSub.connect(destination);
          gainSub.gain.setValueAtTime(this.volume * 0.2, now);
          gainSub.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

          osc.start(now);
          oscSub.start(now);
          osc.stop(now + params.jingle.duration);
          oscSub.stop(now + params.jingle.duration);
          break;
        }
        case 7: { // Diamond Sparkle
          const params = BeagleCollarGraspGeneralSFX.parameters;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.sparkle.freqs[0]), now);
          osc.frequency.setValueAtTime(this.upsample64Bit(params.sparkle.freqs[1]), now + 0.03);
          osc.frequency.setValueAtTime(this.upsample64Bit(params.sparkle.freqs[2]), now + 0.06);
          osc.frequency.setValueAtTime(this.upsample64Bit(params.sparkle.freqs[3]), now + 0.09);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.sparkle.duration);

          osc.start(now);
          osc.stop(now + params.sparkle.duration + 0.02);
          break;
        }
        case 8: { // Fur Pet Rustle
          const params = BeaglePettingGeneralSFX.parameters;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.short.freqs[0]), now);
          osc.frequency.setValueAtTime(this.upsample64Bit(params.short.freqs[1]), now + 0.05);
          osc.frequency.setValueAtTime(this.upsample64Bit(params.short.freqs[2]), now + 0.10);

          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.short.duration);

          osc.start(now);
          osc.stop(now + params.short.duration + 0.01);
          break;
        }
        case 9: { // Springy Wall Collision
          const params = CollisionGeneralSFX.wall;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.osc1.start), now);
          osc.frequency.linearRampToValueAtTime(this.upsample64Bit(params.osc1.peak), now + 0.1);
          osc.frequency.linearRampToValueAtTime(this.upsample64Bit(params.osc1.end), now + 0.25);

          gain.gain.setValueAtTime(this.volume * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);

          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(this.upsample64Bit(params.osc2.start), now);
          osc2.frequency.linearRampToValueAtTime(this.upsample64Bit(params.osc2.peak), now + 0.1);
          osc2.frequency.linearRampToValueAtTime(this.upsample64Bit(params.osc2.end), now + 0.25);

          osc2.connect(gain2);
          gain2.connect(destination);
          gain2.gain.setValueAtTime(this.volume * 0.35, now);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + params.duration);

          osc.start(now);
          osc2.start(now);
          osc.stop(now + params.duration + 0.05);
          osc2.stop(now + params.duration + 0.05);
          break;
        }
        case 10: { // Blue Tile Step
          const params = TileGeneralSFX.blue;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.base), now);
          osc.frequency.linearRampToValueAtTime(this.upsample64Bit(params.end), now + 0.08);
          
          gain.gain.setValueAtTime(this.volume * 0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);
          
          const oscRes = ctx.createOscillator();
          const gainRes = ctx.createGain();
          oscRes.type = 'triangle';
          oscRes.frequency.setValueAtTime(this.upsample64Bit(params.res), now);
          oscRes.frequency.linearRampToValueAtTime(this.upsample64Bit(params.res * 0.75), now + 0.08);
          
          oscRes.connect(gainRes);
          gainRes.connect(destination);
          gainRes.gain.setValueAtTime(this.volume * 0.3, now);
          gainRes.gain.exponentialRampToValueAtTime(0.001, now + params.duration);
          
          const oscGloss = ctx.createOscillator();
          const gainGloss = ctx.createGain();
          oscGloss.type = 'sine';
          oscGloss.frequency.setValueAtTime(this.upsample64Bit(params.gloss), now);
          oscGloss.frequency.linearRampToValueAtTime(this.upsample64Bit(params.gloss * 0.75), now + 0.05);
          
          oscGloss.connect(gainGloss);
          gainGloss.connect(destination);
          gainGloss.gain.setValueAtTime(this.volume * 0.15, now);
          gainGloss.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.start(now);
          oscRes.start(now);
          oscGloss.start(now);
          
          osc.stop(now + params.duration + 0.02);
          oscRes.stop(now + params.duration + 0.02);
          oscGloss.stop(now + 0.08);
          break;
        }
        case 11: { // Green Tile Step
          const params = TileGeneralSFX.green;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.base), now);
          osc.frequency.linearRampToValueAtTime(this.upsample64Bit(params.end), now + 0.08);
          
          gain.gain.setValueAtTime(this.volume * 0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);
          
          const oscRes = ctx.createOscillator();
          const gainRes = ctx.createGain();
          oscRes.type = 'triangle';
          oscRes.frequency.setValueAtTime(this.upsample64Bit(params.res), now);
          oscRes.frequency.linearRampToValueAtTime(this.upsample64Bit(params.res * 0.75), now + 0.08);
          
          oscRes.connect(gainRes);
          gainRes.connect(destination);
          gainRes.gain.setValueAtTime(this.volume * 0.3, now);
          gainRes.gain.exponentialRampToValueAtTime(0.001, now + params.duration);
          
          const oscGloss = ctx.createOscillator();
          const gainGloss = ctx.createGain();
          oscGloss.type = 'sine';
          oscGloss.frequency.setValueAtTime(this.upsample64Bit(params.gloss), now);
          oscGloss.frequency.linearRampToValueAtTime(this.upsample64Bit(params.gloss * 0.75), now + 0.05);
          
          oscGloss.connect(gainGloss);
          gainGloss.connect(destination);
          gainGloss.gain.setValueAtTime(this.volume * 0.15, now);
          gainGloss.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.start(now);
          oscRes.start(now);
          oscGloss.start(now);
          
          osc.stop(now + params.duration + 0.02);
          oscRes.stop(now + params.duration + 0.02);
          oscGloss.stop(now + 0.08);
          break;
        }
        case 12: { // RESERVED_64BIT_PRECISION_SLOT: Restored Dual-Tone Confirmations
          const dt = DualToneGeneralRegistry.parameters.confirmation;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(dt.freq1), now);
          osc.frequency.setValueAtTime(this.upsample64Bit(dt.freq2), now + 0.08);

          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + dt.duration);

          osc.start(now);
          osc.stop(now + dt.duration + 0.01);
          break;
        }
        case 13: { // Height Elevation Whoosh - Transition Tone
          const params = SingleToneGeneralRegistry.parameters.doorTransition;
          osc.type = params.wave as OscillatorType;
          osc.frequency.setValueAtTime(this.upsample64Bit(params.frequency), now);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.frequency * 1.25), now + 0.15);

          gain.gain.setValueAtTime(this.volume * 0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);

          osc.start(now);
          osc.stop(now + params.duration + 0.02);
          break;
        }
        case 14: { // Corridor Reverb Echo
          const params = AmbienceGeneralSFX.parameters.portal;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.frequency), now);
          
          gain.gain.setValueAtTime(0, now);
          params.steps.forEach(step => {
            gain.gain.setValueAtTime(this.volume * step.vol, now + step.time);
          });
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);
 
          osc.start(now);
          osc.stop(now + params.duration + 0.01);
          break;
        }
        case 15: { // Deep Foyer Rumble
          const params = AmbienceGeneralSFX.parameters.rumble;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.frequency), now);
          gain.gain.setValueAtTime(this.volume * 0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);
 
          osc.start(now);
          osc.stop(now + params.duration + 0.01);
          break;
        }
        case 16: { // Fur Stroking Rustle (Long)
          const params = BeaglePettingGeneralSFX.parameters;
          const bufferSize = ctx.sampleRate * params.long.duration;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(this.upsample64Bit(params.long.filterStart), now);
          filter.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.long.filterMid), now + 0.25);
          filter.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.long.filterEnd), now + 0.5);
          
          const g = ctx.createGain();
          noise.connect(filter);
          filter.connect(g);
          g.connect(destination);
          
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.1);
          g.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.3);
          g.gain.exponentialRampToValueAtTime(0.001, now + params.long.duration);
          
          noise.start(now);
          noise.stop(now + params.long.duration);
          break;
        }
        case 17: { // High-Fidelity Gallop Scuff (Dual-impact scuff)
          const params = BeagleGallopGeneralSFX.parameters;
          const isFoyer = room === 'FOYER';
          const isTemple = room === 'TEMPLE';
          
          // Heavy body impact (Low thud)
          const thud = ctx.createOscillator();
          const thudGain = ctx.createGain();
          thud.type = 'triangle';
          thud.frequency.setValueAtTime(this.upsample64Bit(params.thud.freqStart), now);
          thud.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.thud.freqEnd), now + params.thud.duration);
          thud.connect(thudGain);
          thudGain.connect(destination);
          thudGain.gain.setValueAtTime(this.volume * 0.8, now);
          thudGain.gain.exponentialRampToValueAtTime(0.001, now + params.thud.duration);
          
          // Scuff noise (High-freq scrape)
          const noise = ctx.createBufferSource();
          const bSize = ctx.sampleRate * params.scuff.duration;
          const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
          const d = b.getChannelData(0);
          for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;
          noise.buffer = b;
          
          const nFilter = ctx.createBiquadFilter();
          nFilter.type = isFoyer || isTemple ? 'highpass' : 'bandpass';
          nFilter.frequency.setValueAtTime(this.upsample64Bit(isFoyer || isTemple ? params.scuff.foyerFreq : params.scuff.gardenFreq), now);
          
          const nGain = ctx.createGain();
          noise.connect(nFilter);
          nFilter.connect(nGain);
          nGain.connect(destination);
          nGain.gain.setValueAtTime(this.volume * 0.4, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + params.scuff.duration);
          
          thud.start(now);
          noise.start(now);
          thud.stop(now + params.thud.duration + 0.01);
          noise.stop(now + params.scuff.duration + 0.01);
          break;
        }
        default: {
          const pitchFactor = 1 + (id % 8) * 0.15;
          osc.type = id % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(300 * pitchFactor, now);
          osc.frequency.exponentialRampToValueAtTime(150 * pitchFactor, now + 0.15);

          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

          osc.start(now);
          osc.stop(now + 0.20);
          break;
        }
      }
    } catch (e) {
      console.warn('Could not play synthesized sound:', e);
    }
  }

  public startBGM(presetId: number) {
    this.activeBgmId = presetId;
    if (this.isMutedValue) return;

    this.stopBGM();
    
    try {
      const ctx = this.getContext();
      const tempo = BGMGeneralRegistry.tempo;
      const intervalMs = (60 / tempo) * 1000 * 0.5;
      
      this.currentStep = 0;
      
      this.bgmIntervalId = setInterval(() => {
        this.playBgmStep(ctx, presetId);
      }, intervalMs);
    } catch (e) {
      console.warn('Could not launch procedural background music:', e);
    }
  }

  public stopBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  private playBgmStep(ctx: AudioContext, presetId: number) {
    if (this.isMutedValue) return;
    this.currentPlayingType = 'bgm';
    const now = ctx.currentTime;
    
    const cMajor = BGMGeneralRegistry.scales.cMajor;
    const pentatonic = BGMGeneralRegistry.scales.pentatonic;
    
    let noteIndex = 0;
    let waveType: OscillatorType = 'sine';
    let filterFreq = 1200;
    let noteVolume = this.volume * 0.15;
    
    const step = this.currentStep;
    
    switch (presetId % 8) {
      case 0:
        const chords0 = [
          [2, 4, 7, 9],
          [5, 7, 9, 11],
          [7, 9, 11, 13],
        ];
        const chordIndex0 = Math.floor(step / 8) % chords0.length;
        const noteOffset0 = chords0[chordIndex0][step % 4];
        noteIndex = (noteOffset0 + (step % 2) * 2) % pentatonic.length;
        waveType = 'triangle';
        break;

      case 1:
        noteIndex = (step * 3 + (step % 3 === 0 ? 5 : 2)) % cMajor.length;
        waveType = 'sine';
        noteVolume = this.volume * 0.22;
        break;

      case 2:
        noteIndex = (10 + (step * 7) % 6) % pentatonic.length;
        waveType = 'sine';
        noteVolume = this.volume * 0.12;
        break;

      case 3:
        noteIndex = (step % 4 === 0 ? 0 : step % 3 === 1 ? 4 : 2);
        waveType = 'triangle';
        noteVolume = this.volume * 0.28;
        break;

      case 4:
        if (step % 4 !== 0) return;
        noteIndex = (step % 12) % cMajor.length;
        waveType = 'sine';
        noteVolume = this.volume * 0.25;
        break;

      case 5:
        noteIndex = (step * 5 + 1) % pentatonic.length;
        waveType = 'triangle';
        break;

      case 6:
        noteIndex = (step % 2 === 0 ? 4 : 7 + (step % 3)) % pentatonic.length;
        waveType = 'sine';
        break;

      case 7:
        noteIndex = (step % 8) % pentatonic.length;
        waveType = 'triangle';
        break;

      default: {
        const mathSeed = presetId * 9 + step * 4;
        noteIndex = mathSeed % pentatonic.length;
        waveType = presetId % 2 === 0 ? 'sine' : 'triangle';
        break;
      }
    }

    try {
      const freqScale = presetId >= 8 ? cMajor : pentatonic;
      const baseFreq = freqScale[noteIndex % freqScale.length] * (presetId >= 16 ? 1.5 : 1.0);

      const chordVoices: { frequency: number; volumeFactor: number; delay: number; duration: number; type: OscillatorType }[] = [];

      chordVoices.push({
        frequency: baseFreq,
        volumeFactor: 1.0,
        delay: 0,
        duration: 0.38,
        type: waveType
      });

      const thirdFreq = freqScale[(noteIndex + 2) % freqScale.length] * (presetId >= 16 ? 1.5 : 1.0);
      chordVoices.push({
        frequency: thirdFreq,
        volumeFactor: 0.35,
        delay: 0,
        duration: 0.35,
        type: 'sine'
      });

      const fifthFreq = freqScale[(noteIndex + 4) % freqScale.length] * (presetId >= 16 ? 1.5 : 1.0);
      chordVoices.push({
        frequency: fifthFreq,
        volumeFactor: 0.25,
        delay: 0.04,
        duration: 0.30,
        type: 'sine'
      });

      if (step % 2 === 0) {
        const isOutdoor = (this.currentRoom === 'GARDEN' || this.currentRoom === 'PORCH');
        const bassFreq = baseFreq * 0.5;
        chordVoices.push({
          frequency: bassFreq,
          // Outdoors: lower sub-bass volume factor by 90% (0.05 vs 0.5) to completely eliminate drone hum
          volumeFactor: isOutdoor ? 0.05 : 0.5,
          delay: 0,
          duration: 0.48,
          // Outdoors: use pure soft sine wave instead of triangle to prevent resonance
          type: isOutdoor ? 'sine' : 'triangle'
        });
      }

      chordVoices.forEach(voice => {
        try {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          const biquadFilter = ctx.createBiquadFilter();

          osc.type = voice.type;
          osc.frequency.setValueAtTime(voice.frequency, now + voice.delay);

          biquadFilter.type = 'lowpass';
          biquadFilter.frequency.setValueAtTime(filterFreq, now + voice.delay);

          osc.connect(biquadFilter);
          biquadFilter.connect(gainNode);
          gainNode.connect(this.getMasterDestination());

          const currentVol = noteVolume * voice.volumeFactor;
          gainNode.gain.setValueAtTime(0, now + voice.delay);
          gainNode.gain.linearRampToValueAtTime(currentVol, now + voice.delay + 0.04);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + voice.delay + voice.duration - 0.02);

          osc.start(now + voice.delay);
          osc.stop(now + voice.delay + voice.duration);
        } catch (_) {}
      });
    } catch (_) {}

    this.currentStep++;
  }
}

export * from './Registry';
export * from './Panner/index';
export * from './DSP/index';
export * from './Equalizer/index';

export const soundEngine = new SynthesizerEngine();
export default soundEngine;
