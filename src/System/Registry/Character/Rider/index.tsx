/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RiderSpecs } from '../../../../types';

/**
 * Rider Character Registry.
 * Migrated from legacy data folder for enhanced precision.
 */
export const RiderRegistry: RiderSpecs[] = [
  {
    id: 'FAIRY_RIDER',
    name: 'Fairy-Rider',
    description: 'Default Rider',
    skinColor: '#3E2723',
    primaryColor: '#2196F3',
    eyeHeight: 5.17,
    hasTrianglesOnLegs: true
  },
  {
    id: 'MARY',
    name: 'Mary',
    description: 'Puffy Dress',
    skinColor: '#FFCCBC',
    primaryColor: '#F06292',
    eyeHeight: 6.0,
    hasPuffyShoulders: true
  }
];
