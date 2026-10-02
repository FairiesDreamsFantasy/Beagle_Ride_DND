/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReverbGeneric } from './Generic';
import { ReverbHallway } from './Hallway';
import { ReverbStoneRoom } from './Stone_Room';

/**
 * Reverb Profiles Registry.
 * High-precision mathematical acoustic simulations.
 */
export const ReverbProfiles = {
  Generic: ReverbGeneric,
  Hallway: ReverbHallway,
  StoneRoom: ReverbStoneRoom,
  version: '1.0.0'
};
