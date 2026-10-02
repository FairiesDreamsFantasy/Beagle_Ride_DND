/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Position, BeagleSpecs, RiderSpecs, HandState, GameSettings } from '@/src/types';

export interface AccessibilityDOMState {
  ariaLiveMessage: string;
  hudDescription: string;
  ttsFormattedAnnouncement: string;
  focusTargetId: string;
  accessibilityActive: boolean;
}

/**
 * DOM & Screen Reader Accessibility AI Synthesis Engine.
 * Synthesizes dynamic ARIA announcements and HUD descriptions.
 */
export const InGameAIDOMCategoryEngine = {
  /**
   * Synthesizes screen reader and visual DOM live status representations.
   */
  synthesizeAccessibilityDOM: (params: {
    position: Position;
    beagle: BeagleSpecs;
    rider: RiderSpecs;
    settings: GameSettings;
    handState?: HandState;
    activeRoom: string;
  }): AccessibilityDOMState => {
    const { position, beagle, rider, settings, handState = 'DEFAULT', activeRoom } = params;

    const facingText = `Facing ${position.direction} at ${position.angle} degrees`;
    const locationText = `In the ${activeRoom}, at coordinate X ${position.x.toFixed(0)}, Y ${position.y.toFixed(0)}`;
    const mountText = `${rider.name} riding ${beagle.name}`;

    let handStatusText = '';
    if (handState === 'GRASPING') {
      handStatusText = `Grasping ${beagle.name}'s collar (${beagle.collarColor}).`;
    } else if (handState === 'PETTING') {
      handStatusText = `Gently petting ${beagle.name}'s silky ears.`;
    }

    const ariaLiveMessage = `${mountText}. ${locationText}. ${facingText}. ${handStatusText}`;
    const hudDescription = `[${activeRoom}] ${beagle.name} | ${position.direction} ${position.angle}° | Hand: ${handState}`;
    
    return {
      ariaLiveMessage,
      hudDescription,
      ttsFormattedAnnouncement: settings.ttsEnabled ? ariaLiveMessage : '',
      focusTargetId: 'game-view-canvas',
      accessibilityActive: true
    };
  }
};

export default InGameAIDOMCategoryEngine;
