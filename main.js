import { initMap, drawMap } from "./map.js";

const svgMap = initMap("#map");

d3.json("data/geo.geojson").then(function (data) {
    drawMap(svgMap, data);
});