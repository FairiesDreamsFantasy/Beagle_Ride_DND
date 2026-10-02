/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MSDOSRealModeProfile {
  osName: 'MS-DOS';
  version: string;
  biosInterrupts: number[];
  xmsPagesAvailable: number;
  emsFrameSegment: number;
  videoMode: 'VGA_MODE_13H' | 'EGA' | 'CGA' | 'TEXT_80x25';
}

/**
 * MSDOS Retro/Legacy Architecture Sub-profile.
 * Emulates 16-bit real mode memory structures, BIOS interrupts, and extended memory descriptors.
 */
export class MSDOSModule {
  private static instance: MSDOSModule | null = null;

  public static getInstance(): MSDOSModule {
    if (!MSDOSModule.instance) {
      MSDOSModule.instance = new MSDOSModule();
    }
    return MSDOSModule.instance;
  }

  public getRealModeProfile(): MSDOSRealModeProfile {
    return {
      osName: 'MS-DOS',
      version: '6.22-COMPATIBLE',
      biosInterrupts: [0x10, 0x13, 0x16, 0x21, 0x2F, 0x33],
      xmsPagesAvailable: 1024,
      emsFrameSegment: 0xE000,
      videoMode: 'VGA_MODE_13H'
    };
  }
}

export const msdosModule = MSDOSModule.getInstance();
export default msdosModule;
