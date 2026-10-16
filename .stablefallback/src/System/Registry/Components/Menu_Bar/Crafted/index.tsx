/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MenuBarCraftedRegistry = {
  menuItems: [
    { id: 'FILE', label: 'FILE', shortcut: 'Alt+Shift+F' },
    { id: 'EDIT', label: 'EDIT' },
    { id: 'VIEW', label: 'VIEW' },
    { id: 'ACCESSIBILITY', label: 'ACCESSIBILITY' },
    { id: 'HELP', label: 'HELP' }
  ],
  accessibilityToggles: [
    { id: 'ttsEnabled', label: 'TTS ENGINE' },
    { id: 'turningTonesEnabled', label: 'Turning Tones' },
    { id: 'barkNotificationsEnabled', label: 'Bark Narration' },
    { id: 'jumpNotificationsEnabled', label: 'Jump Notify' },
    { id: 'pettingDescriptionsEnabled', label: 'Petting Desc' },
    { id: 'collarGraspDescriptionsEnabled', label: 'Collar Grasp' },
    { id: 'leaningDescriptionsEnabled', label: 'Leaning Desc' }
  ]
};
