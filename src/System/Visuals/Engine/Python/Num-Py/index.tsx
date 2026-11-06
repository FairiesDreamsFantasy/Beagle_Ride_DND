/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { NumPyConfig, DEFAULT_NUMPY_CONFIG } from "./General/index";

/**
 * NumPy Visual Matrix & Linear Algebra Engine.
 * Implements 4x4 homogeneous matrix multiplication, vector dot products, and normal transformations.
 */
export class VisualsNumPyController {
  private config: NumPyConfig = { ...DEFAULT_NUMPY_CONFIG };

  public getStatus() {
    return { module: "VisualsNumPy", active: true, config: this.config, algebraMode: "MATRIX_4X4" };
  }

  /**
   * 4x4 Matrix multiplication (np.dot(matA, matB)).
   */
  public matmul4x4(a: Float64Array, b: Float64Array): Float64Array {
    const out = new Float64Array(16);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        out[r * 4 + c] = 
          a[r * 4 + 0] * b[0 * 4 + c] +
          a[r * 4 + 1] * b[1 * 4 + c] +
          a[r * 4 + 2] * b[2 * 4 + c] +
          a[r * 4 + 3] * b[3 * 4 + c];
      }
    }
    return out;
  }

  /**
   * Dot product between two 3D vectors (np.dot(vecA, vecB)).
   */
  public dot3(ax: number, ay: number, az: number, bx: number, by: number, bz: number): number {
    return ax * bx + ay * by + az * bz;
  }

  /**
   * Vector normalization (vec / np.linalg.norm(vec)).
   */
  public normalize3(x: number, y: number, z: number): { x: number; y: number; z: number } {
    const len = Math.sqrt(x * x + y * y + z * z);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: x / len, y: y / len, z: z / len };
  }
}

export const visualsNumPyController = new VisualsNumPyController();
export default visualsNumPyController;
