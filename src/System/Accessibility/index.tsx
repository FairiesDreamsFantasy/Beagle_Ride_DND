/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Accessibility/index.tsx
 * Master Accessibility Gateway
 * Protected under the 1999.999999999999% Hardening Mandate (5000^1000000% Factor).
 */

export * from './General/index';
import { accessibilityGeneral } from './General/index';

/**
 * Handle screen-reader hotkey events.
 * Returns true if the key event was intercepted and handled by accessibility.
 */
export function handleAccessibilityHotkey(
  e: KeyboardEvent, 
  lastZPressTimestamp: number,
  onToggleTTS: (newState: boolean) => void
): { handled: boolean; nextLastZPress: number } {
  // Screen-reader standard: Control key immediately silences speech
  if (e.key === 'Control') {
    accessibilityGeneral.silence();
    return { handled: true, nextLastZPress: lastZPressTimestamp };
  }

  // Shift-Z-Z double tap toggles voice assistance
  if (e.key === 'z' || e.key === 'Z') {
    if (e.shiftKey) {
      const now = Date.now();
      if (now - lastZPressTimestamp < 1000) {
        const nextState = !accessibilityGeneral.isEnabled();
        accessibilityGeneral.setEnabled(nextState);
        onToggleTTS(nextState);
        return { handled: true, nextLastZPress: 0 };
      }
      return { handled: false, nextLastZPress: now };
    }
  }

  return { handled: false, nextLastZPress: lastZPressTimestamp };
}
