/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Standalone Beagle Character Registry & Kinematics Module
 */

export const StandaloneBeagles = {
  Jetta: {
    id: 'JETTA',
    name: 'Jetta',
    shoulderHeightFeet: 5.17, // 5'2"
    lengthFeet: 7.0,
    widthInches: 36,
    coat: 'White with red-orange saddle',
    collar: 'Blue with yellow circles',
    barkPitchMultiplier: 1.0,
    strideVelocity: 1.0
  },
  Elsa: {
    id: 'ELSA',
    name: 'Elsa',
    shoulderHeightFeet: 5.33, // 5'4"
    lengthFeet: 7.0,
    widthInches: 36,
    coat: 'Yellow with dark-pink saddle',
    collar: 'Standard',
    barkPitchMultiplier: 0.88,
    strideVelocity: 0.96
  },
  Thelma: {
    id: 'THELMA',
    name: 'Thelma',
    shoulderHeightFeet: 6.0, // 6'0"
    lengthFeet: 8.0,
    widthInches: 40,
    coat: 'Red with white saddle',
    accessories: ['Tiara', 'Purple collar with yellow diamonds'],
    hasMane: true,
    barkPitchMultiplier: 0.82,
    strideVelocity: 1.05
  },
  Tina: {
    id: 'TINA',
    name: 'Tina',
    shoulderHeightFeet: 5.0, // 5'0"
    lengthFeet: 6.5,
    widthInches: 36,
    coat: 'Light-blue with dark-pink circular saddle',
    accessories: ['Earrings', 'Green collar with vertical orange ovals'],
    barkPitchMultiplier: 1.15,
    strideVelocity: 1.02
  }
};

export default StandaloneBeagles;
