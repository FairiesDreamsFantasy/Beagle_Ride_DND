/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * IndexedDB support for ultra-clientside data handling.
 */

export const initDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BeagleRideDB', 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('gameData')) {
        db.createObjectStore('gameData', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
