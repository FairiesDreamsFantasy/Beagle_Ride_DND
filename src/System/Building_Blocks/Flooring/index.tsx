/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Building_Blocks/Flooring/index.tsx
 * Flooring Building Blocks Module: Tile_Ceramic, Stone, Wooden, Ground, Brick, Concrete_Slab.
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export interface FlooringSpecs {
  readonly id: string;
  readonly name: string;
  readonly friction: number;
  readonly tileSizeBytes: number;
  readonly defaultColor32: number;
}

export const FlooringBuildingBlocks = {
  TileCeramic: {
    id: 'FLOOR_TILE_CERAMIC',
    name: 'Glazed Ceramic Royal Tile',
    friction: 0.25,
    tileSizeBytes: 40,
    defaultColor32: 0xFFCE8836,
    evaluateBevel(rx: number, ry: number, size: number): boolean {
      return Math.abs(rx % size) < 1.2 || Math.abs(ry % size) < 1.2;
    }
  },
  Stone: {
    id: 'FLOOR_STONE',
    name: 'Chiseled Temple Stone Masonry',
    friction: 0.40,
    tileSizeBytes: 20,
    defaultColor32: 0xFF2D333C,
    evaluateRoughness(seed: number): number {
      return 0.85 + (seed % 15) * 0.01;
    }
  },
  Wooden: {
    id: 'FLOOR_WOODEN',
    name: 'Hardwood Oak Plank Flooring',
    friction: 0.30,
    tileSizeBytes: 10,
    defaultColor32: 0xFF1A222D,
    evaluatePlankLine(ry: number, tileSize: number): boolean {
      return (Math.floor(ry / tileSize) & 1) === 0;
    }
  },
  Ground: {
    id: 'FLOOR_GROUND',
    name: 'Natural Earth & Meadow Turf',
    friction: 0.55,
    tileSizeBytes: 20,
    defaultColor32: 0xFF2D8A4E,
    evaluateMoisture(hash: number): boolean {
      return hash > 0.7;
    }
  },
  Brick: {
    id: 'FLOOR_BRICK',
    name: 'Red Clay Courtyard Brick',
    friction: 0.35,
    tileSizeBytes: 15,
    defaultColor32: 0xFF4A2E2B,
    evaluateMortar(rx: number, ry: number): boolean {
      return Math.abs(rx % 15) < 0.8 || Math.abs(ry % 15) < 0.8;
    }
  },
  ConcreteSlab: {
    id: 'FLOOR_CONCRETE',
    name: 'Industrial Troweled Concrete Slab',
    friction: 0.20,
    tileSizeBytes: 80,
    defaultColor32: 0xFF3E444A,
    evaluateJoint(rx: number, ry: number, size: number): boolean {
      return Math.abs(rx % size) < 0.5 || Math.abs(ry % size) < 0.5;
    }
  }
};

export default FlooringBuildingBlocks;
