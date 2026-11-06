/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Beagle Ride DND - Fixed-Point 3D Mathematics Implementation in ISO C99
 */

#include "engine.h"
#include <math.h>

Vector3Fixed project_point_3d(Vector3Fixed point, int32_t focal_length, int32_t cx, int32_t cy) {
    Vector3Fixed result;
    int32_t depth = point.z + FLOAT_TO_FIXED(500.0f);
    
    if (depth <= FLOAT_TO_FIXED(0.1f)) {
        result.x = 0;
        result.y = 0;
        result.z = 0;
        return result;
    }

    int32_t scale = ((int64_t)focal_length << FIXED_SHIFT) / depth;
    result.x = cx + FIXED_MULT(point.x, scale);
    result.y = cy + FIXED_MULT(point.y, scale);
    result.z = depth;
    return result;
}

Vector3Fixed rotate_y_3d(Vector3Fixed point, int32_t angle_degrees) {
    Vector3Fixed result;
    float rad = (float)angle_degrees * 3.14159265358979323846f / 180.0f;
    int32_t cos_val = FLOAT_TO_FIXED(cosf(rad));
    int32_t sin_val = FLOAT_TO_FIXED(sinf(rad));

    result.x = FIXED_MULT(point.x, cos_val) + FIXED_MULT(point.z, sin_val);
    result.y = point.y;
    result.z = -FIXED_MULT(point.x, sin_val) + FIXED_MULT(point.z, cos_val);
    return result;
}
