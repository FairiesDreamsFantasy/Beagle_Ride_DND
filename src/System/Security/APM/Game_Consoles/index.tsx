/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GameConsoleInputMapping {
  buttonA: number;
  buttonB: number;
  buttonX: number;
  buttonY: number;
  dpadUp: number;
  dpadDown: number;
  dpadLeft: number;
  dpadRight: number;
  start: number;
  select: number;
  leftBumper: number;
  rightBumper: number;
}

export interface GameConsoleProfile {
  consoleType: 'STANDARD_GAMEPAD' | 'RETRO_ARCADE' | 'CUSTOM_JOYSTICK' | 'TOUCH_VIRTUAL_PAD';
  connectedGamepadsCount: number;
  hasAnalogSticks: boolean;
  mapping: GameConsoleInputMapping;
}

export const DEFAULT_CONSOLE_MAPPING: Readonly<GameConsoleInputMapping> = Object.freeze({
  buttonA: 0,
  buttonB: 1,
  buttonX: 2,
  buttonY: 3,
  dpadUp: 12,
  dpadDown: 13,
  dpadLeft: 14,
  dpadRight: 15,
  start: 9,
  select: 8,
  leftBumper: 4,
  rightBumper: 5
});

/**
 * Game Console Matrix Controller.
 * Discovers connected gamepads and maps standard console controller schemes.
 */
export class GameConsoleMatrixController {
  private static instance: GameConsoleMatrixController | null = null;

  public static getInstance(): GameConsoleMatrixController {
    if (!GameConsoleMatrixController.instance) {
      GameConsoleMatrixController.instance = new GameConsoleMatrixController();
    }
    return GameConsoleMatrixController.instance;
  }

  public probeConsoleEnvironment(): GameConsoleProfile {
    let count = 0;
    let hasAnalog = false;

    if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
      try {
        const pads = navigator.getGamepads();
        for (let i = 0; i < pads.length; i++) {
          if (pads[i]) {
            count++;
            if (pads[i]!.axes && pads[i]!.axes.length >= 2) {
              hasAnalog = true;
            }
          }
        }
      } catch {
        count = 0;
      }
    }

    return {
      consoleType: count > 0 ? (hasAnalog ? 'STANDARD_GAMEPAD' : 'RETRO_ARCADE') : 'TOUCH_VIRTUAL_PAD',
      connectedGamepadsCount: count,
      hasAnalogSticks: hasAnalog,
      mapping: { ...DEFAULT_CONSOLE_MAPPING }
    };
  }
}

export const gameConsoleMatrixController = GameConsoleMatrixController.getInstance();
export default gameConsoleMatrixController;
