/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrigLUT } from '../../../Engine/Mathematics/LUT/Trig';
import { ReciprocalDyLUT, RECIPROCAL_LUT_SIZE } from '../../../Engine/Mathematics/LUT/Shading';

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

export interface ScanlineAffineStepping {
  startRx: number;
  startRy: number;
  stepX: number;
  stepY: number;
  isFloor: boolean;
  distance: number;
}

export interface VolumetricLightSample {
  diffuse: number;
  specular: number;
  rim: number;
  shadedHex: string;
}

const FIXED_SHIFT = 16;
const FIXED_ONE = 1 << FIXED_SHIFT; // 65536 (N64 RSP S15.16 fixed-point unit)

/**
 * N64 RSP-Inspired S15.16 Fixed-Point & 4x4 Projective Matrix Engine + Simulated 3-D Shader.
 * Supports simultaneous True 3-D, Mode-7 Scanline 2.5D, and Volumetric Simulated 3-D characters.
 */
export const VisualAnimation3D = {
  perspective: 45,
  depthTest: true,
  fixedPointFormat: 'S15.16' as const,

  toFixed16(val: number): number {
    return (val * FIXED_ONE) | 0;
  },

  fromFixed16(fixed: number): number {
    return fixed / FIXED_ONE;
  },

  /**
   * Builds a column-major 4x4 perspective projection matrix into a pre-allocated 16-float buffer.
   */
  buildPerspectiveMatrixInto(
    out16: Float32Array,
    fovDeg: number,
    aspect: number,
    near: number,
    far: number
  ): Float32Array {
    const halfFovDeg = fovDeg * 0.5;
    const sinH = TrigLUT.sinInterpolated(halfFovDeg);
    const cosH = TrigLUT.cosInterpolated(halfFovDeg);
    const f = sinH > 1e-6 ? cosH / sinH : 1.0;
    const invRange = 1.0 / (near - far);

    out16.fill(0);
    out16[0] = f / Math.max(0.1, aspect);
    out16[5] = f;
    out16[10] = (far + near) * invRange;
    out16[11] = -1;
    out16[14] = (2 * far * near) * invRange;
    return out16;
  },

  /**
   * Transforms a 3D vertex by a 4x4 matrix with zero heap allocations.
   */
  transformVertexMatrix4(
    x: number,
    y: number,
    z: number,
    m16: Float32Array,
    outVec3: Float32Array
  ): void {
    const tx = m16[0] * x + m16[4] * y + m16[8] * z + m16[12];
    const ty = m16[1] * x + m16[5] * y + m16[9] * z + m16[13];
    const tz = m16[2] * x + m16[6] * y + m16[10] * z + m16[14];
    const tw = m16[3] * x + m16[7] * y + m16[11] * z + m16[15];
    const invW = Math.abs(tw) > 1e-6 ? 1.0 / tw : 1.0;
    outVec3[0] = tx * invW;
    outVec3[1] = ty * invW;
    outVec3[2] = tz * invW;
  },

  /**
   * Simulated 3-D Analytical Blinn-Phong & Rim Lighting Solver for volumetric canvas characters.
   * Gives 2-D/Simulated 3-D canvases genuine N64-style spherical depth without GPU overhead.
   */
  evaluateVolumetricLight(
    nx: number,
    ny: number,
    nz: number,
    lx: number = -0.38,
    ly: number = -0.62,
    lz: number = 0.68
  ): { diffuse: number; specular: number; rim: number } {
    const out = { diffuse: 0, specular: 0, rim: 0 };
    return this.evaluateVolumetricLightInto(out, nx, ny, nz, lx, ly, lz);
  },

  evaluateVolumetricLightInto(
    out: { diffuse: number; specular: number; rim: number },
    nx: number,
    ny: number,
    nz: number,
    lx: number = -0.38,
    ly: number = -0.62,
    lz: number = 0.68
  ): { diffuse: number; specular: number; rim: number } {
    const nDotL = nx * lx + ny * ly + nz * lz;
    const diffuse = nDotL > 0 ? nDotL : 0;
    const hx = lx;
    const hy = ly;
    const hz = lz + 1.0;
    const invH = 1.0 / Math.sqrt(hx * hx + hy * hy + hz * hz);
    const nDotH = Math.max(0, (nx * hx + ny * hy + nz * hz) * invH);
    const spec2 = nDotH * nDotH;
    out.diffuse = diffuse;
    out.specular = spec2 * spec2 * spec2 * spec2;
    out.rim = Math.pow(Math.max(0, 1.0 - Math.abs(nz)), 2.2);
    return out;
  },

  /**
   * Modulates an #RRGGBB hex color by an N64-style lighting scalar [0.35 .. 1.35] for Simulated 3-D depth.
   */
  shadeHexColor(hex: string, factor: number): string {
    const clean = hex.charCodeAt(0) === 35 ? hex.slice(1) : hex;
    if (clean.length !== 6) return hex;
    const num = parseInt(clean, 16);
    const r = Math.max(0, Math.min(255, Math.round(((num >> 16) & 0xFF) * factor)));
    const g = Math.max(0, Math.min(255, Math.round(((num >> 8) & 0xFF) * factor)));
    const b = Math.max(0, Math.min(255, Math.round((num & 0xFF) * factor)));
    return `rgb(${r},${g},${b})`;
  },

  /**
   * Vintage Mode-7 Affine Scanline Row Solver.
   * Adapts dynamically to ANY renderWidth / renderHeight without aspect distortion or per-pixel division.
   */
  computeScanlineStepping(
    sy: number,
    horizon: number,
    renderWidth: number,
    renderHeight: number,
    worldX: number,
    worldY: number,
    cosLook: number,
    sinLook: number,
    fovScale: number,
    riderEyeHeight: number,
    ceilingHeight: number
  ): ScanlineAffineStepping | null {
    const out: ScanlineAffineStepping = { startRx: 0, startRy: 0, stepX: 0, stepY: 0, isFloor: false, distance: 0 };
    return this.computeScanlineSteppingInto(out, sy, horizon, renderWidth, renderHeight, worldX, worldY, cosLook, sinLook, fovScale, riderEyeHeight, ceilingHeight)
      ? out
      : null;
  },

  /**
   * Zero-allocation Mode-7 scanline stepping writer into a pre-allocated ScanlineAffineStepping buffer.
   */
  computeScanlineSteppingInto(
    out: ScanlineAffineStepping,
    sy: number,
    horizon: number,
    renderWidth: number,
    renderHeight: number,
    worldX: number,
    worldY: number,
    cosLook: number,
    sinLook: number,
    fovScale: number,
    riderEyeHeight: number,
    ceilingHeight: number
  ): boolean {
    const dy = sy - horizon;
    if (dy === 0) return false;

    const isFloor = sy > horizon;
    const h = isFloor ? riderEyeHeight : (ceilingHeight - riderEyeHeight);
    const absDy = dy < 0 ? -dy : dy;
    const invDy = absDy < RECIPROCAL_LUT_SIZE ? ReciprocalDyLUT[absDy] : (1.0 / absDy);

    const effectiveFov = fovScale * (renderHeight / 180);
    const distance = (h * effectiveFov) * invDy;

    const centerWorldX = worldX + sinLook * distance;
    const centerWorldY = worldY - cosLook * distance;

    const aspectRatio = renderWidth / renderHeight;
    const halfSpanScale = 0.95 * (aspectRatio / (16 / 9));
    const spanX = cosLook * distance * halfSpanScale;
    const spanY = sinLook * distance * halfSpanScale;

    const invHalfWidth = 2.0 / renderWidth;
    out.startRx = centerWorldX - spanX;
    out.startRy = centerWorldY - spanY;
    out.stepX = spanX * invHalfWidth;
    out.stepY = spanY * invHalfWidth;
    out.isFloor = isFloor;
    out.distance = distance;
    return true;
  },

  /**
   * Projects a 3D world coordinate to 2D screen coordinates using O(1) TrigLUT.
   */
  projectPerspective(
    point: Vector3D,
    cameraPos: Vector3D,
    yawDeg: number,
    focalLength: number,
    screenWidth: number,
    screenHeight: number
  ): ProjectedPoint2D {
    const out: ProjectedPoint2D = { screenX: 0, screenY: 0, depth: 0, isVisible: false };
    return this.projectPerspectiveInto(out, point.x, point.y, point.z, cameraPos.x, cameraPos.y, cameraPos.z, yawDeg, focalLength, screenWidth, screenHeight);
  },

  projectPerspectiveInto(
    out: ProjectedPoint2D,
    px: number,
    py: number,
    pz: number,
    camX: number,
    camY: number,
    camZ: number,
    yawDeg: number,
    focalLength: number,
    screenWidth: number,
    screenHeight: number,
    horizonRow: number = screenHeight * 0.5
  ): ProjectedPoint2D {
    const dx = px - camX;
    const dy = py - camY;
    const dz = pz - camZ;

    const cosYaw = TrigLUT.cosInterpolated(yawDeg);
    const sinYaw = TrigLUT.sinInterpolated(yawDeg);

    // World forward at yawDeg is (sinYaw, -cosYaw); right is (cosYaw, sinYaw)
    const rotX = dx * cosYaw + dy * sinYaw;
    const rotY = dx * sinYaw - dy * cosYaw;

    if (rotY <= 0.1) {
      out.screenX = 0;
      out.screenY = 0;
      out.depth = rotY;
      out.isVisible = false;
      return out;
    }

    const screenX = (screenWidth * 0.5) + (rotX * focalLength) / rotY;
    const screenY = horizonRow - (dz * focalLength) / rotY;
    out.screenX = screenX;
    out.screenY = screenY;
    out.depth = rotY;
    out.isVisible = screenX >= 0 && screenX <= screenWidth && screenY >= 0 && screenY <= screenHeight;
    return out;
  },

  distance3D(a: Vector3D, b: Vector3D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
};

export default VisualAnimation3D;
