import { mapboxLegend } from "./mapboxLegend.js";

mapboxgl.accessToken = 'pk.eyJ1IjoiZWlndXptYW4iLCJhIjoiY203OGFhbXVoMHN4ajJrb3Z2ZWUxOW01cyJ9.zc52D1EcGb00gJFeUk6SNg';

mapboxLegend();

const svg = d3.select('#mapbox').select('svg');
const map = new mapboxgl.Map({
    container: 'mapbox',
    style: "mapbox://styles/eiguzman/cmc1cdyej009d01soam0y4n8d",
    center: [-74.083618, 4.653433],
    zoom: 11,
    minZoom: 5,
    maxZoom: 11
});

map.on('load', () => {
    map.resize();
});