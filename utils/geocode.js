const axios = require("axios");

async function geocodeLocation(locationString) {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
            q: locationString,
            format: "json",
            limit: 1
        },
        headers: {
            "User-Agent": "WonderVisit-App"
        }
    });
    if (response.data.length === 0) {
        throw new Error("Location not found for: " + locationString);
    }
    const { lat, lon } = response.data[0];
    return { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] };
}

module.exports = geocodeLocation;