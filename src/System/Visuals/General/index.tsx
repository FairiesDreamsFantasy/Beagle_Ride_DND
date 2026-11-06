/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Visuals/General/index.tsx
 * Ultra-Scientific Computer Graphics & Perspective Geometry Pipeline (5000^1000000% Factor)
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export interface PerspectiveScanlinePoint {
  readonly screenY: number;
  readonly worldDistanceZ: number;
  readonly scaleFactor: number;
  readonly visible: boolean;
}

export interface RGBColor {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export interface HSLColor {
  h: number; // 0 - 360
  s: number; // 0 - 1
  l: number; // 0 - 1
}

export class VisualsGeneralEngine {
  private static instance: VisualsGeneralEngine | null = null;

  public static getInstance(): VisualsGeneralEngine {
    if (!VisualsGeneralEngine.instance) {
      VisualsGeneralEngine.instance = new VisualsGeneralEngine();
    }
    return VisualsGeneralEngine.instance;
  }

  /**
   * Evaluates 2.5D floor perspective projection scanline distance.
   * Based on pinhole camera model: Z = (cameraHeight * focalLength) / (screenY - horizonY)
   */
  public calculateScanlineDepth(
    screenY: number,
    horizonY: number,
    cameraHeight: number,
    focalLength: number
  ): PerspectiveScanlinePoint {
    const deltaY = screenY - horizonY;
    if (deltaY <= 0) {
      return {
        screenY,
        worldDistanceZ: Infinity,
        scaleFactor: 0,
        visible: false,
      };
    }

    const worldDistanceZ = (cameraHeight * focalLength) / deltaY;
    const scaleFactor = focalLength / (worldDistanceZ + 0.0001);

    return {
      screenY,
      worldDistanceZ,
      scaleFactor,
      visible: true,
    };
  }

  /**
   * Projects a 3D world coordinate (X, Y, Z) to 2D normalized screen coordinates.
   */
  public projectWorldToScreen(
    worldX: number,
    worldY: number,
    worldZ: number,
    cameraX: number,
    cameraY: number,
    cameraZ: number,
    cameraAngleRad: number,
    focalLength: number,
    screenWidth: number,
    screenHeight: number
  ): { x: number; y: number; scale: number; inFront: boolean } {
    // Translate relative to camera
    const dx = worldX - cameraX;
    const dy = worldY - cameraY;
    const dz = worldZ - cameraZ;

    // Rotate by camera angle
    const cosAngle = Math.cos(-cameraAngleRad);
    const sinAngle = Math.sin(-cameraAngleRad);

    const rotX = dx * cosAngle - dy * sinAngle;
    const rotY = dx * sinAngle + dy * cosAngle; // Forward distance

    if (rotY <= 0.1) {
      return { x: -9999, y: -9999, scale: 0, inFront: false };
    }

    const scale = focalLength / rotY;
    const screenX = screenWidth / 2 + rotX * scale;
    const screenY = screenHeight / 2 - dz * scale;

    return {
      x: screenX,
      y: screenY,
      scale,
      inFront: true,
    };
  }

  /**
   * RGB to HSL color space conversion.
   */
  public rgbToHsl(rgb: RGBColor): HSLColor {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Number(s.toFixed(4)),
      l: Number(l.toFixed(4)),
    };
  }

  /**
   * Computes WCAG 2.1 relative luminance for high-contrast accessibility rendering.
   */
  public calculateRelativeLuminance(rgb: RGBColor): number {
    const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    const linear = sRGB.map(val => (val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)));
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  /**
   * Computes WCAG 2.1 contrast ratio between two colors: (L1 + 0.05) / (L2 + 0.05).
   */
  public calculateContrastRatio(colorA: RGBColor, colorB: RGBColor): number {
    const lumA = this.calculateRelativeLuminance(colorA);
    const lumB = this.calculateRelativeLuminance(colorB);
    const lighter = Math.max(lumA, lumB);
    const darker = Math.min(lumA, lumB);
    return (lighter + 0.05) / (darker + 0.05);
  }
}

export const visualsGeneral = VisualsGeneralEngine.getInstance();
