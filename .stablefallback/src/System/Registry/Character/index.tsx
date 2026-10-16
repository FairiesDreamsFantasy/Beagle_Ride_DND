/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BeagleRegistry } from './Beagle';
import { RiderRegistry } from './Rider';
import { CharacterInteractionEngine } from './Interaction/index';

export { BeagleRegistry } from './Beagle';
export { RiderRegistry } from './Rider';
export * from './Interaction/index';

/**
 * Character Registry Management.
 */
export const CharacterRegistry = {
  Beagles: BeagleRegistry,
  Riders: RiderRegistry,
  Interaction: CharacterInteractionEngine
};
