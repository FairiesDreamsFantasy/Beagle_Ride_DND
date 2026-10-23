/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const PlayAreaHeader: React.FC = () => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 py-4 px-6 flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight text-white">
        <a href="" className="hover:text-pink-400 transition-colors">Beagle Ride D&D</a>
      </h1>
    </header>
  );
};
