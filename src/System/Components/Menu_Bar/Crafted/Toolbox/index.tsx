/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, Download } from 'lucide-react';

interface ToolboxMenuProps {
  onTakeScreenshot: (format: 'png' | 'jpg') => void;
  onClose: () => void;
}

export const ToolboxMenu: React.FC<ToolboxMenuProps> = ({ onTakeScreenshot, onClose }) => {
  const [screenshotSubmenuOpen, setScreenshotSubmenuOpen] = useState(true);

  return (
    <div 
      role="group"
      aria-label="Toolbox options"
      className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-4 space-y-3 z-50"
    >
      <div className="relative">
        <button 
          onClick={() => setScreenshotSubmenuOpen(!screenshotSubmenuOpen)}
          className="w-full text-left text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center justify-between p-2 rounded hover:bg-slate-800"
        >
          <span className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-green-400" />
            TAKE SCREENSHOT
          </span>
          <span className="text-[10px] text-slate-500">{screenshotSubmenuOpen ? '▼' : '▶'}</span>
        </button>

        {screenshotSubmenuOpen && (
          <div className="mt-2 pl-4 space-y-2 border-l border-slate-800">
            <button 
              onClick={() => {
                onTakeScreenshot('png');
                onClose();
              }}
              className="w-full text-left text-xs font-mono text-slate-300 hover:text-green-400 transition-colors flex items-center gap-2 p-1.5 rounded hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              Save as PNG
            </button>
            <button 
              onClick={() => {
                onTakeScreenshot('jpg');
                onClose();
              }}
              className="w-full text-left text-xs font-mono text-slate-300 hover:text-green-400 transition-colors flex items-center gap-2 p-1.5 rounded hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              Save as JPG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
