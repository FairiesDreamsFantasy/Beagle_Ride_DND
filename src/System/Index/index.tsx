/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';
export * from './Engine/index';
export * from './Game_Boot/index';

import React from 'react';
import { SystemIndexRegister } from './General/index';

export const systemIndexRegisterInstance = new SystemIndexRegister();

export const SystemIndex: React.FC = () => {
  return (
    <div id="system-index-root" className="hidden" aria-hidden="true">
      System Index Root Module
    </div>
  );
};
export default SystemIndex;
