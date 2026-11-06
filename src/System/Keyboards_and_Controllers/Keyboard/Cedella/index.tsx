/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Keyboards_and_Controllers/Keyboard/Cedella/index.tsx
 * Cedella Keyboard Layout Mapping Matrix.
 * Maps physical keys and scan-codes to deterministic game actions.
 */

import React from 'react';

export type GameAction = 
  | 'BARK'
  | 'PET'
  | 'COLLAR'
  | 'JUMP'
  | 'LEAN'
  | 'MOVE_FORWARD'
  | 'MOVE_BACKWARD'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'VIEW_TOGGLE'
  | 'TOGGLE_TTS'
  | 'PAUSE';

export const CEDELLA_KEY_MAPPING: Record<string, GameAction> = {
  's': 'BARK',
  'S': 'BARK',
  'p': 'PET',
  'P': 'PET',
  'c': 'COLLAR',
  'C': 'COLLAR',
  'l': 'LEAN',
  'L': 'LEAN',
  't': 'VIEW_TOGGLE',
  'T': 'VIEW_TOGGLE',
  ' ': 'JUMP',
  'arrowup': 'MOVE_FORWARD',
  'arrowdown': 'MOVE_BACKWARD',
  'arrowleft': 'TURN_LEFT',
  'arrowright': 'TURN_RIGHT',
  '&': 'PAUSE'
};

export function resolveCedellaAction(key: string): GameAction | null {
  const normalized = key.toLowerCase();
  return CEDELLA_KEY_MAPPING[key] || CEDELLA_KEY_MAPPING[normalized] || null;
}

export const CedellaLayout: React.FC = () => (
  <div id="cedella-layout" className="hidden" aria-hidden="true">
    Cedella Primary Keyboard Layout Active (Deterministic Mapping Matrix)
  </div>
);

export default CedellaLayout;
