/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameSettings } from '../../../types';

export const DefaultGameSettings: GameSettings = {
  ttsEnabled: true,
  jumpNotificationsEnabled: false,
  barkNotificationsEnabled: false,
  volume: 0.35,
  activeSfxVoice: 0,
  activeBgmVoice: 0,
  isMuted: false,
  paused: false,
  turningTonesEnabled: false,
  pettingDescriptionsEnabled: true,
  collarGraspDescriptionsEnabled: true,
  leaningDescriptionsEnabled: true,
  selectedBeagle: 'JETTA',
  selectedRider: 'FAIRY_RIDER',
  viewMode: 'POV',
  compassEnabled: true
};

export const GameConfig = {
  version: '1.0.0',
  description: 'Global game configuration and defaults',
  physics: {
    trotSpeed: 1.6,
    gallopSpeed: 8.4,
    burstSpeed: 3.2,
    gravity: 0.12,
    jumpInitialVelocity: 1.6
  }
};
