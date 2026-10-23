/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Temple of Hayana Simple Room Set Generator
// Total Surface Area: 2000 x 2000 feet.
// Grid Pitch: 9 feet per cell (8 feet open floor, 1 foot (12-inch) thick stone masonry wall).
// Coordinates: X [0, 2000], Y [0, 2000].
// Grid Cells: 222 x 222 (9 * 222 = 1998 feet).

export interface TempleMazeData {
  horizontalWalls: boolean[][]; // size 223 x 223
  verticalWalls: boolean[][];   // size 223 x 223
}

export function generateTempleMaze(): TempleMazeData {
  const size = 222;
  const horizontalWalls: boolean[][] = Array(size + 1).fill(null).map(() => Array(size + 1).fill(true));
  const verticalWalls: boolean[][] = Array(size + 1).fill(null).map(() => Array(size + 1).fill(true));

  // Helper to carve out an open rectangular chamber
  // x1, x2, y1, y2 are inclusive cell indices [0, 222]
  const carveRoom = (x1: number, x2: number, y1: number, y2: number) => {
    for (let cy = y1; cy <= y2; cy++) {
      for (let cx = x1; cx <= x2; cx++) {
        if (cx > x1) verticalWalls[cy][cx] = false;
        if (cy > y1) horizontalWalls[cy][cx] = false;
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
    horizontalWalls[0][cx] = false;
    horizontalWalls[1][cx] = false;
    // Clear vertical partitions within the gate area to prevent mid-gate blocking
    if (cx > 109) verticalWalls[0][cx] = false;
    if (cx > 109) verticalWalls[1][cx] = false;
  }

  // Portal between North Entrance Hall and Grand Central Sanctuary (across cy=40)
  for (let cx = 105; cx <= 117; cx++) {
    horizontalWalls[40][cx] = false;
  }

  // Archway between Grand Central Sanctuary and West Hall of Wisdom (across cx=60)
  for (let cy = 85; cy <= 95; cy++) {
    verticalWalls[cy][60] = false;
  }

  // Archway between Grand Central Sanctuary and East Gallery of Echoes (across cx=162)
  for (let cy = 85; cy <= 95; cy++) {
    verticalWalls[cy][162] = false;
  }

  // Portal between Grand Central Sanctuary and South Chamber (across cy=140)
  for (let cx = 105; cx <= 117; cx++) {
    horizontalWalls[140][cx] = false;
  }

  // Ensure outer boundary perimeter walls [0, size] remain strictly solid
  for (let i = 0; i <= size; i++) {
    horizontalWalls[0][i] = (i < 109 || i > 113); // North gate open
    horizontalWalls[size][i] = true;
    verticalWalls[i][0] = true;
    verticalWalls[i][size] = true;
  }

  return {
    horizontalWalls,
    verticalWalls
  };
}

// Checks if there's a wall at world coordinates rx, ry (in feet)
export function isTempleWallAt(rx: number, ry: number, maze: TempleMazeData): boolean {
  // Boundary check
  if (rx < 0 || rx >= 1998 || ry < 0 || ry >= 1998) {
    return true;
  }

  const cx = Math.floor(rx / 9);
  const cy = Math.floor(ry / 9);

  const fx = rx % 9;
  const fy = ry % 9;

  // Solid Corner Column/Pillar at the intersection of grid lines
  if (fx < 1.0 && fy < 1.0) {
    // Only solid if at least one connected wall exists at this grid intersection
    const hasConnectedWall = 
      (maze.horizontalWalls[cy] && maze.horizontalWalls[cy][cx]) ||
      (cx > 0 && maze.horizontalWalls[cy] && maze.horizontalWalls[cy][cx - 1]) ||
      (maze.verticalWalls[cy] && maze.verticalWalls[cy][cx]) ||
      (cy > 0 && maze.verticalWalls[cy - 1] && maze.verticalWalls[cy - 1][cx]);

    if (hasConnectedWall) {
      return true;
    }
  }

  // Top Horizontal wall (1 foot thick)
  if (fy < 1.0) {
    if (maze.horizontalWalls[cy] && maze.horizontalWalls[cy][cx]) {
      return true;
    }
  }

  // Left Vertical wall (1 foot thick)
  if (fx < 1.0) {
    if (maze.verticalWalls[cy] && maze.verticalWalls[cy][cx]) {
      return true;
    }
  }

  return false;
}
