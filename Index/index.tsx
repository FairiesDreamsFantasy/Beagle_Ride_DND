/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
export * from './General/index';
import { RootIndexGeneralRegister } from './General/index';

export const rootIndexGeneralRegisterInstance = new RootIndexGeneralRegister();

export const RootIndex: React.FC = () => {
  return (
    <div id="root-index-core" className="hidden" aria-hidden="true">
      Root Index Module
    </div>
  );
};

export default RootIndex;
