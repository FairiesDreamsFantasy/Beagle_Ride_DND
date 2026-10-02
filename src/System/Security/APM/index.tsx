/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';
export * from './Any_Hardware/index';
export * from './Any_Machine/index';
export * from './Any_Processor/index';
export * from './Game_Consoles/index';
export * from './Open-Source_OS/index';
export * from './OS/index';

import {
  APMProfile,
  APMVirtualRegisterState,
  APM_DEFAULT_REGISTER_STATE,
  APM_INTEGRITY_FACTOR,
  calculateAPMEntropy,
  validateAPMRegisterBank
} from './General/index';
import { anyHardwareIdentifier } from './Any_Hardware/index';
import { anyMachineClassifier } from './Any_Machine/index';
import { anyProcessorProfiler } from './Any_Processor/index';
import { gameConsoleMatrixController } from './Game_Consoles/index';
import { openSourceOSDetector } from './Open-Source_OS/index';
import { osDetector } from './OS/index';

/**
 * Master AnythingPlatformModuleController Orchestrator Singleton.
 * Coordinates platform probing, virtual hardware register arrays, and deterministic cryptographic state validation.
 */
export class AnythingPlatformModuleController {
  private static instance: AnythingPlatformModuleController | null = null;
  private registerBank: APMVirtualRegisterState = { ...APM_DEFAULT_REGISTER_STATE };
  private currentProfile: APMProfile | null = null;
  private probeCount: number = 0;

  private constructor() {
    this.recalibrateRegisterChecksum();
  }

  public static getInstance(): AnythingPlatformModuleController {
    if (!AnythingPlatformModuleController.instance) {
      AnythingPlatformModuleController.instance = new AnythingPlatformModuleController();
    }
    return AnythingPlatformModuleController.instance;
  }

  /**
   * Recalculates register checksum to maintain deterministic state integrity.
   */
  private recalibrateRegisterChecksum(): void {
    const r = this.registerBank;
    r.checksum = (r.r0 ^ r.r1 ^ r.r2 ^ r.r3 ^ r.r4 ^ r.r5 ^ r.r6 ^ r.r7 ^ r.pc ^ r.sp ^ r.flags) >>> 0;
  }

  /**
   * Performs full platform probing across all APM hardware, machine, processor, and OS subsystems.
   */
  public probeFullPlatform(): APMProfile {
    this.probeCount++;
    const hardware = anyHardwareIdentifier.probeHardware();
    const classification = anyMachineClassifier.classifyMachine();
    const processor = anyProcessorProfiler.profileProcessor();
    const consoleProfile = gameConsoleMatrixController.probeConsoleEnvironment();
    const openSourceProfile = openSourceOSDetector.getAggregatedProfile();
    const osProfile = osDetector.getOSProfile();

    let activePlatform: APMProfile['activePlatform'] = 'WEB';
    if (openSourceProfile.linux.osName === 'Linux' && openSourceProfile.isOpenSourceDetected) {
      activePlatform = 'LINUX';
    } else if (consoleProfile.connectedGamepadsCount > 0) {
      activePlatform = 'GAME_CONSOLE';
    } else if (osProfile.msdos.osName === 'MS-DOS' && osProfile.isLegacyOSEmulated) {
      activePlatform = 'HYBRID_EMULATOR';
    }

    const timestamp = Date.now();
    const entropySeed = `${activePlatform}:${classification.formFactor}:${hardware.hardwareConcurrency}:${processor.virtualCycleSpeedMHz}:${timestamp}:${this.probeCount}`;
    const entropySignature = calculateAPMEntropy(entropySeed);

    this.registerBank.r0 = (hardware.hardwareConcurrency & 0xFF) | ((hardware.deviceMemoryGB & 0xFF) << 8);
    this.registerBank.r1 = processor.benchmarkScore & 0xFFFFFFFF;
    this.registerBank.r2 = consoleProfile.connectedGamepadsCount & 0xFF;
    this.registerBank.r3 = (timestamp & 0xFFFFFFFF) >>> 0;
    this.registerBank.pc = 0x00001000 + (this.probeCount * 0x10);
    this.recalibrateRegisterChecksum();

    this.currentProfile = {
      moduleVersion: '1.0.0-FORTIFIED',
      activePlatform,
      classification,
      hardware,
      processor,
      registers: { ...this.registerBank },
      protectionMandate: APM_INTEGRITY_FACTOR,
      timestamp,
      entropySignature
    };

    return this.currentProfile;
  }

  /**
   * Reads current APM virtual register state.
   */
  public getRegisterState(): Readonly<APMVirtualRegisterState> {
    return { ...this.registerBank };
  }

  /**
   * Validates state bank integrity.
   */
  public validateIntegrity(): boolean {
    return validateAPMRegisterBank(this.registerBank);
  }

  /**
   * Returns cached profile or executes probe if uninitialized.
   */
  public getProfile(): APMProfile {
    if (!this.currentProfile) {
      return this.probeFullPlatform();
    }
    return this.currentProfile;
  }
}

export const anythingPlatformModuleController = AnythingPlatformModuleController.getInstance();
export default anythingPlatformModuleController;
