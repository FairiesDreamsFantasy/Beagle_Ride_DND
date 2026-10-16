/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Keyboards and Controllers Engine General configuration.
 */
export const InputEngineGeneral = {
  pollingRateMs: 16.67,
  deadzoneThreshold: 0.15,
  doubleTapThresholdMs: 250,
  maxSimultaneousInputs: 4
};

/**
 * Double-Buffered Zero-Allocation Input Bitmask Engine.
 * Storing input keypress states in temporary arrays or string sets inside the frame update loop
 * triggers high memory allocation and Garbage Collection spikes.
 * This class maps inputs to bitmasks in double buffers, using fast bitwise operations.
 */
export class DoubleBufferedInputState {
  private currentMask: number = 0;
  private previousMask: number = 0;

  // Key mappings to discrete bitwise flags
  public static readonly FLAG_MOVE_FORWARD = 1 << 0;  // W or ArrowUp
  public static readonly FLAG_MOVE_BACKWARD = 1 << 1; // S or ArrowDown
  public static readonly FLAG_TURN_LEFT     = 1 << 2; // A or ArrowLeft
  public static readonly FLAG_TURN_RIGHT    = 1 << 3; // D or ArrowRight
  public static readonly FLAG_ACTION_JUMP   = 1 << 4; // Space bar
  public static readonly FLAG_ACTION_INTERACT = 1 << 5; // E key

  /**
   * Paces input frame updates by sliding the current state mask into the previous buffer.
   */
  public tick(): void {
    this.previousMask = this.currentMask;
  }

  /**
   * Sets or clears a bitwise flag without allocating a single object.
   */
  public setFlag(flag: number, pressed: boolean): void {
    if (pressed) {
      this.currentMask |= flag;
    } else {
      this.currentMask &= ~flag;
    }
  }

  /**
   * Mathematically evaluates if a button is currently held.
   */
  public isHeld(flag: number): boolean {
    return (this.currentMask & flag) !== 0;
  }

  /**
   * Mathematically evaluates if a button was just pressed on the current frame.
   */
  public isJustPressed(flag: number): boolean {
    return ((this.currentMask & flag) !== 0) && ((this.previousMask & flag) === 0);
  }

  /**
   * Mathematically evaluates if a button was just released on the current frame.
   */
  public isJustReleased(flag: number): boolean {
    return ((this.currentMask & flag) === 0) && ((this.previousMask & flag) !== 0);
  }

  /**
   * Instantly purges all inputs to clear buffer memory.
   */
  public clearAll(): void {
    this.currentMask = 0;
    this.previousMask = 0;
  }
}

/**
 * Advanced Polynomial Gamepad Deadzone Modeler.
 * Uses radial deadzone bounds and a smooth polynomial transfer curve
 * to eliminate analog micro-stutters and calculation spikes.
 */
export class GamepadDeadzoneCalculator {
  /**
   * Applies a scaled radial deadzone followed by a polynomial curve.
   * f(x) = sign(x) * |(x - deadzone) / (1 - deadzone)|^power
   */
  public static calibrateAxis(rawValue: number, deadzone: number = 0.15, curvePower: number = 1.5): number {
    const absVal = Math.abs(rawValue);
    if (absVal <= deadzone) {
      return 0.0;
    }

    // Scale mathematically into [0.0, 1.0] range
    const scaledVal = (absVal - deadzone) / (1.0 - deadzone);

    // Apply polynomial curve for smooth acceleration curves and micro-movement precision
    const curvedVal = Math.pow(scaledVal, curvePower);

    // Re-apply original sign
    return rawValue < 0 ? -curvedVal : curvedVal;
  }

  /**
   * Computes a 2D vector radial deadzone to avoid diagonal axis clipping.
   */
  public static calibrateVector2D(
    rawX: number,
    rawY: number,
    deadzone: number = 0.15
  ): { x: number; y: number } {
    const magnitude = Math.sqrt(rawX * rawX + rawY * rawY);
    if (magnitude <= deadzone) {
      return { x: 0.0, y: 0.0 };
    }

    const scaledMagnitude = (magnitude - deadzone) / (1.0 - deadzone);
    const scaleFactor = scaledMagnitude / magnitude;

    return {
      x: rawX * scaleFactor,
      y: rawY * scaleFactor
    };
  }
}
