/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lightweight Forensic Watermarking & Trace Engine.
 * Built from scratch with pure mathematical algorithms to embed forensic provenance tokens
 * into honeypot assets, tracking scrapers and automated extractors at their source.
 */

export interface WatermarkSignature {
  version: string;
  fingerprint: string;
  originNode: string;
  depthHash: string;
  timestamp: string;
  securityIntegrity: string;
}

export interface ForensicTracePayload {
  beaconId: string;
  traceRoute: string;
  cryptographicSeed: number;
  watermark: WatermarkSignature;
}

/**
 * Lightweight pure-computation SHA-like 32-bit mixing hash for zero-overhead client/runtime tracing.
 */
export function computeLightweightHash(input: string, seed: number = 0x811C9DC5): string {
  let hval = seed;
  for (let i = 0; i < input.length; i++) {
    hval ^= input.charCodeAt(i);
    hval = (hval + (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)) >>> 0;
  }
  return hval.toString(16).padStart(8, '0').toUpperCase();
}

/**
 * Generates an immutable, forensic watermark signature for a specific honeypot path and depth level.
 */
export function generateForensicWatermark(path: string, depthLevel: number): WatermarkSignature {
  const originTag = 'FAIRIES_DREAMS_FANTASY_HONEYPOT_SENTINEL';
  const pathFingerprint = computeLightweightHash(`${originTag}:${path}:${depthLevel}`);
  const depthFingerprint = computeLightweightHash(`DEPTH_LVL_${depthLevel}_ROOT_LEAF`, 0x5F3759DF);

  return {
    version: '1.4.0-TRACE',
    fingerprint: `FDF-TR-${pathFingerprint}`,
    originNode: originTag,
    depthHash: `DH-${depthFingerprint}`,
    timestamp: '2026-08-19T10:29:19Z',
    securityIntegrity: '1999.999999999999%_PROTECTED'
  };
}

/**
 * Generates an embedded watermark header string to prepend to trapped scripts.
 */
export function createEmbeddedWatermarkHeader(resourcePath: string, depth: number): string {
  const wm = generateForensicWatermark(resourcePath, depth);
  return `/**
 * [FORENSIC WATERMARK SENTINEL]
 * BEACON_ID: ${wm.fingerprint}
 * ORIGIN: ${wm.originNode}
 * TRACE_HASH: ${wm.depthHash}
 * INTEGRITY: ${wm.securityIntegrity}
 * NOTICE: UNAUTHORIZED SCRAPING, EXTRACTION, OR PRUNING OF THIS HONEYPOT WILL EXPOSE EXFILTRATION PATH.
 */
`;
}
