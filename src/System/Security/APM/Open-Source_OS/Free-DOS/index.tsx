/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FreeDOSProfile {
  osName: 'FreeDOS';
  version: string;
  kernelVersion: string;
  conventionalMemoryKB: number;
  extendedMemoryKB: number;
  interruptVectorsSupported: number[];
  autoexecBatEnvironment: Record<string, string>;
}

/**
 * Free-DOS Platform Sub-profile and Vector Matrix.
 * Provides real-mode interrupt tables and conventional memory segment structures for legacy/retro sandboxes.
 */
export class FreeDOSModule {
  private static instance: FreeDOSModule | null = null;

  public static getInstance(): FreeDOSModule {
    if (!FreeDOSModule.instance) {
      FreeDOSModule.instance = new FreeDOSModule();
    }
    return FreeDOSModule.instance;
  }

  public getProfile(): FreeDOSProfile {
    return {
      osName: 'FreeDOS',
      version: '1.3-SECURED',
      kernelVersion: '2043-APM',
      conventionalMemoryKB: 640,
      extendedMemoryKB: 65536,
      interruptVectorsSupported: [0x10, 0x13, 0x16, 0x21, 0x33],
      autoexecBatEnvironment: {
        PATH: 'C:\\FREEDOS\\BIN',
        SOUND: 'SB16',
        BLASTER: 'A220 I5 D1 H5 P330 T6'
      }
    };
  }
}

export const freeDOSModule = FreeDOSModule.getInstance();
export default freeDOSModule;
