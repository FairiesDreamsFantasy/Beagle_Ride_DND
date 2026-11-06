/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Beagle Ride DND - High-Performance Standalone C Engine Definitions
 */

#ifndef BEAGLE_RIDE_DND_ENGINE_H
#define BEAGLE_RIDE_DND_ENGINE_H

#include <stdint.h>
#include <stdbool.h>

#define FIXED_SHIFT 16
#define FIXED_ONE (1 << FIXED_SHIFT)
#define FLOAT_TO_FIXED(f) ((int32_t)((f) * FIXED_ONE))
#define FIXED_TO_FLOAT(x) (((float)(x)) / FIXED_ONE)
#define FIXED_MULT(a, b) (((int64_t)(a) * (b)) >> FIXED_SHIFT)

/* Room Measurements (Feet) */
#define ROOM_FOYER_WIDTH 800
#define ROOM_FOYER_HEIGHT 800
#define ROOM_PORCH_WIDTH 800
#define ROOM_PORCH_HEIGHT 200
#define ROOM_GARDEN_WIDTH 800
#define ROOM_GARDEN_HEIGHT 800
#define ROOM_TEMPLE_WIDTH 2000
#define ROOM_TEMPLE_HEIGHT 2000
#define SPATIAL_HASH_BUCKET_SIZE 40

typedef struct {
    int32_t x;
    int32_t y;
    int32_t z;
} Vector3Fixed;

typedef struct {
    int32_t x;
    int32_t y;
    int32_t angle;
    int32_t speed;
} CanineKinematics;

/* 3D Math Pipeline */
Vector3Fixed project_point_3d(Vector3Fixed point, int32_t focal_length, int32_t cx, int32_t cy);
Vector3Fixed rotate_y_3d(Vector3Fixed point, int32_t angle_degrees);

/* Audio DSP Pipeline */
float synthesize_sine_sample(float frequency, float sample_rate, uint32_t sample_index);
float synthesize_square_sample(float frequency, float sample_rate, uint32_t sample_index, int harmonics);

#endif /* BEAGLE_RIDE_DND_ENGINE_H */
