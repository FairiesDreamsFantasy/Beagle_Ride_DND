/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * LocalStorage management for client-side persistence.
 */

export const saveToLocal = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Local Storage Save Error', e);
  }
};

export const loadFromLocal = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};
