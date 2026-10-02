/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './General/index';

export const InputEngine = {
  isMenuFocused: () => {
    return !!(document.activeElement?.closest('#Menu_Bar') || ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName || ''));
  }
};
