/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TextBasedHUD } from './Text_based/index';
import { VisualHUD } from './Visual/index';

export * from './General/index';

export const HUD: React.FC = () => {
  return (
    <div className="w-full flex flex-col">
      <TextBasedHUD />
      <VisualHUD />
    </div>
  );
};
