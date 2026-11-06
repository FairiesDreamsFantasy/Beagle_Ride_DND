/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TinaDescription } from '../../../../../Character/Beagle/Tina/Description/index';
import { BeagleSpecs } from '../../../../../types';

export const TinaRegistryEntry: {
  spec: BeagleSpecs;
  description: typeof TinaDescription;
} = {
  spec: {
    id: 'TINA',
    name: 'Tina',
    gender: 'Female',
    breed: 'Beagle',
    color: 'Light-Blue with a dark-pink round saddle mark',
    shoulderHeightFeet: 5,
    shoulderHeightInches: 0,
    widthInches: 36,
    lengthFeet: 6.5,
    skinColor: 'Light-Blue',
    noseColor: 'Dark-Pink',
    eyeColor: 'Dark-Green',
    headWidthInches: 34,
    headHeightInches: 45,
    collarColor: 'Green',
    collarDecorations: 'vertical orange ovals',
    tailStyle: 'Upright quarter-pipe curve',
    padColor: 'Dark-Pink',
    barkPitchModifier: 1.61,
    furThicknessFactor: 1.0,
    hasMane: false,
    earColor: 'Dark-Blue',
    innerEarColor: 'Indigo',
    petDescription: "You pet Tina by stroking her fur from ears to neck. She wags her tail with delight.",
    petSfxId: 16
  },
  description: TinaDescription
};

export * from '../../../../../Character/Beagle/Tina/Description/index';
