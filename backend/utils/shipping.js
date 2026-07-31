const WAREHOUSE_LAT = 11.3802;
const WAREHOUSE_LON = 77.8944;

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Feeds PIN code to geocoding APIs to fetch latitude and longitude.
 * Tries Zippopotamus primary, and openstreetmap nominatim as fallback.
 */
async function getCoordinates(pincode) {
  const cleanPin = String(pincode).trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    throw new Error('Invalid PIN code format. Must be 6 digits.');
  }

  // 1. Try Zippopotamus API
  try {
    const response = await fetch(`http://api.zippopotam.us/IN/${cleanPin}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.places && data.places.length > 0) {
        const place = data.places[0];
        const lat = parseFloat(place.latitude);
        const lon = parseFloat(place.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          return { lat, lon, source: 'zippopotamus' };
        }
      }
    }
  } catch (err) {
    console.error('Zippopotamus lookup failed, trying fallback:', err.message);
  }

  // 2. Try Nominatim (OSM) as fallback
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${cleanPin}&country=India&format=json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Whiskwear-ECommerce/1.0 (contact@whiskwear.com)'
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          return { lat, lon, source: 'nominatim' };
        }
      }
    }
  } catch (err) {
    console.error('Nominatim lookup failed:', err.message);
  }

  throw new Error('Coordinates not found for pincode');
}

/**
 * Calculates delivery charge based on pincode.
 */
async function calculateShipping(pincode) {
  try {
    const coords = await getCoordinates(pincode);
    const distance = calculateDistance(WAREHOUSE_LAT, WAREHOUSE_LON, coords.lat, coords.lon);

    let charge = 80; // Default fallback fee inside calculation if distance tiers don't match
    if (distance <= 25) {
      charge = 30;
    } else if (distance <= 150) {
      charge = 50;
    } else if (distance <= 500) {
      charge = 90;
    } else if (distance <= 1000) {
      charge = 120;
    } else {
      charge = 150;
    }

    return {
      success: true,
      pincode,
      distance: Math.round(distance * 100) / 100, // round to 2 decimal places
      shipping_charge: charge,
      isFallback: false
    };
  } catch (err) {
    console.warn(`Could not calculate shipping dynamically for PIN ${pincode}: ${err.message}. Using fallback fee.`);
    return {
      success: true,
      pincode,
      distance: null,
      shipping_charge: 80, // Flat rate fallback
      isFallback: true
    };
  }
}

module.exports = {
  calculateDistance,
  getCoordinates,
  calculateShipping
};
