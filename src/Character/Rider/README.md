# Rider Character Subsystem

## Overview
Defines all humanoid rider profiles, kinematic balance vectors, leaning physics transformations, and perspective camera heights.

## Characters
1. **Fairy-Rider (`FAIRY_RIDER`)**:
   * Personal character of the creator (nickname: Fairy-Rider).
   * Eye height: 5.17 ft (standing 5'4").
   * Complexion: Dark-Brown (Black) skin, black hair.
   * Attire: Blue onesie with green geometric triangles and black borders, brown shoes, white socks.
   * Dynamics: Agile lean response, centered gravity distribution.

2. **Mary (`MARY`)**:
   * Eye height: 6.0 ft (standing 6'3").
   * Complexion: Peach skin, wavy white hair.
   * Attire: Pink dress with white apron, Cinderella-style puffy shoulders, pink onesie (undergarment), flat white shoes, white socks.
   * Dynamics: Stable upright stance, balanced kinematic lean recovery. Babylon-free.

## Modules
* **2-D/**: Bilinear flat sprite projections.
* **3-D/**: Homogeneous matrix perspective projection and polygon vertices.
* **Pixelations/**: Integer-quantized retro rasterization matrices.
* **Polygons/**: Structural boundary facets for 3D meshes.
* **POV/**: Camera offset and eye-level raycast origins.
