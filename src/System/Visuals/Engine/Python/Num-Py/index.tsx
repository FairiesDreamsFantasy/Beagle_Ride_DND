/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { NumPyConfig, DEFAULT_NUMPY_CONFIG } from "./General/index";

/**
 * NumPy Visual Matrix & Linear Algebra Engine.
 * Implements 4x4 matrix multiplication and dither matrix generation.
 */
export class VisualsNumPyController {
  private config: NumPyConfig = { ...DEFAULT_NUMPY_CONFIG };

  public getStatus() {
    return { module: "VisualsNumPy", active: true, config: this.config, algebraMode: "MATRIX_4X4" };
  }

  /**
   * Generates an 8x8 Bayer dithering matrix (np-style).
   */
  public generateBayer8x8(): Float32Array {
    const b = new Float32Array(64);
    const m4 = [
      0, 32,  8, 40,  2, 34, 10, 42,
      48, 16, 56, 24, 50, 18, 58, 26,
      12, 44,  4, 36, 14, 46,  6, 38,
      60, 28, 52, 20, 62, 30, 54, 22,
      3, 35, 11, 43,  1, 33,  9, 41,
      51, 19, 59, 27, 49, 17, 57, 25,
      15, 47,  7, 39, 13, 45,  5, 37,
      63, 31, 55, 23, 61, 29, 53, 21
    ];
    for (let i = 0; i < 64; i++) b[i] = m4[i] / 64.0;
    return b;
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
