/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './Free-DOS/index';
export * from './Linux/index';

import { freeDOSModule, FreeDOSProfile } from './Free-DOS/index';
import { linuxOSModule, LinuxKernelProfile } from './Linux/index';

export interface OpenSourceOSAggregatedProfile {
  isOpenSourceDetected: boolean;
  freeDOS: FreeDOSProfile;
  linux: LinuxKernelProfile;
  posixCompliant: boolean;
}

/**
 * Open-Source OS Matrix Aggregator.
 * Unifies Free-DOS and Linux subsystem identifiers under a deterministic evaluation pipeline.
 */
export class OpenSourceOSDetector {
  private static instance: OpenSourceOSDetector | null = null;

  public static getInstance(): OpenSourceOSDetector {
    if (!OpenSourceOSDetector.instance) {
      OpenSourceOSDetector.instance = new OpenSourceOSDetector();
    }
    return OpenSourceOSDetector.instance;
  }

  public getAggregatedProfile(): OpenSourceOSAggregatedProfile {
    const freeDOS = freeDOSModule.getProfile();
    const linux = linuxOSModule.detectLinuxEnvironment();

    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const isLinuxPlatform = isBrowser ? /Linux|X11/i.test(navigator.userAgent || navigator.platform || '') : true;

    return {
      isOpenSourceDetected: isLinuxPlatform,
      freeDOS,
      linux,
      posixCompliant: linux.hasPOSIXSignals || isLinuxPlatform
    };
  }
}

export const openSourceOSDetector = OpenSourceOSDetector.getInstance();
export default openSourceOSDetector;
