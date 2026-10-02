/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LinuxKernelProfile {
  osName: 'Linux';
  kernelArchitecture: 'x86_64' | 'aarch64' | 'armv7l' | 'wasm32' | 'unknown';
  hasPOSIXSignals: boolean;
  hasSharedArrayBuffer: boolean;
  glVendor: string;
}

/**
 * Linux Environment and Open-Source POSIX Detection Module.
 * Profiles Linux kernel capabilities, concurrency vectors, and WebGL subsystem pipelines.
 */
export class LinuxOSModule {
  private static instance: LinuxOSModule | null = null;

  public static getInstance(): LinuxOSModule {
    if (!LinuxOSModule.instance) {
      LinuxOSModule.instance = new LinuxOSModule();
    }
    return LinuxOSModule.instance;
  }

  public detectLinuxEnvironment(): LinuxKernelProfile {
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const ua = isBrowser ? (navigator.userAgent || '') : 'Linux-Server';
    const platform = isBrowser ? (navigator.platform || '') : 'Linux';

    let kernelArchitecture: 'x86_64' | 'aarch64' | 'armv7l' | 'wasm32' | 'unknown' = 'x86_64';
    if (/aarch64|arm64/i.test(ua) || /aarch64|arm64/i.test(platform)) {
      kernelArchitecture = 'aarch64';
    } else if (/arm/i.test(ua) || /arm/i.test(platform)) {
      kernelArchitecture = 'armv7l';
    }

    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

    let glVendor = 'Generic Open-Source Driver';
    if (isBrowser) {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          if (ext) {
            glVendor = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || glVendor;
          }
        }
      } catch {
        glVendor = 'Mesa/Generic Driver';
      }
    }

    return {
      osName: 'Linux',
      kernelArchitecture,
      hasPOSIXSignals: typeof process !== 'undefined' && typeof process.kill === 'function',
      hasSharedArrayBuffer,
      glVendor
    };
  }
}

export const linuxOSModule = LinuxOSModule.getInstance();
export default linuxOSModule;
