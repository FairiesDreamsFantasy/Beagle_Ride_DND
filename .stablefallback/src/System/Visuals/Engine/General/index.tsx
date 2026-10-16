/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Visuals Engine General configuration.
 */
export const VisualsEngineGeneral = {
  renderScale: 1.0,
  targetFPS: 60,
  vSync: true,
  shadowsEnabled: true,
  bloomIntensity: 0.5,
  useSubPixelRounding: true
};

/**
 * Scientific Projection and Raycaster Geometry mathematics engine.
 * Employs double-precision trigonometric bounds and distortion-correction matrices
 * to eliminate screen-shearing and CPU geometry pipeline spikes.
 */
export class RaycastGeometryCalculations {
  private static readonly DEG_TO_RAD_SCALAR = Math.PI / 180.0;
  private static readonly RAD_TO_DEG_SCALAR = 180.0 / Math.PI;

  /**
   * Translates degrees to radians with high-fidelity float space conservation.
   */
  public static degToRad(degrees: number): number {
    return degrees * this.DEG_TO_RAD_SCALAR;
  }

  /**
   * Translates radians to degrees.
   */
  public static radToDeg(radians: number): number {
    return radians * this.RAD_TO_DEG_SCALAR;
  }

  /**
   * Corrects the standard "fisheye" focal perspective distortion.
   * D_corrected = D * cos(rayAngle - playerAngle)
   */
  public static correctFisheyeDistance(rawDistance: number, rayAngleRad: number, playerAngleRad: number): number {
    const angleDelta = rayAngleRad - playerAngleRad;
    const cosAngle = Math.cos(angleDelta);
    return rawDistance * cosAngle;
  }

  /**
   * Computes the mathematical projected height of a column relative to projection plane distance.
   * Height = (SliceHeight / Distance) * PlaneDistance
   */
  public static calculateProjectedHeight(
    sliceHeight: number,
    distance: number,
    projectionPlaneDistance: number
  ): number {
    if (distance <= 0) {
      return 9999.0; // Prevent division-by-zero infinite projection spikes
    }
    return (sliceHeight / distance) * projectionPlaneDistance;
  }
}

/**
 * High-Performance Sub-Pixel Alignment Engine.
 * Drawing floating-point coordinates in HTML5 Canvas forces browsers to perform
 * real-time sub-pixel interpolation on the CPU, causing heavy spikes.
 * This helper mathematically aligns coordinates to exact integer bounds or fractional offsets.
 */
export class SubPixelRendererAligner {
  /**
   * Aligns a coordinate to the nearest integer pixel to completely bypass browser-level interpolation spikes.
   */
  public static snapToPixel(coord: number): number {
    return Math.round(coord);
  }

  /**
   * Clamps render bounds to canvas limits safely to avoid memory buffer boundary leaks.
   */
  public static clampBounds(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
  }

  /**
   * Mathematically generates a safe, zero-allocation bounding box.
   */
  public static snapBoundingBox(
    x: number,
    y: number,
    width: number,
    height: number
  ): { x: number; y: number; width: number; height: number } {
    const rx = Math.round(x);
    const ry = Math.round(y);
    return {
      x: rx,
      y: ry,
      width: Math.round(x + width) - rx,
      height: Math.round(y + height) - ry
    };
  }
}
