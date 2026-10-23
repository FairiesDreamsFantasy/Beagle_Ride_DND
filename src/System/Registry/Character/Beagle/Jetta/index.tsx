/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JettaDescription } from '../../../../../Character/Beagle/Jetta/Description/index';
import { BeagleSpecs } from '../../../../../types';

export const JettaRegistryEntry: {
  spec: BeagleSpecs;
  description: typeof JettaDescription;
} = {
  spec: {
    id: 'JETTA',
    name: 'Jetta',
    gender: 'Female',
    breed: 'Beagle',
    color: 'White with a Red-Orange Saddle',
    shoulderHeightFeet: 5,
    shoulderHeightInches: 2,
    widthInches: 36,
    lengthFeet: 7,
    skinColor: 'Peach',
    noseColor: 'White/Red-Orange',
    eyeColor: 'Dark-Blue',
    headWidthInches: 36,
    headHeightInches: 40,
    collarColor: 'Blue',
    collarDecorations: 'yellow circles',
    tailStyle: 'Upright 30 degree angle',
    padColor: 'Dark-Pink',
    barkPitchModifier: 1.0,
    furThicknessFactor: 1.0,
    hasMane: false,
    earColor: 'Red-Orange',
    innerEarColor: 'Peach',
    petDescription: "Petting Jetta's head. She closes her deep-blue eyes with delight!",
    petSfxId: 5
  },
  description: JettaDescription
};

export * from '../../../../../Character/Beagle/Jetta/Description/index';
