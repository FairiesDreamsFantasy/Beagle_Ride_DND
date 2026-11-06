/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScientificBootController } from './General/index';

export * from './General/index';

export const bootControllerInstance = new ScientificBootController();

/**
 * System Game Boot Entry Component.
 * Acts as the structural anchor for the ultra-scientific boot sequence.
 */
export const GameBootIndex: React.FC = () => {
  return (
    <div id="game-boot-index" className="hidden" aria-hidden="true">
      Ultra-Scientific Game Boot Index
    </div>
  );
};

export default GameBootIndex;
