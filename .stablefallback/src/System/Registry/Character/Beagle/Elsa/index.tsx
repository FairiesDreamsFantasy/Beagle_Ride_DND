/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ElsaDescription } from '../../../../../Character/Beagle/Elsa/Description/index';
import { BeagleSpecs } from '../../../../../types';

export const ElsaRegistryEntry: {
  spec: BeagleSpecs;
  description: typeof ElsaDescription;
} = {
  spec: {
    id: 'ELSA',
    name: 'Elsa',
    gender: 'Female',
    breed: 'Beagle',
    color: 'Yellow with Dark-Pink rounded saddle mark',
    shoulderHeightFeet: 5,
    shoulderHeightInches: 4,
    widthInches: 40,
    lengthFeet: 7,
    skinColor: 'Yellow',
    noseColor: 'Dark-Pink',
    eyeColor: 'Indigo',
    headWidthInches: 38,
    headHeightInches: 42,
    collarColor: 'Brown',
    collarDecorations: 'bronze 5-point stars',
    tailStyle: 'Quarter-pipe curve upward',
    padColor: 'Reddish-Brown',
    barkPitchModifier: 1.05,
    furThicknessFactor: 1.05,
    hasMane: true,
    maneColor: 'dark yellow',
    earColor: 'Orange',
    innerEarColor: 'Pink',
    petDescription: "You pet Elsa's thick fur by stroking from ears to neck.",
    petSfxId: 16
  },
  description: ElsaDescription
};

export * from '../../../../../Character/Beagle/Elsa/Description/index';
