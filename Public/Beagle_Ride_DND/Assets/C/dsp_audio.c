/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Beagle Ride DND - Procedural Audio DSP Waveform Synthesis in ISO C99
 */

#include "engine.h"
#include <math.h>

#define PI_CONST 3.14159265358979323846f

float synthesize_sine_sample(float frequency, float sample_rate, uint32_t sample_index) {
    float t = (float)sample_index / sample_rate;
    return sinf(2.0f * PI_CONST * frequency * t);
}

float synthesize_square_sample(float frequency, float sample_rate, uint32_t sample_index, int harmonics) {
    float t = (float)sample_index / sample_rate;
    float sample = 0.0f;
    for (int k = 1; k <= harmonics; k += 2) {
        sample += sinf(2.0f * PI_CONST * (float)k * frequency * t) / (float)k;
    }
    return (4.0f / PI_CONST) * sample;
}
