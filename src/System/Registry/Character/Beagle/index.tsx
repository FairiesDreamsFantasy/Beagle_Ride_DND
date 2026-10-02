/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BeagleSpecs } from '../../../../types';
import { JettaRegistryEntry } from './Jetta/index';
import { ElsaRegistryEntry } from './Elsa/index';
import { ThelmaRegistryEntry } from './Thelma/index';
import { TinaRegistryEntry } from './Tina/index';

export * from './Jetta/index';
export * from './Elsa/index';
export * from './Thelma/index';
export * from './Tina/index';

/**
 * Beagle Character Registry.
 * Modular registry aggregating individual Beagle character specifications.
 */
export const BeagleRegistry: BeagleSpecs[] = [
  JettaRegistryEntry.spec,
  ElsaRegistryEntry.spec,
  ThelmaRegistryEntry.spec,
  TinaRegistryEntry.spec
];

