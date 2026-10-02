/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './MSDOS/index';

import { msdosModule, MSDOSRealModeProfile } from './MSDOS/index';

export interface OSProfileAggregator {
  msdos: MSDOSRealModeProfile;
  isLegacyOSEmulated: boolean;
}

/**
 * Operating System Architecture Aggregator.
 * Unifies extended and retro operating system profiles (e.g., MS-DOS).
 */
export class OSDetector {
  private static instance: OSDetector | null = null;

  public static getInstance(): OSDetector {
    if (!OSDetector.instance) {
      OSDetector.instance = new OSDetector();
    }
    return OSDetector.instance;
  }

  public getOSProfile(): OSProfileAggregator {
    return {
      msdos: msdosModule.getRealModeProfile(),
      isLegacyOSEmulated: true
    };
  }
}

export const osDetector = OSDetector.getInstance();
export default osDetector;
