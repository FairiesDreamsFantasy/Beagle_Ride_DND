/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'LANDING' | 'CHARACTER_SELECTION' | 'BEAGLE_SELECTION' | 'PLAYING';

export type BeagleId = 'JETTA' | 'ELSA' | 'THELMA' | 'TINA';

export type RiderId = 'FAIRY_RIDER' | 'MARY';

export interface RiderSpecs {
  id: RiderId;
  name: string;
  description: string;
  skinColor: string;
  primaryColor: string;
  eyeHeight: number;
  hasTrianglesOnLegs?: boolean;
  hasPuffyShoulders?: boolean;
}

export type CardinalDirection = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export interface Position {
  x: number;
  y: number;
  direction: CardinalDirection;
  angle: number; // 0, 90, 180, 270
}

export type HandState = 'DEFAULT' | 'GRASPING' | 'PETTING';

export interface BeagleSpecs {
  id: BeagleId;
  name: string;
  gender: 'Male' | 'Female';
  breed: string;
  color: string;
  shoulderHeightFeet: number;
  shoulderHeightInches: number;
  widthInches: number;
  lengthFeet: number;
  skinColor: string;
  noseColor: string;
  eyeColor: string;
  headWidthInches: number;
  headHeightInches: number;
  collarColor: string;
  collarDecorations: string;
  tailStyle: string;
  padColor: string;
  barkPitchModifier: number;
  furThicknessFactor: number;
  hasMane: boolean;
  maneColor?: string;
  earColor: string;
  innerEarColor: string;
  petDescription: string;
  petSfxId: number;
}

export interface SoundVoice {
  id: number;
  name: string;
  description: string;
  type: 'sfx' | 'bgm';
}

export type ViewMode = 'POV' | 'RIDER';

export interface GameSettings {
  ttsEnabled: boolean;
  jumpNotificationsEnabled: boolean;
  barkNotificationsEnabled: boolean;
  volume: number;
  activeSfxVoice: number; // 0 - 31
  activeBgmVoice: number; // 0 - 31
  isMuted: boolean;
  paused: boolean;
  turningTonesEnabled: boolean;
  pettingDescriptionsEnabled: boolean;
  collarGraspDescriptionsEnabled: boolean;
  leaningDescriptionsEnabled: boolean;
  selectedBeagle: BeagleId;
  selectedRider: RiderId;
  viewMode: ViewMode;
  compassEnabled: boolean;
}
