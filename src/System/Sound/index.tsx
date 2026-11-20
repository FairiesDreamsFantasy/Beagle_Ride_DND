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
import { soundCardUnit } from '../Hardware_Virtualization/Sound_Card/index';
import { AcousticsEngine } from '../Engine/Science/Acoustics/index';

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
  private hallwayReverbBus: GainNode | null = null;
  private hallwayDelay: DelayNode | null = null;
  private hallwayFeedback: GainNode | null = null;
  private hallwayWetFilter: BiquadFilterNode | null = null;
  private templeReverbBus: GainNode | null = null;
  private templeDelay: DelayNode | null = null;
  private templeFeedback: GainNode | null = null;
  private templeWetFilter: BiquadFilterNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private whiteNoiseBuffer: AudioBuffer | null = null;
  private bgmIntervalId: ReturnType<typeof setInterval> | null = null;
  private nextBgmNoteTime = 0;
  private currentStep = 0;
  private rawVolume = 0.25;
  private isMutedValue = false;
  private activeBgmId = 0;
  private currentRoom: 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE' = 'FOYER';

  // JS numbers are IEEE-754 float64; Web Audio AudioParam quantizes to float32 natively, so return frequency directly
  public upsample64Bit(frequency: number): number {
    return frequency;
  }

  // Channel-safe volume scaling without mutable shared channel state races
  public getChannelVolume(channel: 'sfx' | 'bgm' | 'ambience'): number {
    const masterGain = MasterVolumeControl.gain;
    if (channel === 'bgm') {
      return Number((this.rawVolume * 0.945 * masterGain).toFixed(15));
    } else if (channel === 'ambience') {
      return Number((this.rawVolume * 1.134 * masterGain).toFixed(15));
    } else {
      return Number((this.rawVolume * 1.863 * masterGain).toFixed(15));
    }
  }

  public get volume(): number {
    return this.getChannelVolume('sfx');
  }

  // Shared 1.0s cached white-noise AudioBuffer reused across all noise-based SFX with zero per-step allocation
  private getWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.whiteNoiseBuffer || this.whiteNoiseBuffer.sampleRate !== ctx.sampleRate) {
      const length = Math.max(1, Math.floor(ctx.sampleRate * 1.0));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.whiteNoiseBuffer = buffer;
    }
    return this.whiteNoiseBuffer;
  }

  // Lazily initialize AudioContext, Master DSP Bus, and shared Reverb Send Buses on first interaction
  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        latencyHint: 'interactive'
      });

      const ctx = this.ctx;
      const now = ctx.currentTime;

      // 1. DC Blocker (High-Pass at 20Hz) to prevent DC offset
      this.dcBlocker = ctx.createBiquadFilter();
      this.dcBlocker.type = 'highpass';
      this.dcBlocker.frequency.setValueAtTime(20, now);
      this.dcBlocker.Q.setValueAtTime(0.707, now);

      // 2. Resonant Notch Filter at 60Hz for indoor acoustics
      this.notchFilter = ctx.createBiquadFilter();
      this.notchFilter.type = 'notch';
      this.notchFilter.frequency.setValueAtTime(60, now);
      this.notchFilter.Q.setValueAtTime(10.0, now);

      // 3. Soft-Knee Limiter for signal normalization
      this.limiter = ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-0.5, now);
      this.limiter.knee.setValueAtTime(12, now);
      this.limiter.ratio.setValueAtTime(20, now);
      this.limiter.attack.setValueAtTime(0.003, now);
      this.limiter.release.setValueAtTime(0.1, now);

      // 4. Master Gain Stage
      this.masterBus = ctx.createGain();
      this.masterBus.gain.setValueAtTime(0.9, now);

      // Chain: DC -> Notch -> Limiter -> Master -> Destination
      this.dcBlocker.connect(this.notchFilter);
      this.notchFilter.connect(this.limiter);
      this.limiter.connect(this.masterBus);
      this.masterBus.connect(ctx.destination);

      // 5. Shared Reusable Hallway Reverb Send Bus calibrated via AcousticsEngine
      const foyerAcoustics = AcousticsEngine.getRoomProfile('FOYER');
      this.hallwayReverbBus = ctx.createGain();
      this.hallwayReverbBus.gain.setValueAtTime(foyerAcoustics.wetSendGain, now);
      this.hallwayDelay = ctx.createDelay(1.0);
      this.hallwayDelay.delayTime.setValueAtTime(foyerAcoustics.earlyReflectionDelaySec, now);
      this.hallwayWetFilter = ctx.createBiquadFilter();
      this.hallwayWetFilter.type = 'lowpass';
      this.hallwayWetFilter.frequency.setValueAtTime(foyerAcoustics.wetDampingCutoffHz, now);
      this.hallwayFeedback = ctx.createGain();
      this.hallwayFeedback.gain.setValueAtTime(foyerAcoustics.feedbackGain, now);
      this.hallwayReverbBus.connect(this.hallwayDelay);
      this.hallwayDelay.connect(this.hallwayWetFilter);
      this.hallwayWetFilter.connect(this.hallwayFeedback);
      this.hallwayFeedback.connect(this.hallwayDelay);
      this.hallwayFeedback.connect(this.dcBlocker);

      // 6. Shared Reusable Temple Reverb Send Bus calibrated via AcousticsEngine
      const templeAcoustics = AcousticsEngine.getRoomProfile('TEMPLE');
      this.templeReverbBus = ctx.createGain();
      this.templeReverbBus.gain.setValueAtTime(templeAcoustics.wetSendGain, now);
      this.templeDelay = ctx.createDelay(1.0);
      this.templeDelay.delayTime.setValueAtTime(templeAcoustics.earlyReflectionDelaySec, now);
      this.templeWetFilter = ctx.createBiquadFilter();
      this.templeWetFilter.type = 'lowpass';
      this.templeWetFilter.frequency.setValueAtTime(templeAcoustics.wetDampingCutoffHz, now);
      this.templeFeedback = ctx.createGain();
      this.templeFeedback.gain.setValueAtTime(templeAcoustics.feedbackGain, now);
      this.templeReverbBus.connect(this.templeDelay);
      this.templeDelay.connect(this.templeWetFilter);
      this.templeWetFilter.connect(this.templeFeedback);
      this.templeFeedback.connect(this.templeDelay);
      this.templeFeedback.connect(this.dcBlocker);

      // 7. Shared Reusable BGM Lowpass Filter (eliminates 4 BiquadFilterNode allocations per BGM tick)
      this.bgmFilter = ctx.createBiquadFilter();
      this.bgmFilter.type = 'lowpass';
      this.bgmFilter.frequency.setValueAtTime(1200, now);
      this.bgmFilter.connect(this.dcBlocker);

      // Pre-populate cached white noise buffer once and apply current room acoustics
      this.getWhiteNoiseBuffer(ctx);
      soundCardUnit.reset();
      this.updateRoomAcoustics(this.currentRoom);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
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

  public updateRoomAcoustics(room: 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE'): void {
    this.currentRoom = room;
    if (!this.ctx || !this.dcBlocker || !this.notchFilter || !this.limiter) return;

    const now = this.ctx.currentTime;
    const acousticProfile = AcousticsEngine.getRoomProfile(room);
    const isIndoor = (room === Foyer.room && Foyer.zone === 'INDOOR') || room === 'TEMPLE';
    const isOutdoor = (room === 'GARDEN' && Garden.zone === 'OUTDOOR') || (room === 'PORCH' && FrontPorch.zone === 'OUTDOOR');
    const isRoomIndoor = isIndoor && !isOutdoor && acousticProfile.isIndoor;

    // Smoothly tune shared reusable reverb buses from Eyring RT60 / ISO 9613-1 geometry
    if (this.hallwayReverbBus && this.hallwayDelay && this.hallwayFeedback && this.hallwayWetFilter) {
      if (room !== 'TEMPLE') {
        this.hallwayReverbBus.gain.setTargetAtTime(acousticProfile.wetSendGain, now, 0.025);
        this.hallwayDelay.delayTime.setTargetAtTime(acousticProfile.earlyReflectionDelaySec, now, 0.025);
        this.hallwayFeedback.gain.setTargetAtTime(acousticProfile.feedbackGain, now, 0.025);
        this.hallwayWetFilter.frequency.setTargetAtTime(acousticProfile.wetDampingCutoffHz, now, 0.025);
      }
    }
    if (this.templeReverbBus && this.templeDelay && this.templeFeedback && this.templeWetFilter && room === 'TEMPLE') {
      this.templeReverbBus.gain.setTargetAtTime(acousticProfile.wetSendGain, now, 0.025);
      this.templeDelay.delayTime.setTargetAtTime(acousticProfile.earlyReflectionDelaySec, now, 0.025);
      this.templeFeedback.gain.setTargetAtTime(acousticProfile.feedbackGain, now, 0.025);
      this.templeWetFilter.frequency.setTargetAtTime(acousticProfile.wetDampingCutoffHz, now, 0.025);
    }

    // Disconnect routing to cleanly rebuild the master DSP signal chain
    this.dcBlocker.disconnect();
    this.notchFilter.disconnect();

    if (isRoomIndoor) {
      this.dcBlocker.connect(this.notchFilter);
      this.notchFilter.connect(this.limiter);
    } else {
      this.dcBlocker.connect(this.limiter);
    }
  }

  public setVolume(vol: number) {
    this.rawVolume = Math.max(0, Math.min(1, vol));
  }

  public setMute(mute: boolean) {
    this.isMutedValue = mute;
    if (mute) {
      this.stopBGM();
    } else if (this.currentRoom === 'GARDEN') {
      this.startBGM(this.activeBgmId);
    }
  }

  public isMuted(): boolean {
    return this.isMutedValue;
  }

  // Play a specific SFX voice using Web Audio synthesis with shared reverb buses,
  // cached white-noise buffers, voice throttling, and sample-accurate offsetSec scheduling.
  public playSfx(
    id: number,
    reverb: 'TEMPLE' | 'HALLWAY' | 'NONE' | boolean = false,
    room: 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE' = 'FOYER',
    pitchModifier: number = 1.0,
    offsetSec: number = 0
  ) {
    if (this.isMutedValue) return;
    const isCritical = id === 0 || id === 3 || id === 4 || id === 9 || id === 12 || id === 14;
    const voiceAcquired = soundCardUnit.requestVoice();
    if (!voiceAcquired && !isCritical) {
      return;
    }

    const sfxVol = this.getChannelVolume('sfx');
    let released = false;
    let sfxBus: GainNode | null = null;
    const releaseVoiceOnce = () => {
      if (!released) {
        released = true;
        if (voiceAcquired) soundCardUnit.releaseVoice();
        if (sfxBus) {
          try {
            sfxBus.disconnect();
          } catch {}
        }
      }
    };

    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        releaseVoiceOnce();
        return;
      }
      const now = ctx.currentTime + Math.max(0, offsetSec);
      const masterDest = this.getMasterDestination();

      let destination: AudioNode = masterDest;
      const hasReverb = reverb === true || reverb === 'TEMPLE' || reverb === 'HALLWAY';
      if (hasReverb) {
        const wetBus = reverb === 'HALLWAY' ? this.hallwayReverbBus : this.templeReverbBus;
        if (wetBus) {
          sfxBus = ctx.createGain();
          sfxBus.gain.setValueAtTime(1.0, now);
          sfxBus.connect(masterDest); // Dry path
          sfxBus.connect(wetBus);     // Shared wet send bus (zero DelayNode leak)
          destination = sfxBus;
        }
      }

      const attachLifecycle = (node: AudioScheduledSourceNode) => {
        node.onended = releaseVoiceOnce;
      };

      const createOscGain = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(destination);
        return { osc, gain };
      };

      switch (id) {
        case 0: { // Typical Beagle Bark
          const { osc, gain } = createOscGain();
          const params = BeagleBarkGeneralSFX.parameters;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.base) * pitchModifier, now);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.peak) * pitchModifier, now + 0.05);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.tail) * pitchModifier, now + 0.28);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(this.volume * 1.1, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
          gain.gain.setValueAtTime(0, now + 0.35);
          attachLifecycle(osc);
          osc.start(now);

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(this.upsample64Bit(params.resonance) * pitchModifier, now);
          filter.Q.setValueAtTime(1.5, now);

          const noise = ctx.createBufferSource();
          noise.buffer = this.getWhiteNoiseBuffer(ctx);
          noise.loop = true;

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
          // Streamlined 2-node paw synthesis (1 thud oscillator + 1 filtered surface burst)
          // Eliminates 10-12 AudioNode churn per stride while preserving exact acoustics.
          const { osc, gain } = createOscGain();
          const params = BeagleTrotGeneralSFX.parameters;
          const roomAcoustics = AcousticsEngine.getRoomProfile(room);
          const isTemple = room === 'TEMPLE';
          const isPorch = room === 'PORCH';
          const isGarden = room === 'GARDEN';

          let padVolume = sfxVol * 0.72 * roomAcoustics.impactGainScale;
          let padDuration = params.envelope.padDuration;
          let clawDuration = params.envelope.clawDuration;

          if (isGarden) {
            padVolume = sfxVol * 0.48 * roomAcoustics.impactGainScale;
            padDuration = params.envelope.gardenPadDuration;
          } else if (isPorch) {
            padVolume = sfxVol * 0.85 * roomAcoustics.impactGainScale;
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

          if (isGarden) {
            const noise = ctx.createBufferSource();
            noise.buffer = this.getWhiteNoiseBuffer(ctx);
            noise.loop = true;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(this.upsample64Bit(roomAcoustics.impactBrightnessHz), now);

            const noiseGain = ctx.createGain();
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(destination);
            noiseGain.gain.setValueAtTime(sfxVol * 0.18 * roomAcoustics.impactGainScale, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            noise.start(now);
            noise.stop(now + 0.085);
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
            gainClaw.gain.setValueAtTime(this.volume * (isPorch ? 0.14 : 0.25), now);
            gainClaw.gain.exponentialRampToValueAtTime(0.001, now + clawDuration);

            oscClaw.start(now);
            oscClaw.stop(now + clawDuration + 0.008);
          }

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + padDuration + 0.02);
          break;
        }
        case 3: { // Beagle Jump Swoosh
          const { osc, gain } = createOscGain();
          const params = CollisionGeneralSFX.jump;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.start), now);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.peak), now + 0.2);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.end), now + params.duration);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + params.duration + 0.01);
          break;
        }
        case 4: { // Beagle Landing Thump
          const { osc, gain } = createOscGain();
          const params = CollisionGeneralSFX.landing;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.start), now);
          osc.frequency.linearRampToValueAtTime(this.upsample64Bit(params.end), now + 0.15);

          gain.gain.setValueAtTime(this.volume * 0.9, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + params.duration + 0.01);
          break;
        }
        case 5: { // Happy Whimper
          const { osc, gain } = createOscGain();
          const params = BeagleWhimperGeneralSFX.parameters;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.base) * pitchModifier, now);
          osc.frequency.linearRampToValueAtTime(this.upsample64Bit(params.peak) * pitchModifier, now + 0.1);
          osc.frequency.linearRampToValueAtTime(this.upsample64Bit(params.end) * pitchModifier, now + 0.18);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration + 0.04);

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + params.duration + 0.05);
          break;
        }
        case 6: { // Collar Jingle
          const { osc, gain } = createOscGain();
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

          attachLifecycle(osc);
          osc.start(now);
          oscSub.start(now);
          osc.stop(now + params.jingle.duration);
          oscSub.stop(now + params.jingle.duration);
          break;
        }
        case 7: { // Diamond Sparkle
          const { osc, gain } = createOscGain();
          const params = BeagleCollarGraspGeneralSFX.parameters;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.sparkle.freqs[0]), now);
          osc.frequency.setValueAtTime(this.upsample64Bit(params.sparkle.freqs[1]), now + 0.03);
          osc.frequency.setValueAtTime(this.upsample64Bit(params.sparkle.freqs[2]), now + 0.06);
          osc.frequency.setValueAtTime(this.upsample64Bit(params.sparkle.freqs[3]), now + 0.09);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.sparkle.duration);

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + params.sparkle.duration + 0.02);
          break;
        }
        case 8: { // Fur Pet Rustle
          const { osc, gain } = createOscGain();
          const params = BeaglePettingGeneralSFX.parameters;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.short.freqs[0]), now);
          osc.frequency.setValueAtTime(this.upsample64Bit(params.short.freqs[1]), now + 0.05);
          osc.frequency.setValueAtTime(this.upsample64Bit(params.short.freqs[2]), now + 0.10);

          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.short.duration);

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + params.short.duration + 0.01);
          break;
        }
        case 9: { // Springy Wall Collision
          const { osc, gain } = createOscGain();
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

          attachLifecycle(osc);
          osc.start(now);
          osc2.start(now);
          osc.stop(now + params.duration + 0.05);
          osc2.stop(now + params.duration + 0.05);
          break;
        }
        case 10: { // Blue Tile Step
          const { osc, gain } = createOscGain();
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

          attachLifecycle(osc);
          osc.start(now);
          oscRes.start(now);
          oscGloss.start(now);

          osc.stop(now + params.duration + 0.02);
          oscRes.stop(now + params.duration + 0.02);
          oscGloss.stop(now + 0.08);
          break;
        }
        case 11: { // Green Tile Step
          const { osc, gain } = createOscGain();
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

          attachLifecycle(osc);
          osc.start(now);
          oscRes.start(now);
          oscGloss.start(now);

          osc.stop(now + params.duration + 0.02);
          oscRes.stop(now + params.duration + 0.02);
          oscGloss.stop(now + 0.08);
          break;
        }
        case 12: { // Dual-Tone Confirmations
          const { osc, gain } = createOscGain();
          const dt = DualToneGeneralRegistry.parameters.confirmation;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(dt.freq1), now);
          osc.frequency.setValueAtTime(this.upsample64Bit(dt.freq2), now + 0.08);

          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + dt.duration);

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + dt.duration + 0.01);
          break;
        }
        case 13: { // Height Elevation Whoosh - Transition Tone
          const { osc, gain } = createOscGain();
          const params = SingleToneGeneralRegistry.parameters.doorTransition;
          osc.type = params.wave as OscillatorType;
          osc.frequency.setValueAtTime(this.upsample64Bit(params.frequency), now);
          osc.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.frequency * 1.25), now + 0.15);

          gain.gain.setValueAtTime(this.volume * 0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + params.duration + 0.02);
          break;
        }
        case 14: { // Corridor Reverb Echo
          const { osc, gain } = createOscGain();
          const params = AmbienceGeneralSFX.parameters.portal;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.frequency), now);

          gain.gain.setValueAtTime(0, now);
          params.steps.forEach(step => {
            gain.gain.setValueAtTime(this.volume * step.vol, now + step.time);
          });
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + params.duration + 0.01);
          break;
        }
        case 15: { // Deep Foyer Rumble
          const { osc, gain } = createOscGain();
          const params = AmbienceGeneralSFX.parameters.rumble;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(this.upsample64Bit(params.frequency), now);
          gain.gain.setValueAtTime(this.volume * 0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration);

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + params.duration + 0.01);
          break;
        }
        case 16: { // Fur Stroking Rustle (Long) — reuses shared whiteNoiseBuffer with zero dangling osc
          const params = BeaglePettingGeneralSFX.parameters;
          const noise = ctx.createBufferSource();
          noise.buffer = this.getWhiteNoiseBuffer(ctx);
          noise.loop = true;

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

          attachLifecycle(noise);
          noise.start(now);
          noise.stop(now + params.long.duration);
          break;
        }
        case 17: { // Gallop Scuff (Dual-impact scuff) — reuses shared whiteNoiseBuffer with zero dangling osc
          const params = BeagleGallopGeneralSFX.parameters;
          const isFoyer = room === 'FOYER';
          const isTemple = room === 'TEMPLE';

          const thud = ctx.createOscillator();
          const thudGain = ctx.createGain();
          thud.type = 'triangle';
          thud.frequency.setValueAtTime(this.upsample64Bit(params.thud.freqStart), now);
          thud.frequency.exponentialRampToValueAtTime(this.upsample64Bit(params.thud.freqEnd), now + params.thud.duration);
          thud.connect(thudGain);
          thudGain.connect(destination);
          thudGain.gain.setValueAtTime(this.volume * 0.8, now);
          thudGain.gain.exponentialRampToValueAtTime(0.001, now + params.thud.duration);

          const noise = ctx.createBufferSource();
          noise.buffer = this.getWhiteNoiseBuffer(ctx);
          noise.loop = true;

          const nFilter = ctx.createBiquadFilter();
          nFilter.type = isFoyer || isTemple ? 'highpass' : 'bandpass';
          nFilter.frequency.setValueAtTime(this.upsample64Bit(isFoyer || isTemple ? params.scuff.foyerFreq : params.scuff.gardenFreq), now);

          const nGain = ctx.createGain();
          noise.connect(nFilter);
          nFilter.connect(nGain);
          nGain.connect(destination);
          nGain.gain.setValueAtTime(this.volume * 0.4, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + params.scuff.duration);

          attachLifecycle(thud);
          thud.start(now);
          noise.start(now);
          thud.stop(now + params.thud.duration + 0.01);
          noise.stop(now + params.scuff.duration + 0.01);
          break;
        }
        default: {
          const { osc, gain } = createOscGain();
          const pitchFactor = 1 + (id % 8) * 0.15;
          osc.type = id % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(300 * pitchFactor, now);
          osc.frequency.exponentialRampToValueAtTime(150 * pitchFactor, now + 0.15);

          gain.gain.setValueAtTime(this.volume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

          attachLifecycle(osc);
          osc.start(now);
          osc.stop(now + 0.20);
          break;
        }
      }
    } catch (e) {
      releaseVoiceOnce();
      console.warn('Could not play synthesized sound:', e);
    }
  }

  /**
   * Consolidated 4-beat gallop stride scheduler: creates 4 compact beats inside a single voice slot
   * instead of spawning 60+ Web Audio nodes in a single frame.
   */
  public playGallopCycle(
    reverb: 'TEMPLE' | 'HALLWAY' | 'NONE' = 'NONE',
    room: 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE' = 'FOYER'
  ): void {
    if (this.isMutedValue) return;
    if (!soundCardUnit.requestVoice()) return;

    const sfxVol = this.getChannelVolume('sfx');
    let released = false;
    let sfxBus: GainNode | null = null;
    const releaseOnce = () => {
      if (!released) {
        released = true;
        soundCardUnit.releaseVoice();
        if (sfxBus) {
          try { sfxBus.disconnect(); } catch {}
        }
      }
    };

    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        releaseOnce();
        return;
      }
      const baseTime = ctx.currentTime;
      const masterDest = this.getMasterDestination();
      let destination: AudioNode = masterDest;

      if (reverb === 'TEMPLE' || reverb === 'HALLWAY') {
        const wetBus = reverb === 'HALLWAY' ? this.hallwayReverbBus : this.templeReverbBus;
        if (wetBus) {
          sfxBus = ctx.createGain();
          sfxBus.gain.setValueAtTime(1.0, baseTime);
          sfxBus.connect(masterDest);
          sfxBus.connect(wetBus);
          destination = sfxBus;
        }
      }

      const params = BeagleGallopGeneralSFX.parameters;
      const trotParams = BeagleTrotGeneralSFX.parameters;
      const roomAcoustics = AcousticsEngine.getRoomProfile(room);
      const beatOffsets = [0, 0.06, 0.12, 0.18];
      const baseVol = sfxVol * (room === 'GARDEN' ? 0.52 : 0.78) * roomAcoustics.impactGainScale;

      for (let i = 0; i < 4; i++) {
        const t = baseTime + beatOffsets[i];
        const thud = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thud.type = 'triangle';
        const fStart = (i & 1) === 0 ? trotParams.baseFrequencies.left : trotParams.baseFrequencies.right;
        thud.frequency.setValueAtTime(fStart * 1.15, t);
        thud.frequency.exponentialRampToValueAtTime(params.thud.freqEnd, t + params.thud.duration);
        thud.connect(thudGain);
        thudGain.connect(destination);
        thudGain.gain.setValueAtTime(baseVol, t);
        thudGain.gain.exponentialRampToValueAtTime(0.001, t + params.thud.duration);
        if (i === 3) {
          thud.onended = releaseOnce;
        }
        thud.start(t);
        thud.stop(t + params.thud.duration + 0.01);
      }
    } catch {
      releaseOnce();
    }
  }

  /**
   * Starts procedural Garden BGM using a sample-accurate Web Audio currentTime lookahead scheduler.
   * Eliminates wall-clock setInterval tempo slowing/stuttering during heavy render frames.
   */
  public startBGM(presetId: number) {
    if (this.isMutedValue) {
      this.activeBgmId = presetId;
      return;
    }
    if (this.bgmIntervalId !== null && this.activeBgmId === presetId) {
      return;
    }

    this.activeBgmId = presetId;
    this.stopBGM();

    try {
      const ctx = this.getContext();
      const tempo = BGMGeneralRegistry.tempo;
      const stepSec = (60 / tempo) * 0.5;
      const lookaheadSec = 0.12;

      this.currentStep = 0;
      this.nextBgmNoteTime = ctx.currentTime + 0.02;

      const scheduleWindow = () => {
        if (this.isMutedValue || ctx.state === 'suspended') return;
        // Clamp runaway catch-up if tab was backgrounded
        if (this.nextBgmNoteTime < ctx.currentTime - 0.1) {
          this.nextBgmNoteTime = ctx.currentTime + 0.02;
        }
        while (this.nextBgmNoteTime < ctx.currentTime + lookaheadSec) {
          this.playBgmStep(ctx, presetId, this.nextBgmNoteTime);
          this.nextBgmNoteTime += stepSec;
        }
      };

      scheduleWindow();
      this.bgmIntervalId = setInterval(scheduleWindow, 45);
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

  private playBgmStep(ctx: AudioContext, presetId: number, scheduledTime?: number) {
    if (this.isMutedValue) return;
    const bgmVol = this.getChannelVolume('bgm');
    const now = scheduledTime !== undefined ? scheduledTime : ctx.currentTime;

    const cMajor = BGMGeneralRegistry.scales.cMajor;
    const pentatonic = BGMGeneralRegistry.scales.pentatonic;

    let noteIndex = 0;
    let waveType: OscillatorType = 'sine';
    let filterFreq = 1200;
    let noteVolume = bgmVol * 0.15;
    
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
        noteVolume = bgmVol * 0.22;
        break;

      case 2:
        noteIndex = (10 + (step * 7) % 6) % pentatonic.length;
        waveType = 'sine';
        noteVolume = bgmVol * 0.12;
        break;

      case 3:
        noteIndex = (step % 4 === 0 ? 0 : step % 3 === 1 ? 4 : 2);
        waveType = 'triangle';
        noteVolume = bgmVol * 0.28;
        break;

      case 4:
        if (step % 4 !== 0) {
          this.currentStep++;
          return;
        }
        noteIndex = (step % 12) % cMajor.length;
        waveType = 'sine';
        noteVolume = bgmVol * 0.25;
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

      const bgmDest = this.bgmFilter || this.getMasterDestination();
      if (this.bgmFilter) {
        this.bgmFilter.frequency.setValueAtTime(filterFreq, now);
      }

      for (let i = 0; i < chordVoices.length; i++) {
        const voice = chordVoices[i];
        try {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = voice.type;
          osc.frequency.setValueAtTime(voice.frequency, now + voice.delay);

          osc.connect(gainNode);
          gainNode.connect(bgmDest);

          const currentVol = noteVolume * voice.volumeFactor;
          gainNode.gain.setValueAtTime(0, now + voice.delay);
          gainNode.gain.linearRampToValueAtTime(currentVol, now + voice.delay + 0.04);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + voice.delay + voice.duration - 0.02);

          osc.onended = () => {
            try { gainNode.disconnect(); } catch {}
          };
          osc.start(now + voice.delay);
          osc.stop(now + voice.delay + voice.duration);
        } catch (_) {}
      }
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
