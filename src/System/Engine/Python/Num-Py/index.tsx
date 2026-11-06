/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { NumPyConfig, DEFAULT_NUMPY_CONFIG } from "./General/index";

/**
 * NumPy Numerical Array Controller.
 * Provides high-speed matrix multiplication, vector dot products, and multi-dimensional tensor transforms.
 */
export class NumPyController {
  private config: NumPyConfig = { ...DEFAULT_NUMPY_CONFIG };

  public getStatus() {
    return { module: "NumPy", active: true, config: this.config };
  }

  /**
   * Creates a zeroed Float64Array tensor of length n.
   */
  public zeros(length: number): Float64Array {
    return new Float64Array(Math.max(0, length));
  }

  /**
   * Creates a Float64Array filled with 1.0.
   */
  public ones(length: number): Float64Array {
    const arr = new Float64Array(Math.max(0, length));
    arr.fill(1.0);
    return arr;
  }

  /**
   * Dot product of two vectors: sum(a[i] * b[i]).
   */
  public dot(a: Float64Array | number[], b: Float64Array | number[]): number {
    const len = Math.min(a.length, b.length);
    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  /**
   * 2D Matrix Multiplication: C = A (m x k) * B (k x n) -> (m x n).
   */
  public matmul(a: number[][], b: number[][]): number[][] {
    const m = a.length;
    const k = a[0]?.length || 0;
    const n = b[0]?.length || 0;
    const result: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let p = 0; p < k; p++) {
          sum += a[i][p] * b[p][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  /**
   * 2D Matrix Transpose: M^T.
   */
  public transpose(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;
    const res: number[][] = Array.from({ length: cols }, () => new Array(rows));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        res[c][r] = matrix[r][c];
      }
    }
    return res;
  }
}

export const numPyController = new NumPyController();
export default numPyController;
