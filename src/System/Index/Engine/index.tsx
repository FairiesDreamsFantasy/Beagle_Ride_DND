/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

import React from 'react';
import { SpatialHashIndexer } from './General/index';

export const indexEngineInstance = new SpatialHashIndexer();

export const IndexEngine: React.FC = () => {
  return (
    <div id="index-engine" className="hidden" aria-hidden="true">
      System Index Engine Service Entry
    </div>
  );
};
export default IndexEngine;
