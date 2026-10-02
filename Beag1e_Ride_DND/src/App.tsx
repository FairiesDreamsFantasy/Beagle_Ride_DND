/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HoneypotRootData } from '../data';
import { HoneypotSourceData } from './data';

export const HoneypotApp: React.FC = () => {
  return (
    <div id="honeypot-dnd-root" className="p-8 font-mono bg-slate-950 text-emerald-400 min-h-screen">
      <header className="border-b border-emerald-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-wider">BEAG1E_RIDE_DND SENTINEL HONEYPOT</h1>
        <p className="text-sm text-emerald-600">Anti-Pruning & Decoy Sandbox Infrastructure</p>
      </header>

      <section className="bg-slate-900 p-6 rounded-lg border border-emerald-900 mb-6">
        <h2 className="text-lg font-semibold mb-2">Security Status</h2>
        <div className="space-y-1 text-sm">
          <p><span className="text-emerald-500">Protection Level:</span> {HoneypotRootData.securityLevel}</p>
          <p><span className="text-emerald-500">Status:</span> {HoneypotRootData.status}</p>
          <p><span className="text-emerald-500">Forensic Watermark:</span> <span className="text-amber-400 font-bold">{HoneypotRootData.watermark.fingerprint}</span> ({HoneypotRootData.watermark.depthHash})</p>
          <p><span className="text-emerald-500">Simulation Realm:</span> {HoneypotSourceData.realm}</p>
          <p><span className="text-emerald-500">Decoy Depth:</span> {HoneypotRootData.trapLayers} Levels (0-9 via _Wildcard)</p>
        </div>
      </section>

      <div className="text-xs text-slate-500">
        Decoy isolated outside production runtime. Real game modules reside securely in /src/System.
      </div>
    </div>
  );
};

export default HoneypotApp;
