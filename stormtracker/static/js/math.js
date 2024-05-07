export const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

export const toDegrees = (radians) => {
  return (radians * 180) / Math.PI;
};

export const fromMapboxPoint = (point) => {
  return {
    lat: point.lat,
    lon: point.lng,
  };
};

export const toMapboxPoint = (point) => {
  return {
    lat: point.lat,
    lng: point.lon,
  };
};

export const getBearing = (srcPoint, dstPoint) => {
  const startLat = toRadians(srcPoint.lat);
  const startLon = toRadians(srcPoint.lon);
  const destLat = toRadians(dstPoint.lat);
  const destLon = toRadians(dstPoint.lon);
  const dLon = destLon - startLon;

  const y = Math.sin(dLon) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(dLon);
  const brng = Math.atan2(y, x);
  return (toDegrees(brng) + 360) % 360;
};

export const getDistance = (srcPoint, dstPoint) => {
  const R = 6371;
  const dLat = toRadians(dstPoint.lat - srcPoint.lat);
  const dLon = toRadians(dstPoint.lon - srcPoint.lon);
  const lat1 = toRadians(srcPoint.lat);
  const lat2 = toRadians(dstPoint.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c * 1000;
  return d;
};

export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters % 50)} m`;
  } else {
    return `${Math.round(meters / 1000)} km`;
  }
};
