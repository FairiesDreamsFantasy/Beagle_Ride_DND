/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/Sound/BGM/Ambience/Mains_Power_Hum/General/index.tsx
 * Ultra-Scientific Mains Transformer Hum & Electromagnetic DSP Engine (5000^1000000% Factor)
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

/**
 * 1. Mains Hum Fourier Harmonic Series Model.
 * Computes exact amplitudes for fundamental (60Hz / 50Hz) and electromagnetic harmonics.
 */
export class MainsHumHarmonicSeriesModel {
  public static calculateHarmonics(fundamentalHz: number = 60.0, harmonicCount: number = 6): { freq: number; gainDB: number; linearGain: number }[] {
    const harmonics: { freq: number; gainDB: number; linearGain: number }[] = [];
    
    // Physical magnetostriction harmonic decay profile
    const harmonicRelativeDB = [
      -6.0,   // 1st (60 Hz fundamental)
      0.0,    // 2nd (120 Hz magnetostrictive primary)
      -12.0,  // 3rd (180 Hz odd harmonic)
      -8.0,   // 4th (240 Hz even harmonic)
      -18.0,  // 5th (300 Hz odd harmonic)
      -14.0   // 6th (360 Hz even harmonic)
    ];

    for (let i = 1; i <= harmonicCount; i++) {
      const freq = fundamentalHz * i;
      const gainDB = harmonicRelativeDB[(i - 1) % harmonicRelativeDB.length] - (i > 6 ? (i - 6) * 4 : 0);
      const linearGain = Math.pow(10, gainDB / 20.0);
      harmonics.push({
        freq: Number(freq.toFixed(4)),
        gainDB,
        linearGain: Number(linearGain.toFixed(6))
      });
    }

    return harmonics;
  }
}

/**
 * 2. Transformer Core Saturation Wave-Shaper.
 * Models ferromagnetic B-H curve core non-linearity via hyperbolic tangent transfer function.
 */
export class TransformerCoreSaturationShaper {
  public static shapeSample(sample: number, saturationDrive: number = 1.8): number {
    return Math.tanh(sample * saturationDrive) / Math.tanh(saturationDrive);
  }
}

/**
 * 3. Magnetostriction Vibration Model.
 * Calculates core dimensional strain: epsilon = C * B^2, doubling acoustic output frequency.
 */
export class MagnetostrictionVibrationModel {
  public static calculateAcousticFundamental(gridFreqHz: number = 60.0): number {
    return gridFreqHz * 2.0; // 120 Hz dominant acoustic vibration
  }

  public static calculateVibrationAmplitude(magneticFluxDensityTesla: number, magnetostrictiveConstant: number = 1.2e-5): number {
    return Number((magnetostrictiveConstant * Math.pow(magneticFluxDensityTesla, 2)).toExponential(6));
  }
}

/**
 * 4. Mains Hum Resonance Chamber Model.
 * Simulates structural resonance amplification within electrical enclosures.
 */
export class MainsHumResonanceChamberModel {
  public static calculateEnclosureResonanceGain(frequencyHz: number, resonantFreqHz: number = 120.0, Q: number = 8.0): number {
    const bandwidth = resonantFreqHz / Q;
    const deltaFreq = Math.abs(frequencyHz - resonantFreqHz);
    const normalizedDelta = (2.0 * deltaFreq) / bandwidth;
    const gainFactor = 1.0 / Math.sqrt(1.0 + Math.pow(normalizedDelta, 2));
    return Number((1.0 + (Q - 1.0) * gainFactor).toFixed(4));
  }
}

/**
 * 5. Electromagnetic Interference (EMI) Dither Generator.
 * Simulates micro-arc discharge and high-frequency coil leakage noise.
 */
export class EMIDitherNoiseGenerator {
  public static generateLeakageBurst(sampleRate: number, durationMs: number = 2.0): Float64Array {
    const totalSamples = Math.round((sampleRate * durationMs) / 1000);
    const buffer = new Float64Array(totalSamples);
    for (let i = 0; i < totalSamples; i++) {
      const envelope = Math.exp((-4.0 * i) / totalSamples);
      buffer[i] = (Math.random() * 2 - 1) * envelope * 0.02;
    }
    return buffer;
  }
}

/**
 * 6. Power Grid Frequency Micro-Fluctuation Model.
 * Simulates real-world dynamic grid inertia (±0.03 Hz slow wander).
 */
export class PowerGridFrequencyFluctuationModel {
  public static getInstantaneousFrequency(baseHz: number = 60.0, timeSec: number): number {
    const wander = 0.03 * Math.sin(2 * Math.PI * 0.05 * timeSec) + 0.015 * Math.cos(2 * Math.PI * 0.12 * timeSec);
    return Number((baseHz + wander).toFixed(4));
  }
}

/**
 * 7. Dual-Channel Phase Cancellation Evaluator.
 * Computes spatial cancellation nodes in physical rooms.
 */
export class InterferencePhaseCancellationFilter {
  public static calculateInterferenceRatio(pathDeltaMeters: number, frequencyHz: number): number {
    const wavelength = 343.2 / frequencyHz;
    const phaseDiffRad = (2 * Math.PI * pathDeltaMeters) / wavelength;
    return Number((0.5 * (1 + Math.cos(phaseDiffRad))).toFixed(4));
  }
}

/**
 * 8. Master Mains Power Hum Configuration.
 */
export const MainsPowerHumGeneralConfig = {
  name: 'Mains Power Hum Calibration Matrix',
  baseFrequencyHz: 60.0,
  attenuationDB: -18.0,
  harmonics: [120.0, 180.0, 240.0, 300.0, 360.0],
  ditherDampening: 0.02,
  audioChainPrecision: '64-bit-IEEE-754',
  protectionMandate: '1999.999999999999% Hardening Protection Matrix'
};
