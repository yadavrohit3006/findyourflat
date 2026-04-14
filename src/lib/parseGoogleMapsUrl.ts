export interface ParsedCoords {
  lat: number;
  lng: number;
}

/**
 * Extracts latitude and longitude from a Google Maps URL.
 *
 * Handles these formats:
 * 1. https://maps.google.com/?q=28.4595,77.0266
 * 2. https://www.google.com/maps/@28.4595,77.0266,15z
 * 3. https://www.google.com/maps/place/Name/@28.4595,77.0266,15z
 * 4. https://www.google.com/maps/place/...!3d28.4595!4d77.0266
 * 5. https://maps.google.com/?ll=28.4595,77.0266
 *
 * Returns null if no coordinates can be extracted.
 */
export function parseGoogleMapsUrl(input: string): ParsedCoords | null {
  if (!input || typeof input !== 'string') return null;

  const url = input.trim();

  // Must at least look like a Google Maps URL
  if (!url.includes('google.com/maps') && !url.includes('maps.google.com') && !url.includes('goo.gl/maps')) {
    return null;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  // Format 1: ?q=LAT,LNG  (numeric coordinates only)
  const qParam = parsedUrl.searchParams.get('q');
  if (qParam) {
    const match = qParam.match(/^(-?\d{1,2}\.?\d*),\s*(-?\d{1,3}\.?\d*)$/);
    if (match) {
      const result = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      if (isValidCoords(result)) return result;
    }
  }

  // Format 5: ?ll=LAT,LNG
  const llParam = parsedUrl.searchParams.get('ll');
  if (llParam) {
    const match = llParam.match(/^(-?\d{1,2}\.?\d*),\s*(-?\d{1,3}\.?\d*)$/);
    if (match) {
      const result = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      if (isValidCoords(result)) return result;
    }
  }

  // Format 2 & 3: /@LAT,LNG,ZOOMz in the path
  const atMatch = url.match(/@(-?\d{1,2}\.?\d+),(-?\d{1,3}\.?\d+),\d+\.?\d*z/);
  if (atMatch) {
    const result = { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    if (isValidCoords(result)) return result;
  }

  // Format 4: !3dLAT!4dLNG in embed/share URLs
  const dMatch = url.match(/!3d(-?\d{1,2}\.?\d+)!4d(-?\d{1,3}\.?\d+)/);
  if (dMatch) {
    const result = { lat: parseFloat(dMatch[1]), lng: parseFloat(dMatch[2]) };
    if (isValidCoords(result)) return result;
  }

  return null;
}

function isValidCoords({ lat, lng }: ParsedCoords): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
