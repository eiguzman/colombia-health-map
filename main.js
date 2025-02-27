import { drawMap } from "./map.js";

const state = {
    data: null
};

async function loadData() {
    state.data = await d3.json("data/master.geojson");

    // Temp location for density
    state.data.features.forEach(feature => {
        const area = parseFloat(feature.properties.area) || 1;
        const pop2019 = parseFloat(feature.properties.pop2019) || 0;
        feature.properties.density = pop2019 / area;
    });
}

async function initApp() {
    await loadData();
    if (state.data) {
        drawMap("#map", state);
    }
}

initApp();
