/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';
export * from './VGA/index';
export * from './3.5MM/index';
export * from './AV/index';
export * from './S-Video/index';

import { vgaOutputController } from './VGA/index';
import { audio35mmOutputController } from './3.5MM/index';
import { avOutputController } from './AV/index';
import { sVideoOutputController } from './S-Video/index';

export class AnalogOutputSubsystem {
  public getAllAnalogPorts() {
    return [
      vgaOutputController.getStatus(),
      audio35mmOutputController.getStatus(),
      avOutputController.getStatus(),
      sVideoOutputController.getStatus()
    ];
  }
}

export const analogOutputSubsystem = new AnalogOutputSubsystem();
