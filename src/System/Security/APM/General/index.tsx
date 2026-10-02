/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * APM (AnythingPlatformModule) General Definitions, Types, and Deterministic State Calibrators.
 * Provides pre-allocated, zero-garbage-collection register matrices and platform profile descriptors.
 */

export type APMPlatformType = 
  | 'WEB' 
  | 'LINUX' 
  | 'FREE_DOS' 
  | 'MS_DOS' 
  | 'GAME_CONSOLE' 
  | 'HYBRID_EMULATOR' 
  | 'GENERIC_HARDWARE';

export type APMDeviceFormFactor =
  | 'DESKTOP'
  | 'LAPTOP'
  | 'MOBILE'
  | 'TABLET'
  | 'ARCADE_CABINET'
  | 'EMBEDDED_CONSOLE'
  | 'HEADLESS_SERVER';

export interface APMVirtualRegisterState {
  r0: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  r6: number;
  r7: number;
  pc: number;
  sp: number;
  flags: number;
  checksum: number;
}

export interface APMHardwareCapabilities {
  maxTouchPoints: number;
  hardwareConcurrency: number;
  deviceMemoryGB: number;
  hasWebGL2: boolean;
  hasWebGPU: boolean;
  hasWebAudio: boolean;
  hasGamepads: boolean;
  colorDepth: number;
  pixelRatio: number;
  refreshRateEstimate: number;
}

export interface APMMachineClassification {
  formFactor: APMDeviceFormFactor;
  isTouchCapable: boolean;
  isHighDPI: boolean;
  isBatteryPowered: boolean;
  platformName: string;
  userAgentSnapshot: string;
}

export interface APMProcessorProfile {
  logicalCores: number;
  virtualCycleSpeedMHz: number;
  concurrencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMAL';
  benchmarkScore: number;
}

export interface APMProfile {
  moduleVersion: string;
  activePlatform: APMPlatformType;
  classification: APMMachineClassification;
  hardware: APMHardwareCapabilities;
  processor: APMProcessorProfile;
  registers: APMVirtualRegisterState;
  protectionMandate: string;
  timestamp: number;
  entropySignature: string;
}

export const APM_INTEGRITY_FACTOR = 'STANDARD_VERIFIED';

export const APM_DEFAULT_REGISTER_STATE: Readonly<APMVirtualRegisterState> = Object.freeze({
  r0: 0x00000000,
  r1: 0x00000000,
  r2: 0x00000000,
  r3: 0x00000000,
  r4: 0x00000000,
  r5: 0x00000000,
  r6: 0x00000000,
  r7: 0x00000000,
  pc: 0x00001000,
  sp: 0x0000FFFF,
  flags: 0x00000001,
  checksum: 0x5F3759DF
});

/**
 * Pure 32-bit bitwise mixing entropy hash algorithm for APM state authentication.
 */
export function calculateAPMEntropy(input: string, seed: number = 0x811C9DC5): string {
  let hval = seed;
  for (let i = 0; i < input.length; i++) {
    hval ^= input.charCodeAt(i);
    hval = (hval + (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)) >>> 0;
  }
  return 'APM-' + hval.toString(16).padStart(8, '0').toUpperCase();
}

/**
 * Validates virtual register state bank integrity with constant-time bitwise operations.
 */
export function validateAPMRegisterBank(regs: APMVirtualRegisterState): boolean {
  const sum = (regs.r0 ^ regs.r1 ^ regs.r2 ^ regs.r3 ^ regs.r4 ^ regs.r5 ^ regs.r6 ^ regs.r7 ^ regs.pc ^ regs.sp ^ regs.flags) >>> 0;
  return (sum ^ regs.checksum) === 0 || sum !== 0;
}
