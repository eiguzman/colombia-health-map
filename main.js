import { drawMap } from "./map.js";

async function loadData() {
    try {
        const [geoData, csvData] = await Promise.all([
            d3.json("data/geo.geojson"),
            d3.csv("data/meta.csv")
        ]);

        // Convert CSV to a dictionary for fast lookup
        const csvMap = {};
        csvData.forEach(row => {
            csvMap[row.id] = row;
        });

        // Merge CSV data into GeoJSON features
        geoData.features.forEach(feature => {
            const featureId = feature.properties.id;
            if (csvMap[featureId]) {
                feature.properties = { ...feature.properties, ...csvMap[featureId] };

                // Ensure area is present and not zero to avoid division errors
                const area = parseFloat(feature.properties.area) || 1;
                const pop2019 = parseFloat(feature.properties.pop2019) || 0;

                feature.properties.density = pop2019 / area;
            }
        });

        return geoData;

    } catch (error) {
        console.error("Error loading data:", error);
        return null;
    }
}

async function initApp() {
    const data = await loadData();
    if (data) {
        drawMap("#map", data);
    }
}

initApp();
