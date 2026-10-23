/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * High-Performance Bitmask Input Controller.
 * Manages O(1) keyboard and controller states with zero memory allocation.
 */
export class DeterministicInputController {
  private keyStateBitmask: Uint32Array = new Uint32Array(8); // 256 bits for keys

  public setKeyState(keyCode: number, isPressed: boolean): void {
    const index = Math.floor(keyCode / 32);
    const bit = keyCode % 32;
    if (index >= 0 && index < 8) {
      if (isPressed) {
        this.keyStateBitmask[index] |= (1 << bit);
      } else {
        this.keyStateBitmask[index] &= ~(1 << bit);
      }
    }
  }

  public isKeyPressed(keyCode: number): boolean {
    const index = Math.floor(keyCode / 32);
    const bit = keyCode % 32;
    if (index >= 0 && index < 8) {
      return (this.keyStateBitmask[index] & (1 << bit)) !== 0;
    }
    return false;
  }

  public reset(): void {
    this.keyStateBitmask.fill(0);
  }
}

export const deterministicInputController = new DeterministicInputController();
export default deterministicInputController;
