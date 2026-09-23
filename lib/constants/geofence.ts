// lib/constants/geofence.ts
//
// Authoritative backend & shared geofence configuration for OASYS hostel.
// Provides campus coordinates, allowed attendance radius, and Haversine distance computation.

export interface GeofenceConfig {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maxAccuracyMeters: number;
}

export function getHostelGeofence(): GeofenceConfig {
  const latitude = Number(process.env.HOSTEL_LATITUDE);
  const longitude = Number(process.env.HOSTEL_LONGITUDE);
  const radiusMeters = Number(process.env.HOSTEL_RADIUS_METERS);
  const maxAccuracyMeters = Number(process.env.HOSTEL_MAX_ACCURACY_METERS) || 200;

  return {
    latitude: isNaN(latitude) ? 0 : latitude,
    longitude: isNaN(longitude) ? 0 : longitude,
    radiusMeters: isNaN(radiusMeters) ? 0 : radiusMeters,
    maxAccuracyMeters,
  };
}

export const HOSTEL_GEOFENCE = {
  get latitude(): number {
    return getHostelGeofence().latitude;
  },
  get longitude(): number {
    return getHostelGeofence().longitude;
  },
  get radiusMeters(): number {
    return getHostelGeofence().radiusMeters;
  },
  get maxAccuracyMeters(): number {
    return getHostelGeofence().maxAccuracyMeters;
  },
};

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

