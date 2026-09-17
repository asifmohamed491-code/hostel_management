// lib/constants/geofence.ts
//
// Authoritative backend & shared geofence configuration for OASYS hostel.
// Provides campus coordinates, allowed attendance radius, and Haversine distance computation.

export const HOSTEL_GEOFENCE = {
  latitude: Number(process.env.HOSTEL_LATITUDE) || 11.027882,
  longitude: Number(process.env.HOSTEL_LONGITUDE) || 78.627426,
  radiusMeters: Number(process.env.HOSTEL_RADIUS_METERS) || 320,
  // Maximum acceptable GPS accuracy in meters.
  // A reading with accuracy > this value is considered too unreliable to trust for geofence.
  // 200m allows typical mobile GPS that reports 80–180m accuracy on indoor/urban signals.
  // The backend rejects any reading less accurate than this threshold.
  maxAccuracyMeters: 200,
} as const;

/**
 * Calculates great-circle distance between two geographic coordinates in meters
 * using the Haversine formula.
 *
 * @param lat1 Latitude of point 1 (in degrees)
 * @param lon1 Longitude of point 1 (in degrees)
 * @param lat2 Latitude of point 2 (in degrees)
 * @param lon2 Longitude of point 2 (in degrees)
 * @returns Distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_METERS = 6371000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

