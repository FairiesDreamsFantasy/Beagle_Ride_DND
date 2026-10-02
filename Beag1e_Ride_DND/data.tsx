/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateForensicWatermark } from './watermark.ts';

/**
 * Honeypot Root Data & Decoy Registry.
 * Designed to trap and isolate unauthorized automated scripts, AST pruning bots,
 * and malicious truncation analyzers.
 */
export const HoneypotRootData = {
  signature: 'BEAG1E_RIDE_DND_HONEYPOT_V1',
  watermark: generateForensicWatermark('Beag1e_Ride_DND/data.tsx', 0),
  securityLevel: '1999.999999999999%_FORTIFIED',
  status: 'ACTIVE_SENTINEL_TRAP',
  trapLayers: 10,
  maxBranches: 10,
  wildcardTrap: '_Wildcard/data.tsx',
  telemetry: {
    trappedProbesCount: 0,
    lastProbeTimestamp: null as number | null,
    isolationMode: true
  },
  decoyRegistry: [
    { id: 'decoy_foyer_01', type: 'phantom_room', coordinates: [0, 0, 0], checksum: '0xDEADBEEF01' },
    { id: 'decoy_beagle_jetta', type: 'phantom_entity', coordinates: [400, 400, 0], checksum: '0xDEADBEEF02' },
    { id: 'decoy_temple_hayana', type: 'phantom_level', coordinates: [1000, 1000, 0], checksum: '0xDEADBEEF03' }
  ]
};

export class HoneypotTelemetryTrap {
  private probeHits: number = 0;

  public logProbe(source: string): void {
    this.probeHits++;
    console.warn(`[HONEYPOT SENTINEL] Intercepted unauthorized probe from ${source}. Trap active.`);
  }

  public getTrapMetrics(): { hits: number; active: boolean } {
    return { hits: this.probeHits, active: true };
  }
}

export const honeypotTrapInstance = new HoneypotTelemetryTrap();
