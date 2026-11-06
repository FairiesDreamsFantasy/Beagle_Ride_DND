/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Sound/BGM/Ambience/Mains_Power_Hum/index.tsx
 * Ultra-Scientific Master Mains Power Hum Ambience Architecture
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export * from './General/index';
export * from './Type_A/index';

import { typeAMainsHumController } from './Type_A/index';
import { MainsPowerHumGeneralConfig } from './General/index';

/**
 * Master Mains Power Hum Manager.
 */
export class MasterMainsPowerHumManager {
  public static startHum(volume: number = 0.15): boolean {
    return typeAMainsHumController.start(volume);
  }

  public static stopHum(fadeSec: number = 0.5): void {
    typeAMainsHumController.stop(fadeSec);
  }

  public static getConfiguration() {
    return MainsPowerHumGeneralConfig;
  }
}

export default MasterMainsPowerHumManager;
