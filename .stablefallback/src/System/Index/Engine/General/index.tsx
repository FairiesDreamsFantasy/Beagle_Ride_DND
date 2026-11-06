/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Core Index Engine General Configuration.
 */
export const IndexEngineGeneralConfig = {
  name: 'High-Precision Index Engine',
  version: '1.0.0',
  spatialBucketSize: 40 // Matches floor tile size for coordinate indexing
};

/**
 * Mathematical 2D Spatial Hash Indexer for physics collision acceleration.
 * Divides coordinate spaces into buckets of size 40x40 feet (matching flooring bounds),
 * allowing O(1) query complexity for spatial proximity checks of riders, beagles, or obstacles.
 */
export class SpatialHashIndexer {
  private bucketSize: number;
  private buckets: Map<string, Set<string>> = new Map();

  constructor(bucketSize: number = 40) {
    this.bucketSize = bucketSize;
  }

  /**
   * Hashes a 2D position coordinate to a unique bucket key.
   */
  public getBucketKey(x: number, y: number): string {
    const bx = Math.floor(x / this.bucketSize);
    const by = Math.floor(y / this.bucketSize);
    return `${bx},${by}`;
  }

  /**
   * Indexes an entity's 2D coordinate positions.
   */
  public indexEntity(id: string, x: number, y: number): void {
    const key = this.getBucketKey(x, y);
    if (!this.buckets.has(key)) {
      this.buckets.set(key, new Set());
    }
    this.buckets.get(key)!.add(id);
  }

  /**
   * Retrieves all entity IDs indexed within the specified coordinate area.
   */
  public queryArea(x: number, y: number): string[] {
    const key = this.getBucketKey(x, y);
    const bucket = this.buckets.get(key);
    return bucket ? Array.from(bucket) : [];
  }

  /**
   * Flushes all indexes to prevent stale referencing memory leaks.
   */
  public clear(): void {
    this.buckets.clear();
  }
}

export const IndexEngineGeneral: React.FC = () => {
  return (
    <div id="index-engine-general" className="hidden" aria-hidden="true">
      Index Engine General Configuration
    </div>
  );
};
