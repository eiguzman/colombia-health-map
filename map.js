import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";
import { createLegend } from "./legend.js";

export function createMap(state) {
    const mapObj = {
        width: 800,
        height: 600,
        svg: null,
        path: null,
        projection: null,
        colorScale: null,
        paths: null,
    };

    function init() {
        const [[x0, y0], [x1, y1]] = d3.geoBounds(state.data);
        mapObj.height = mapObj.width * ((y1 - y0) / (x1 - x0));
        mapObj.svg = d3.select("#map")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${mapObj.width} ${mapObj.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        const g = mapObj.svg.append("g");

        mapObj.projection = d3.geoMercator()
            .fitExtent([[10, 10], [mapObj.width - 10, mapObj.height - 10]], state.data);
        mapObj.path = d3.geoPath().projection(mapObj.projection);
        mapObj.paths = g.selectAll("path")
            .data(state.data.features)
            .join("path")
            .attr("class", "map-path")
            .attr("d", mapObj.path)
            .style("cursor", "pointer")
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("stroke-width", 1);

                showTooltip(event, d, state.year);
            })
            .on("mousemove", (event) => moveTooltip(event))
            .on("mouseout", function () {
                d3.select(this)
                    .attr("stroke", null);

                hideTooltip();
            });

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [mapObj.width, mapObj.height]])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        mapObj.svg.call(zoom);
        state.mapChart = mapObj;

        update(state);
        createLegend(state);
    }

    function update(state) {
        const selectedType = state.selectedDataType;
        const interpolatorMap = {
            "incident": d3.interpolateGreens,
            "temp": d3.interpolateReds,
            "prec": d3.interpolateBlues
        };
        const colorInterpolator = interpolatorMap[selectedType];
        const maxForType = state.globalMaxCases[selectedType];
        const scaleMin = selectedType === "incident" ? 1 : 0;
        const scaleMax = selectedType === "incident" ? Math.log1p(maxForType) : maxForType;

        state.mapChart.colorScale = d3.scaleSequential(colorInterpolator)
            .domain([scaleMin, scaleMax]);

        if (selectedType === "incident") {
            state.mapChart.colorScale.interpolator(d => (
                d3.interpolateGreens(
                    (Math.log1p(d) - Math.log1p(1)) /
                    (Math.log1p(maxForType) -
                        Math.log1p(1))
                )
            ));
        }

        state.mapChart.svg.selectAll("path")
            .transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .attr("fill", d => {
                const value = d.properties[`${selectedType}_${state.year}`] || 0;
                return state.mapChart.colorScale(value);
            });

        createLegend(state);
    }

    init();
    return update;
}

export function zoomToRegion(regionName, state) {
    const mapObj = state.mapChart;
    const selectedType = state.selectedDataType;
    const year = state.year;
    const matchingLocations = state.data.features.filter(d => d.properties.name === regionName);
    const bestLocation = matchingLocations.reduce((max, loc) => {
        const value = loc.properties[`${selectedType}_${year}`] || 0;
        return value > (max?.properties[`${selectedType}_${year}`] || 0) ? loc : max;
    }, null);
    const [[x0, y0], [x1, y1]] = d3.geoBounds(bestLocation);
    const centroid = d3.geoCentroid(bestLocation);
    const projection = mapObj.projection;
    const [centerX, centerY] = projection(centroid);
    const [[minX, minY], [maxX, maxY]] = d3.geoBounds(state.data);
    const scaleFactor = Math.min(
        (maxX - minX) / (x1 - x0),
        (maxY - minY) / (y1 - y0)
    );
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
            mapObj.svg.select("g").attr("transform", event.transform);
        });

    mapObj.svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity
            .translate(mapObj.width / 2, mapObj.height / 2)
            .scale(scaleFactor * 0.5)
            .translate(-centerX, -centerY));
}
