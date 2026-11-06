/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface ProjectedPoint2D {
  screenX: number;
  screenY: number;
  depth: number;
  isVisible: boolean;
}

/**
 * 3D Visual Animation & Perspective Mathematics Engine.
 * Formulates coordinate transforms, Euler rotations, and camera projections.
 */
export const VisualAnimation3D = {
  perspective: 45,
  depthTest: true,

  /**
   * Projects a 3D world coordinate to 2D screen coordinates with perspective division.
   */
  projectPerspective(
    point: Vector3D,
    cameraPos: Vector3D,
    yawDeg: number,
    focalLength: number,
    screenWidth: number,
    screenHeight: number
  ): ProjectedPoint2D {
    // Relative coordinates
    const dx = point.x - cameraPos.x;
    const dy = point.y - cameraPos.y;
    const dz = point.z - cameraPos.z;

    // Yaw rotation
    const rad = (yawDeg * Math.PI) / 180;
    const cosYaw = Math.cos(rad);
    const sinYaw = Math.sin(rad);

    const rotX = dx * cosYaw - dy * sinYaw;
    const rotY = dx * sinYaw + dy * cosYaw;

    if (rotY <= 0.1) {
      return { screenX: 0, screenY: 0, depth: rotY, isVisible: false };
    }

    const screenX = (screenWidth / 2) + (rotX * focalLength) / rotY;
    const screenY = (screenHeight / 2) - (dz * focalLength) / rotY;

    return {
      screenX,
      screenY,
      depth: rotY,
      isVisible: screenX >= 0 && screenX <= screenWidth && screenY >= 0 && screenY <= screenHeight
    };
  },

  /**
   * Calculates Euclidean 3D distance between two points.
   */
  distance3D(a: Vector3D, b: Vector3D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
};

export default VisualAnimation3D;
