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
        state.mapChart.colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain([Math.log1p(1), Math.log1p(state.globalMaxCases)])
            .interpolator(d => (
                d3.interpolateReds(
                    (Math.log1p(d) - Math.log1p(1)) /
                    (Math.log1p(state.globalMaxCases) - Math.log1p(1))
                )
            ));

        state.mapChart.svg.selectAll("path")
            .transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .attr("fill", d => (
                state
                    .mapChart
                    .colorScale(d.properties[`incident_${state.year}`] || 1)
            ));
    }

    init();
    return update;
}
