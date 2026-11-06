/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sound Card Virtualization: Audio Voice Throttler.
 * Clamps concurrent Web Audio nodes to maintain signal integrity and prevent CPU stalls.
 */
export class HardwareAudioThrottler {
  private activeVoices: number = 0;
  private readonly MAX_VOICES: number = 16;

  public requestVoice(): boolean {
    if (this.activeVoices >= this.MAX_VOICES) return false;
    this.activeVoices++;
    return true;
  }

  public releaseVoice(): void {
    this.activeVoices = Math.max(0, this.activeVoices - 1);
  }
}

export const soundCardUnit = new HardwareAudioThrottler();
export default soundCardUnit;
