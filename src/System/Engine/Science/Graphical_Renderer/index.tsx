/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';
export * from './RendererWorker';

import { TrigLUT } from '../../Mathematics/LUT/Trig';
import { ReciprocalDyLUT, RECIPROCAL_LUT_SIZE, FogVisibilityLUT, FOG_LUT_SIZE } from '../../Mathematics/LUT/Shading';
import { GeometryModule } from '../../Mathematics/Geometry/index';
import { VisualAnimation3D, ScanlineAffineStepping } from '../../../Visuals/Animations/3-D/index';
import { WorldRegistry } from '../../../Registry/Building_Blocks/World/index';
import { BlockTexturePalette } from '../../../Building_Blocks/index';
import { Foyer, Garden, FrontPorch, type GardenScanlineRunCache } from '../../../../House/index';
import { TempleOfHayana, type TempleScanlineRunCache } from '../../../../Levels/Temple_Of_Hayana/index';
import { isTempleWallAt, type TempleMazeData } from '../../../UI/Play_Area/templeMaze';

export interface PerspectiveScanlineParameters {
  renderWidth: number;
  renderHeight: number;
  worldX: number;
  worldY: number;
  lookAngle: number;
  horizonOffset: number;
  riderEyeHeight: number;
  ceilingHeight: number;
  fovScale: number;
}

export interface WorldScanlineRenderParams {
  data32: Uint32Array;
  renderWidth: number;
  renderHeight: number;
  horizon: number;
  safeHorizon: number;
  worldX: number;
  worldY: number;
  cosLook: number;
  sinLook: number;
  fovScale: number;
  riderEyeHeight: number;
  ceilingHeight: number;
  room: 'FOYER' | 'GARDEN' | 'PORCH' | 'TEMPLE';
  useDepthFog: boolean;
  templeMaze: TempleMazeData;
}

const INV_40 = 1 / 40;
const INV_80 = 1 / 80;
const INV_20 = 1 / 20;
const INV_10 = 1 / 10;
const INV_15 = 1 / 15;
const INV_120 = 1 / 120;

const FOYER_SPECS = WorldRegistry.rooms.FOYER;
const GARDEN_SPECS = WorldRegistry.rooms.GARDEN;
const PORCH_SPECS = WorldRegistry.rooms.PORCH;
const DOOR_MIN_X = FOYER_SPECS.doorCenterX - FOYER_SPECS.doorHalfWidth;
const DOOR_MAX_X = FOYER_SPECS.doorCenterX + FOYER_SPECS.doorHalfWidth;

// Pre-allocated zero-GC scratch structures owned by GraphicalRendererEngine
const scanlineScratch: ScanlineAffineStepping = { startRx: 0, startRy: 0, stepX: 0, stepY: 0, isFloor: false, distance: 0 };
const gardenRunCache: GardenScanlineRunCache = {
  lastTx: 0x7fffffff,
  lastTy: 0x7fffffff,
  lastFloorColor32: BlockTexturePalette.GARDEN_GRASS_PRIMARY
};
const templeRunCache: TempleScanlineRunCache = {
  lastStoneX: 0x7fffffff,
  lastStoneY: 0x7fffffff,
  lastWallColor32: BlockTexturePalette.TEMPLE_WALL_GRANITE
};

/**
 * High-Performance Scientific Graphical Renderer Engine.
 * Formulates non-blocking, O(1) mathematical perspective scanline matrices via TrigLUT & ReciprocalDyLUT,
 * and executes zero-allocation Mode-7 32-bit framebuffer rasterization.
 */
export const GraphicalRendererEngine = {
  version: '4.0.0-dedicated-mode7-rasterizer',

  /**
   * Calculates horizontal scanning vectors for a given row and yaw angle using TrigLUT & ReciprocalDyLUT.
   */
  calculateScanlineVector(
    sy: number,
    horizon: number,
    lookAngle: number,
    fovScale: number,
    riderEyeHeight: number,
    ceilingHeight: number,
    renderHeight: number = 180,
    renderWidth: number = 320
  ) {
    const dy = sy - horizon;
    if (dy === 0) return null;

    const isFloor = sy > horizon;
    const h = isFloor ? riderEyeHeight : (ceilingHeight - riderEyeHeight);
    const absDy = dy < 0 ? -dy : dy;
    const invDy = absDy < RECIPROCAL_LUT_SIZE ? ReciprocalDyLUT[absDy] : (1.0 / absDy);

    const cosLook = TrigLUT.cos(lookAngle);
    const sinLook = TrigLUT.sin(lookAngle);

    const effectiveFov = fovScale * (renderHeight / 180);
    const distance = (h * effectiveFov) * invDy;
    const aspectRatio = renderWidth / renderHeight;
    const halfSpanScale = 0.95 * (aspectRatio / (16 / 9));

    const lookX = sinLook * distance;
    const lookY = -cosLook * distance;
    const spanX = cosLook * distance * halfSpanScale;
    const spanY = sinLook * distance * halfSpanScale;

    return { lookX, lookY, spanX, spanY, isFloor, distance };
  },

  /**
   * Computes affine Mode-7 scanline stepping parameters for per-pixel pure addition.
   */
  computeScanlineStepping(
    sy: number,
    horizon: number,
    params: PerspectiveScanlineParameters
  ): ScanlineAffineStepping | null {
    const cosLook = TrigLUT.cos(params.lookAngle);
    const sinLook = TrigLUT.sin(params.lookAngle);
    return VisualAnimation3D.computeScanlineStepping(
      sy,
      horizon,
      params.renderWidth,
      params.renderHeight,
      params.worldX,
      params.worldY,
      cosLook,
      sinLook,
      params.fovScale,
      params.riderEyeHeight,
      params.ceilingHeight
    );
  },

  /**
   * Executes full-frame Mode-7 perspective scanline rasterization into a pre-allocated Uint32Array framebuffer.
   * Zero heap allocations per frame.
   */
  renderWorldScanlines32(params: WorldScanlineRenderParams): void {
    const {
      data32,
      renderWidth,
      renderHeight,
      horizon,
      safeHorizon,
      worldX,
      worldY,
      cosLook,
      sinLook,
      fovScale,
      riderEyeHeight,
      ceilingHeight,
      room,
      useDepthFog,
      templeMaze
    } = params;

    const gardenLintelDrop = Math.round(20 * (renderHeight / 180));
    const gateLintelDrop = Math.round(30 * (renderHeight / 180));

    let fogR: number = Foyer.fogColor.r;
    let fogG: number = Foyer.fogColor.g;
    let fogB: number = Foyer.fogColor.b;
    if (room === 'GARDEN') {
      fogR = Garden.fogColor.r;
      fogG = Garden.fogColor.g;
      fogB = Garden.fogColor.b;
    } else if (room === 'PORCH') {
      fogR = FrontPorch.fogColor.r;
      fogG = FrontPorch.fogColor.g;
      fogB = FrontPorch.fogColor.b;
    } else if (room === 'TEMPLE') {
      fogR = TempleOfHayana.fogColor.r;
      fogG = TempleOfHayana.fogColor.g;
      fogB = TempleOfHayana.fogColor.b;
    }

    const COL_VOID_BLACK = BlockTexturePalette.VOID_BLACK;
    const COL_WALL_BASE_DARK = BlockTexturePalette.WALL_BASE_DARK;
    const COL_WALL_GROUT_DARK = BlockTexturePalette.WALL_GROUT_DARK;
    const COL_FOYER_TILE_BLUE = BlockTexturePalette.FOYER_TILE_BLUE;
    const COL_FOYER_TILE_BLUE_BEVEL = BlockTexturePalette.FOYER_TILE_BLUE_BEVEL;
    const COL_FOYER_TILE_GREEN = BlockTexturePalette.FOYER_TILE_GREEN;
    const COL_FOYER_TILE_GREEN_BEVEL = BlockTexturePalette.FOYER_TILE_GREEN_BEVEL;
    const COL_FOYER_CEILING_LIGHT = BlockTexturePalette.FOYER_CEILING_LIGHT;
    const COL_FOYER_CEILING_ALT = BlockTexturePalette.FOYER_CEILING_ALT;
    const COL_FOYER_NORTH_LINTEL = BlockTexturePalette.FOYER_NORTH_LINTEL;
    const COL_GARDEN_GRASS_PRIMARY = BlockTexturePalette.GARDEN_GRASS_PRIMARY;
    const COL_GARDEN_GRASS_ALT = BlockTexturePalette.GARDEN_GRASS_ALT;
    const COL_GARDEN_FLOWER_MAGENTA = BlockTexturePalette.GARDEN_FLOWER_MAGENTA;
    const COL_GARDEN_FLOWER_GOLD = BlockTexturePalette.GARDEN_FLOWER_GOLD;
    const COL_GARDEN_HEDGE_DARK = BlockTexturePalette.GARDEN_HEDGE_DARK;
    const COL_GARDEN_HEDGE_LIGHT = BlockTexturePalette.GARDEN_HEDGE_LIGHT;
    const COL_PORCH_PLANK_LIGHT = BlockTexturePalette.PORCH_PLANK_LIGHT;
    const COL_PORCH_PLANK_DARK = BlockTexturePalette.PORCH_PLANK_DARK;
    const COL_PORCH_CEILING_LIGHT = BlockTexturePalette.PORCH_CEILING_LIGHT;
    const COL_PORCH_CEILING_DARK = BlockTexturePalette.PORCH_CEILING_DARK;
    const COL_PORCH_LANTERN_GLOW = BlockTexturePalette.PORCH_LANTERN_GLOW;
    const COL_PORCH_COLUMN_WHITE = BlockTexturePalette.PORCH_COLUMN_WHITE;
    const COL_PORCH_RAILING_DARK = BlockTexturePalette.PORCH_RAILING_DARK;
    const COL_PORCH_LAWN_SURROUND = BlockTexturePalette.PORCH_LAWN_SURROUND;
    const COL_TEMPLE_WALL_MORTAR = BlockTexturePalette.TEMPLE_WALL_MORTAR;
    const COL_TEMPLE_WALL_MOSS = BlockTexturePalette.TEMPLE_WALL_MOSS;
    const COL_TEMPLE_WALL_SLATE = BlockTexturePalette.TEMPLE_WALL_SLATE;
    const COL_TEMPLE_WALL_GRANITE = BlockTexturePalette.TEMPLE_WALL_GRANITE;
    const COL_TEMPLE_FLOOR_GROUT = BlockTexturePalette.TEMPLE_FLOOR_GROUT;
    const COL_TEMPLE_FLOOR_LIGHT = BlockTexturePalette.TEMPLE_FLOOR_LIGHT;
    const COL_TEMPLE_FLOOR_DARK = BlockTexturePalette.TEMPLE_FLOOR_DARK;
    const COL_TEMPLE_CEILING_GROUT = BlockTexturePalette.TEMPLE_CEILING_GROUT;
    const COL_TEMPLE_CEILING_LIGHT = BlockTexturePalette.TEMPLE_CEILING_LIGHT;
    const COL_TEMPLE_CEILING_DARK = BlockTexturePalette.TEMPLE_CEILING_DARK;
    const COL_TEMPLE_GATE_LINTEL = BlockTexturePalette.TEMPLE_GATE_LINTEL;

    for (let sy = 0; sy < renderHeight; sy++) {
      const hasStepping = VisualAnimation3D.computeScanlineSteppingInto(
        scanlineScratch,
        sy,
        horizon,
        renderWidth,
        renderHeight,
        worldX,
        worldY,
        cosLook,
        sinLook,
        fovScale,
        riderEyeHeight,
        ceilingHeight
      );
      if (!hasStepping) {
        data32.fill(COL_VOID_BLACK, sy * renderWidth, (sy + 1) * renderWidth);
        continue;
      }

      const isFloor = scanlineScratch.isFloor;
      const scanDistance = scanlineScratch.distance;
      let rx = scanlineScratch.startRx;
      let ry = scanlineScratch.startRy;
      const stepX = scanlineScratch.stepX;
      const stepY = scanlineScratch.stepY;
      const rowOffset = sy * renderWidth;

      const applyRowFog = useDepthFog && scanDistance > 18 && !(room === 'GARDEN' && !isFloor);
      let fogVis256 = 256;
      let fogRWeighted = 0;
      let fogGWeighted = 0;
      let fogBWeighted = 0;
      if (applyRowFog) {
        const rawIdx = ((scanDistance - 18) * 0.85) | 0;
        const fogIdx = rawIdx < 0 ? 0 : (rawIdx >= FOG_LUT_SIZE ? FOG_LUT_SIZE - 1 : rawIdx);
        fogVis256 = (FogVisibilityLUT[fogIdx] * 256) | 0;
        const fogInv256 = 256 - fogVis256;
        fogRWeighted = fogR * fogInv256;
        fogGWeighted = fogG * fogInv256;
        fogBWeighted = fogB * fogInv256;
      }

      if (room === 'FOYER') {
        const foyerW = FOYER_SPECS.width;
        const foyerH = FOYER_SPECS.height;
        const lintelColor32 = sy > horizon - gardenLintelDrop ? COL_FOYER_NORTH_LINTEL : COL_WALL_BASE_DARK;
        for (let sx = 0; sx < renderWidth; sx++) {
          let color32: number;
          if (rx < 0 || rx > foyerW || ry < 0 || ry > foyerH) {
            const isDoorGap = rx >= DOOR_MIN_X && rx <= DOOR_MAX_X;
            if (ry < 0 && isDoorGap) {
              color32 = isFloor
                ? (((((rx * INV_20) | 0) + ((ry * INV_20) | 0)) & 1) === 0 ? COL_GARDEN_GRASS_PRIMARY : COL_GARDEN_GRASS_ALT)
                : lintelColor32;
            } else if (ry > foyerH && isDoorGap) {
              color32 = isFloor
                ? ((((ry - foyerH) * INV_10) | 0) & 1) === 0 ? COL_PORCH_PLANK_LIGHT : COL_PORCH_PLANK_DARK
                : COL_WALL_BASE_DARK;
            } else {
              const mx = rx % 15;
              const my = ry % 15;
              color32 = ((mx < 0 ? -mx : mx) < 0.6 || (my < 0 ? -my : my) < 0.6) ? COL_WALL_GROUT_DARK : COL_WALL_BASE_DARK;
            }
          } else if (isFloor) {
            const tx = (rx * INV_40) | 0;
            const ty = (ry * INV_40) | 0;
            const isBlueTile = ((tx + ty) & 1) === 0;
            const isSeam = (rx - tx * 40) < 1.2 || (ry - ty * 40) < 1.2;
            color32 = isBlueTile
              ? (isSeam ? COL_FOYER_TILE_BLUE_BEVEL : COL_FOYER_TILE_BLUE)
              : (isSeam ? COL_FOYER_TILE_GREEN_BEVEL : COL_FOYER_TILE_GREEN);
          } else {
            color32 = (((((rx * INV_80) | 0) + ((ry * INV_80) | 0)) & 1) === 0)
              ? COL_FOYER_CEILING_LIGHT
              : COL_FOYER_CEILING_ALT;
          }
          if (applyRowFog) {
            const r = (((color32 & 0xFF) * fogVis256 + fogRWeighted) >> 8) & 0xFF;
            const g = ((((color32 >> 8) & 0xFF) * fogVis256 + fogGWeighted) >> 8) & 0xFF;
            const b = ((((color32 >> 16) & 0xFF) * fogVis256 + fogBWeighted) >> 8) & 0xFF;
            color32 = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
          }
          data32[rowOffset + sx] = color32;
          rx += stepX;
          ry += stepY;
        }
      } else if (room === 'GARDEN') {
        const gardenW = GARDEN_SPECS.width;
        const gardenH = GARDEN_SPECS.height;
        const rowGardenSky32 = !isFloor ? Garden.computeSkyRowColor32(sy, safeHorizon) : 0;
        if (!isFloor && !applyRowFog) {
          const endRx = rx + stepX * (renderWidth - 1);
          const endRy = ry + stepY * (renderWidth - 1);
          if (
            rx >= 0 && rx <= gardenW && ry >= 0 && ry <= gardenH &&
            endRx >= 0 && endRx <= gardenW && endRy >= 0 && endRy <= gardenH
          ) {
            data32.fill(rowGardenSky32, rowOffset, rowOffset + renderWidth);
            continue;
          }
        }
        gardenRunCache.lastTx = 0x7fffffff;
        gardenRunCache.lastTy = 0x7fffffff;
        for (let sx = 0; sx < renderWidth; sx++) {
          let color32: number;
          if (rx < 0 || rx > gardenW || ry < 0 || ry > gardenH) {
            if (ry > gardenH && rx >= DOOR_MIN_X && rx <= DOOR_MAX_X) {
              color32 = isFloor
                ? (((((rx * INV_40) | 0) + ((ry * INV_40) | 0)) & 1) === 0 ? COL_FOYER_TILE_BLUE : COL_FOYER_TILE_GREEN)
                : COL_WALL_BASE_DARK;
            } else {
              color32 = (((Math.floor(rx * INV_15) + Math.floor(ry * INV_15)) & 1) === 0)
                ? COL_GARDEN_HEDGE_DARK
                : COL_GARDEN_HEDGE_LIGHT;
            }
          } else if (!isFloor) {
            color32 = rowGardenSky32;
          } else {
            const tx = (rx * INV_20) | 0;
            const ty = (ry * INV_20) | 0;
            if (tx !== gardenRunCache.lastTx || ty !== gardenRunCache.lastTy) {
              gardenRunCache.lastTx = tx;
              gardenRunCache.lastTy = ty;
              const hashFrac = GeometryModule.spatialHash2D(tx, ty);
              if (hashFrac < 0.05) {
                gardenRunCache.lastFloorColor32 = hashFrac < 0.025
                  ? COL_GARDEN_FLOWER_MAGENTA
                  : COL_GARDEN_FLOWER_GOLD;
              } else {
                gardenRunCache.lastFloorColor32 = ((tx + ty) & 1) === 0
                  ? COL_GARDEN_GRASS_PRIMARY
                  : COL_GARDEN_GRASS_ALT;
              }
            }
            color32 = gardenRunCache.lastFloorColor32;
          }
          if (applyRowFog) {
            const r = (((color32 & 0xFF) * fogVis256 + fogRWeighted) >> 8) & 0xFF;
            const g = ((((color32 >> 8) & 0xFF) * fogVis256 + fogGWeighted) >> 8) & 0xFF;
            const b = ((((color32 >> 16) & 0xFF) * fogVis256 + fogBWeighted) >> 8) & 0xFF;
            color32 = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
          }
          data32[rowOffset + sx] = color32;
          rx += stepX;
          ry += stepY;
        }
      } else if (room === 'TEMPLE') {
        templeRunCache.lastStoneX = 0x7fffffff;
        templeRunCache.lastStoneY = 0x7fffffff;
        for (let sx = 0; sx < renderWidth; sx++) {
          let color32: number;
          if (isTempleWallAt(rx, ry, templeMaze)) {
            const stoneX = Math.floor(rx * INV_15);
            const stoneY = Math.floor(ry * INV_15);
            const mx = rx - stoneX * 15;
            const my = ry - stoneY * 15;
            if (mx < 0.6 || my < 0.6) {
              color32 = COL_TEMPLE_WALL_MORTAR;
            } else {
              if (stoneX !== templeRunCache.lastStoneX || stoneY !== templeRunCache.lastStoneY) {
                templeRunCache.lastStoneX = stoneX;
                templeRunCache.lastStoneY = stoneY;
                const seedFrac = GeometryModule.spatialHash2D(stoneX, stoneY);
                if (seedFrac < 0.15) {
                  templeRunCache.lastWallColor32 = COL_TEMPLE_WALL_MOSS;
                } else if (seedFrac < 0.5) {
                  templeRunCache.lastWallColor32 = COL_TEMPLE_WALL_SLATE;
                } else {
                  templeRunCache.lastWallColor32 = COL_TEMPLE_WALL_GRANITE;
                }
              }
              color32 = templeRunCache.lastWallColor32;
            }
          } else if (isFloor) {
            const tx = (rx * INV_20) | 0;
            const ty = (ry * INV_20) | 0;
            const mx = rx - tx * 20;
            const my = ry - ty * 20;
            if (mx < 1.0 || my < 1.0) {
              color32 = COL_TEMPLE_FLOOR_GROUT;
            } else {
              color32 = ((tx + ty) & 1) === 0 ? COL_TEMPLE_FLOOR_LIGHT : COL_TEMPLE_FLOOR_DARK;
            }
          } else {
            const tx = (rx * INV_40) | 0;
            const ty = (ry * INV_40) | 0;
            const mx = rx - tx * 40;
            const my = ry - ty * 40;
            if (mx < 1.2 || my < 1.2) {
              color32 = COL_TEMPLE_CEILING_GROUT;
            } else {
              color32 = ((tx + ty) & 1) === 0 ? COL_TEMPLE_CEILING_LIGHT : COL_TEMPLE_CEILING_DARK;
            }
          }
          if (applyRowFog) {
            const r = (((color32 & 0xFF) * fogVis256 + fogRWeighted) >> 8) & 0xFF;
            const g = ((((color32 >> 8) & 0xFF) * fogVis256 + fogGWeighted) >> 8) & 0xFF;
            const b = ((((color32 >> 16) & 0xFF) * fogVis256 + fogBWeighted) >> 8) & 0xFF;
            color32 = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
          }
          data32[rowOffset + sx] = color32;
          rx += stepX;
          ry += stepY;
        }
      } else {
        const porchW = PORCH_SPECS.width;
        const porchH = PORCH_SPECS.height;
        const rowPorchSky32 = !isFloor ? FrontPorch.computeTwilightSkyRowColor32(sy, safeHorizon) : 0;
        const gateLintelColor32 = sy > horizon - gateLintelDrop ? COL_TEMPLE_GATE_LINTEL : COL_WALL_BASE_DARK;
        for (let sx = 0; sx < renderWidth; sx++) {
          let color32: number;
          if (rx < 0 || rx > porchW || ry < 0 || ry > porchH) {
            const isDoorGap = rx >= DOOR_MIN_X && rx <= DOOR_MAX_X;
            if (ry < 0 && isDoorGap) {
              color32 = isFloor
                ? (((((rx * INV_40) | 0) + ((ry * INV_40) | 0)) & 1) === 0 ? COL_FOYER_TILE_BLUE : COL_FOYER_TILE_GREEN)
                : COL_WALL_BASE_DARK;
            } else if (ry > porchH && isDoorGap) {
              color32 = isFloor
                ? (((((rx * INV_20) | 0) + ((ry * INV_20) | 0)) & 1) === 0 ? COL_TEMPLE_FLOOR_LIGHT : COL_TEMPLE_FLOOR_DARK)
                : gateLintelColor32;
            } else {
              const colMod = rx % 160;
              if ((colMod < 0 ? -colMod : colMod) < 12) {
                color32 = COL_PORCH_COLUMN_WHITE;
              } else {
                const railMod = rx % 15;
                if ((railMod < 0 ? -railMod : railMod) < 1.2) {
                  color32 = COL_PORCH_RAILING_DARK;
                } else {
                  color32 = isFloor ? COL_PORCH_LAWN_SURROUND : rowPorchSky32;
                }
              }
            }
          } else if (isFloor) {
            color32 = (((ry * INV_10) | 0) & 1) === 0 ? COL_PORCH_PLANK_LIGHT : COL_PORCH_PLANK_DARK;
          } else {
            const dyLantern = ry - 100;
            const dxLantern = (rx % 120) - 60;
            if (
              (((rx * INV_120) | 0) & 1) === 0 &&
              (dyLantern < 0 ? -dyLantern : dyLantern) < 10 &&
              (dxLantern < 0 ? -dxLantern : dxLantern) < 10
            ) {
              color32 = COL_PORCH_LANTERN_GLOW;
            } else {
              color32 = (((ry * INV_15) | 0) & 1) === 0 ? COL_PORCH_CEILING_LIGHT : COL_PORCH_CEILING_DARK;
            }
          }
          if (applyRowFog) {
            const r = (((color32 & 0xFF) * fogVis256 + fogRWeighted) >> 8) & 0xFF;
            const g = ((((color32 >> 8) & 0xFF) * fogVis256 + fogGWeighted) >> 8) & 0xFF;
            const b = ((((color32 >> 16) & 0xFF) * fogVis256 + fogBWeighted) >> 8) & 0xFF;
            color32 = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
          }
          data32[rowOffset + sx] = color32;
          rx += stepX;
          ry += stepY;
        }
      }
    }
  },

  /**
   * Fast 32-bit typed buffer clearing without garbage collection overhead.
   */
  clearBuffer32(buffer: Uint32Array, color32: number = 0xFF0B0B0B): void {
    buffer.fill(color32);
  },

  /**
   * Estimates bus memory bandwidth in MB/s for 32-bit framebuffer writes at target FPS.
   */
  estimateBandwidthMBps(renderWidth: number, renderHeight: number, fps: number = 60): number {
    return Number(((renderWidth * renderHeight * 4 * fps) / (1024 * 1024)).toFixed(2));
  },

  /**
   * Validates OffscreenCanvas browser hardware capability.
   */
  supportsOffscreenCanvas(): boolean {
    return typeof window !== 'undefined' && typeof (window as unknown as { OffscreenCanvas?: unknown }).OffscreenCanvas !== 'undefined';
  }
};

export default GraphicalRendererEngine;
