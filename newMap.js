import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";
import { createNewLegend } from "./newLegend.js";

export function createNewMap(state) {
    const newMapObj = {
        width: 800,
        height: 600,
        svg: null,
        path: null,
        projection: null,
        colorScale: null,
        paths: null,
    };

    function init() {
        newMapObj.svg = d3.select("#new-map")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${newMapObj.width} ${newMapObj.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        const g = newMapObj.svg.append("g");

        newMapObj.projection = d3.geoMercator()
            .fitExtent([[10, 10], [newMapObj.width - 10, newMapObj.height - 10]], state.data);
        newMapObj.path = d3.geoPath().projection(newMapObj.projection);
        newMapObj.paths = g.selectAll("path")
            .data(state.data.features)
            .join("path")
            .attr("class", "map-path")
            .attr("d", newMapObj.path)
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
            .translateExtent([[0, 0], [newMapObj.width, newMapObj.height]])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
        
        newMapObj.svg.call(zoom);
        state.newMapChart = newMapObj;

        update(state);
        createNewLegend(state);
    }

    function update(state) {
        const selectedType = state.selectedSocialDataType;
        const interpolatorMap = {
            "illiterate": d3.interpolateGreys,
            "education": d3.interpolateBlues,
            "unemployed": d3.interpolateReds,
            "water": d3.interpolateGreens,
            "internet": d3.interpolatePurples
        };
        const colorInterpolator = interpolatorMap[selectedType];
        const maxForType = d3.max(state.data.features, d => d.properties[selectedType] || 0);

        state.newMapChart.colorScale = d3.scaleSequential(colorInterpolator)
            .domain([0, maxForType]);
        newMapObj.paths.transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .attr("fill", d => {
                const value = d.properties[selectedType] || 0;
                return state.newMapChart.colorScale(value);
            });
            
        createNewLegend(state);
    }

    init();
    return update;
}
