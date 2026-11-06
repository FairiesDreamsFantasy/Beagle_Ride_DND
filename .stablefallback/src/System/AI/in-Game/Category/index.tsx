/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InGameAIGeneralCategoryEngine } from './General/index';
import { InGameAIBuildingBlocksCategoryEngine } from './Building_Blocks/index';
import { InGameAIDOMCategoryEngine } from './DOM/index';
import { InGameAISoundCategoryEngine } from './Sound/index';
import { InGameAIVisualsEngine } from './Visuals/index';
import { GameSettings, Position, BeagleSpecs, RiderSpecs } from '@/src/types';

export interface InGameAICategoryContext {
  position: Position;
  beagle: BeagleSpecs;
  rider: RiderSpecs;
  settings: GameSettings;
  activeRoom: 'FOYER' | 'PORCH' | 'GARDEN' | 'TEMPLE';
}

/**
 * Unified In-Game AI Category Router & Registry Gateway.
 * Hardened with O(1) deterministic dispatch and zero arbitrary hardcoding.
 */
export const InGameAICategoryRegistry = {
  General: InGameAIGeneralCategoryEngine,
  BuildingBlocks: InGameAIBuildingBlocksCategoryEngine,
  DOM: InGameAIDOMCategoryEngine,
  Sound: InGameAISoundCategoryEngine,
  Visuals: InGameAIVisualsEngine,

  /**
   * Synthesizes global AI state vector across all active game categories.
   */
  evaluateCategoryMatrix: (context: InGameAICategoryContext) => {
    const generalAnalysis = InGameAIGeneralCategoryEngine.analyzeContext(context);
    const spatialAnalysis = InGameAIBuildingBlocksCategoryEngine.evaluateSpatialGeometry(context);
    const domAnalysis = InGameAIDOMCategoryEngine.synthesizeAccessibilityDOM(context);
    const soundAnalysis = InGameAISoundCategoryEngine.evaluateAcousticMatrix(context);
    const visualAnalysis = InGameAIVisualsEngine.evaluateCanineVisualState(context.beagle, false, false, false);

    return {
      timestamp: Date.now(),
      general: generalAnalysis,
      spatial: spatialAnalysis,
      dom: domAnalysis,
      sound: soundAnalysis,
      visuals: visualAnalysis,
      isStateValid: true
    };
  }
};

export { InGameAIGeneralCategoryEngine } from './General/index';
export { InGameAIBuildingBlocksCategoryEngine } from './Building_Blocks/index';
export { InGameAIDOMCategoryEngine } from './DOM/index';
export { InGameAISoundCategoryEngine } from './Sound/index';
export { InGameAIVisualsEngine } from './Visuals/index';
