/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APMHardwareCapabilities } from '../General/index';

/**
 * Universal Hardware Identification and Peripheral Probing Subsystem.
 * Inspects host GPU capabilities, memory vectors, audio contexts, display matrices, and peripherals.
 */
export class AnyHardwareIdentifier {
  private static instance: AnyHardwareIdentifier | null = null;
  private cachedCapabilities: APMHardwareCapabilities | null = null;

  public static getInstance(): AnyHardwareIdentifier {
    if (!AnyHardwareIdentifier.instance) {
      AnyHardwareIdentifier.instance = new AnyHardwareIdentifier();
    }
    return AnyHardwareIdentifier.instance;
  }

  public probeHardware(): APMHardwareCapabilities {
    if (this.cachedCapabilities) {
      return this.cachedCapabilities;
    }

    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';

    const maxTouchPoints = isBrowser && navigator.maxTouchPoints ? navigator.maxTouchPoints : 0;
    const hardwareConcurrency = isBrowser && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
    const deviceMemoryGB = isBrowser && (navigator as unknown as { deviceMemory?: number }).deviceMemory ? (navigator as unknown as { deviceMemory?: number }).deviceMemory! : 8;
    const pixelRatio = isBrowser && window.devicePixelRatio ? window.devicePixelRatio : 1.0;
    const colorDepth = isBrowser && window.screen && window.screen.colorDepth ? window.screen.colorDepth : 24;

    let hasWebGL2 = false;
    let hasWebGPU = false;
    let hasWebAudio = false;

    if (isBrowser) {
      try {
        const canvas = document.createElement('canvas');
        hasWebGL2 = !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
      } catch {
        hasWebGL2 = false;
      }

      hasWebGPU = !!(navigator as unknown as { gpu?: unknown }).gpu;
      hasWebAudio = typeof AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined';
    }

    const hasGamepads = isBrowser && typeof navigator.getGamepads === 'function';

    this.cachedCapabilities = {
      maxTouchPoints,
      hardwareConcurrency,
      deviceMemoryGB,
      hasWebGL2,
      hasWebGPU,
      hasWebAudio,
      hasGamepads,
      colorDepth,
      pixelRatio,
      refreshRateEstimate: 60
    };

    return this.cachedCapabilities;
  }

  public resetCache(): void {
    this.cachedCapabilities = null;
  }
}

export const anyHardwareIdentifier = AnyHardwareIdentifier.getInstance();
export default anyHardwareIdentifier;
