/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import HoneypotApp from './App.tsx';

const rootElement = document.getElementById('honeypot-root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <HoneypotApp />
    </StrictMode>
  );
}
