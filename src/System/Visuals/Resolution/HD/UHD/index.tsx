/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Ultra High-Definition (UHD) Visuals Module (3840x2160).
 */
export const UHDVisualsModule = {
  id: 'UHD' as const,
  resolution: '4K',
  width: 3840,
  height: 2160,
  aspectRatio: 16 / 9,
  hdr: true,
  refreshRate: 120,
  mipLevel: 3
};

export default UHDVisualsModule;
