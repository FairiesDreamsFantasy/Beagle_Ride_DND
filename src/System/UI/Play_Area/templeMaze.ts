/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Temple of Hayana Simple Room Set Generator
// Total Surface Area: 2000 x 2000 feet.
// Grid Pitch: 9 feet per cell (8 feet open floor, 1 foot (12-inch) thick stone masonry wall).
// Coordinates: X [0, 2000], Y [0, 2000].
// Grid Cells: 222 x 222 (9 * 222 = 1998 feet).

const MAZE_SIZE = 222;
const MAZE_STRIDE = MAZE_SIZE + 1; // 223
const H_WALL_BIT = 1;
const V_WALL_BIT = 2;

export interface TempleMazeData {
  wallBits: Uint8Array; // 223 x 223 packed bitfield (~48.6 KiB single contiguous buffer)
  stride: number;
}

export function generateTempleMaze(): TempleMazeData {
  const wallBits = new Uint8Array(MAZE_STRIDE * MAZE_STRIDE);
  wallBits.fill(H_WALL_BIT | V_WALL_BIT);

  const clearH = (cy: number, cx: number) => {
    wallBits[cy * MAZE_STRIDE + cx] &= ~H_WALL_BIT;
  };
  const clearV = (cy: number, cx: number) => {
    wallBits[cy * MAZE_STRIDE + cx] &= ~V_WALL_BIT;
  };
  const setH = (cy: number, cx: number, solid: boolean) => {
    const idx = cy * MAZE_STRIDE + cx;
    if (solid) wallBits[idx] |= H_WALL_BIT;
    else wallBits[idx] &= ~H_WALL_BIT;
  };
  const setV = (cy: number, cx: number, solid: boolean) => {
    const idx = cy * MAZE_STRIDE + cx;
    if (solid) wallBits[idx] |= V_WALL_BIT;
    else wallBits[idx] &= ~V_WALL_BIT;
  };

  // Helper to carve out an open rectangular chamber
  // x1, x2, y1, y2 are inclusive cell indices [0, 222]
  const carveRoom = (x1: number, x2: number, y1: number, y2: number) => {
    for (let cy = y1; cy <= y2; cy++) {
      for (let cx = x1; cx <= x2; cx++) {
        if (cx > x1) clearV(cy, cx);
        if (cy > y1) clearH(cy, cx);
      }
    }
  };

  // --- Carve out the Simple Set of 5 Grand Majestic Rooms ---
  // 1. North Entrance Hall (X: ~810 to 1188 ft, Y: ~9 to 360 ft)
  carveRoom(90, 132, 1, 40);
  // 2. Grand Central Sanctuary (X: ~540 to 1458 ft, Y: ~360 to 1260 ft)
  carveRoom(60, 162, 40, 140);
  // 3. West Hall of Wisdom (X: ~9 to 540 ft, Y: ~540 to 1080 ft)
  carveRoom(1, 60, 60, 120);
  // 4. East Gallery of Echoes (X: ~1458 to 1989 ft, Y: ~540 to 1080 ft)
  carveRoom(162, 221, 60, 120);
  // 5. South Chamber of Quiet Reflection (X: ~675 to 1323 ft, Y: ~1260 to 1989 ft)
  carveRoom(75, 147, 140, 221);

  // --- Connect the chambers with wide, unobstructed doorways ---
  // North Gate leading back to Front Porch (centered around X=1000 ft, cx: 109..113)
  for (let cx = 109; cx <= 113; cx++) {
    clearH(0, cx);
    clearH(1, cx);
    if (cx > 109) clearV(0, cx);
    if (cx > 109) clearV(1, cx);
  }

  // Portal between North Entrance Hall and Grand Central Sanctuary (across cy=40)
  for (let cx = 105; cx <= 117; cx++) {
    clearH(40, cx);
  }

  // Archway between Grand Central Sanctuary and West Hall of Wisdom (across cx=60)
  for (let cy = 85; cy <= 95; cy++) {
    clearV(cy, 60);
  }

  // Archway between Grand Central Sanctuary and East Gallery of Echoes (across cx=162)
  for (let cy = 85; cy <= 95; cy++) {
    clearV(cy, 162);
  }

  // Portal between Grand Central Sanctuary and South Chamber (across cy=140)
  for (let cx = 105; cx <= 117; cx++) {
    clearH(140, cx);
  }

  // Ensure outer boundary perimeter walls [0, size] remain strictly solid
  for (let i = 0; i <= MAZE_SIZE; i++) {
    setH(0, i, i < 109 || i > 113); // North gate open
    setH(MAZE_SIZE, i, true);
    setV(i, 0, true);
    setV(i, MAZE_SIZE, true);
  }

  return {
    wallBits,
    stride: MAZE_STRIDE
  };
}

// Checks if there's a wall at world coordinates rx, ry (in feet) in O(1) cache-contiguous memory
export function isTempleWallAt(rx: number, ry: number, maze: TempleMazeData): boolean {
  if (rx < 0 || rx >= 1998 || ry < 0 || ry >= 1998) {
    return true;
  }

  const cx = (rx / 9) | 0;
  const cy = (ry / 9) | 0;
  const fx = rx - cx * 9;
  const fy = ry - cy * 9;

  if (fx >= 1.0 && fy >= 1.0) {
    return false;
  }

  const bits = maze.wallBits;
  const stride = maze.stride;
  const idx = cy * stride + cx;
  const cellBits = bits[idx];

  // Solid Corner Column/Pillar at grid intersection
  if (fx < 1.0 && fy < 1.0) {
    if (
      (cellBits & (H_WALL_BIT | V_WALL_BIT)) !== 0 ||
      (cx > 0 && (bits[idx - 1] & H_WALL_BIT) !== 0) ||
      (cy > 0 && (bits[idx - stride] & V_WALL_BIT) !== 0)
    ) {
      return true;
    }
  }

  if (fy < 1.0 && (cellBits & H_WALL_BIT) !== 0) {
    return true;
  }

  if (fx < 1.0 && (cellBits & V_WALL_BIT) !== 0) {
    return true;
  }

  return false;
}
