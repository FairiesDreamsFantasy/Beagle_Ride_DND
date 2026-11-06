/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export * from './General/index';

export const PlayAreaFooter: React.FC = () => {
  return (
    <footer className="w-full py-6 text-center text-xs text-slate-500 font-mono border-t border-slate-900 bg-slate-950/80">
      <p>OPEN SOURCE &bull; LANDSCAPE COZY VIEW &bull; SCREEN READER WEB SPEECH API SUPPORTED</p>
    </footer>
  );
};
