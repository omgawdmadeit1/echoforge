import type { Echo, GeoPoint } from "./types";

const EARTH_RADIUS_M = 6371000;

export function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function distanceMeters(a: GeoPoint, b: GeoPoint) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(meters: number) {
  if (meters < 20) return "here";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

/** Simple equirectangular projection relative to a center point for map rendering */
export function projectToMap(
  point: GeoPoint,
  center: GeoPoint,
  width: number,
  height: number,
  scale = 42000,
) {
  const x = (point.lng - center.lng) * scale * Math.cos(toRad(center.lat)) + width / 2;
  const y = (center.lat - point.lat) * scale + height / 2;
  return { x, y };
}

export function sortByDistance(echoes: Echo[], origin: GeoPoint) {
  return [...echoes].sort(
    (a, b) =>
      distanceMeters(origin, { lat: a.lat, lng: a.lng }) -
      distanceMeters(origin, { lat: b.lat, lng: b.lng }),
  );
}

export function nearbyEchoes(echoes: Echo[], origin: GeoPoint, radiusM = 2500) {
  return echoes.filter(
    (e) => distanceMeters(origin, { lat: e.lat, lng: e.lng }) <= radiusM,
  );
}

export function bearingDegrees(from: GeoPoint, to: GeoPoint) {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Offset a point by meters north / east for demo walking */
export function offsetPoint(origin: GeoPoint, northM: number, eastM: number): GeoPoint {
  const dLat = northM / 111320;
  const dLng = eastM / (111320 * Math.cos(toRad(origin.lat)));
  return { lat: origin.lat + dLat, lng: origin.lng + dLng };
}
