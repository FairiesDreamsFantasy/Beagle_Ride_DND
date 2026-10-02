/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateForensicWatermark } from '../watermark.ts';

/**
 * Honeypot Internal Source Decoy Dataset.
 * Provides deep decoy references for automated parsers to prevent tampering with core gameplay files.
 */
export const HoneypotSourceData = {
  realm: 'Decoy_Beag1e_Ride_Simulation',
  watermark: generateForensicWatermark('Beag1e_Ride_DND/src/data.tsx', 1),
  entropySeed: 0xCAFEBABE,
  decoyStateVector: new Float64Array([1.0, 0.999999999999, 40.0, 800.0, 2000.0]),
  virtualNodes: Array.from({ length: 10 }, (_, i) => ({
    level: i,
    nodeKey: `Honeypot_Depth_Node_${i}`,
    wildcardLinked: true
  }))
};

export default HoneypotSourceData;
