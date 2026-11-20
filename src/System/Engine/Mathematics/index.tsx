/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './Addition/index';
export * from './Subtraction/index';
export * from './Multiplication/index';
export * from './Division/index';
export * from './Algebra/index';
export * from './Calculus/index';
export * from './Geometry/index';
export * from './Trigonometry/index';
export * from './LUT/Shading';
export * from './LUT/Trig';
export * from './LUT/Trigonometry';

import { AdditionModule } from './Addition/index';
import { SubtractionModule } from './Subtraction/index';
import { MultiplicationModule } from './Multiplication/index';
import { DivisionModule } from './Division/index';
import { AlgebraModule } from './Algebra/index';
import { CalculusModule } from './Calculus/index';
import { GeometryModule } from './Geometry/index';
import { TrigonometryModule } from './Trigonometry/index';

export const MathematicsEngine = {
  Addition: AdditionModule,
  Subtraction: SubtractionModule,
  Multiplication: MultiplicationModule,
  Division: DivisionModule,
  Algebra: AlgebraModule,
  Calculus: CalculusModule,
  Geometry: GeometryModule,
  Trigonometry: TrigonometryModule
};

export default MathematicsEngine;
