/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThelmaDescription } from '../../../../../Character/Beagle/Thelma/Description/index';
import { BeagleSpecs } from '../../../../../types';

export const ThelmaRegistryEntry: {
  spec: BeagleSpecs;
  description: typeof ThelmaDescription;
} = {
  spec: {
    id: 'THELMA',
    name: 'Thelma',
    gender: 'Female',
    breed: 'Beagle',
    color: 'Red with a White saddle mark',
    shoulderHeightFeet: 6,
    shoulderHeightInches: 0,
    widthInches: 40,
    lengthFeet: 8,
    skinColor: 'Red',
    noseColor: 'Dark-Brown',
    eyeColor: 'Light Green',
    headWidthInches: 36.5,
    headHeightInches: 46,
    collarColor: 'Purple',
    collarDecorations: 'yellow vertical diamonds',
    tailStyle: 'Horse-tail mobile white (20% thickness)',
    padColor: 'Dark-brown',
    barkPitchModifier: 1.15,
    furThicknessFactor: 1.15,
    hasMane: true,
    maneColor: 'white',
    earColor: 'Dark-brown',
    innerEarColor: 'Peach',
    petDescription: "You pet Thelma's thick fur by stroking from ears to neck.",
    petSfxId: 16
  },
  description: ThelmaDescription
};

export * from '../../../../../Character/Beagle/Thelma/Description/index';
