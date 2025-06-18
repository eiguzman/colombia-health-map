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
            .attr("class", "new-map-path")
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
        createPOI(state);
    }

    function createPOI(state) {
        // Select Points of Interest
        const targetMunicipalities = ["Medellín", "Bogotá, D.C.", "Cali", "Barranquilla"];
        const featuresCopy = structuredClone(state.data.features);
        const filteredFeatures = featuresCopy.filter(feature => 
            targetMunicipalities.includes(feature.properties.name)
        );
        // generate centroids for selected municipalities
        const centroids = filteredFeatures.map(feature => {
            const centroid = d3.geoCentroid(feature);
            return {
                name: feature.properties.name,
                centroid: centroid
            };
        });
        const svgGroup = d3.select("#new-map").select("g");
        const pois = svgGroup.selectAll("polygon.poi")
            .data(centroids, d => d.name);
        // Remove existing POI
        pois.exit().remove();
        // Generate POI
        pois.enter()
            .append("polygon")
            .attr("class", "poi")
            .attr("fill", "orange")
            .attr("stroke", "black")
            .attr("stroke-width", .5)
            .each(function(d) {
                const [x, y] = newMapObj.projection(d.centroid);
                const starSize = 4;
                const starPoints = generateStarPoints(0, 0, starSize, 5);
                d3.select(this)
                    .attr("points", starPoints)
                    .attr("transform", `translate(${x}, ${y})`);
            });
    }

    // Helper function to generate star points
    function generateStarPoints(cx, cy, r, numPoints) {
        const points = [];
        const angle = Math.PI / numPoints;
        for (let i = 0; i < 2 * numPoints; i++) {
            const r_i = (i % 2 === 0) ? r : r / 2;
            const theta = i * angle;
            const x = cx + r_i * Math.sin(theta);
            const y = cy - r_i * Math.cos(theta);
            points.push(`${x},${y}`);
        }
        return points.join(" ");
    }

    function update(state) {
        const selectedType = state.selectedSocialDataType;
        const interpolatorMap = {
            "illiterate": d3.interpolateGreys,
            "education": d3.interpolate('#ffffff', '#A8964D'),
            "unemployed": d3.interpolateReds,
            "water": d3.interpolateBlues,
            "internet": d3.interpolate('#ffffff', '#437078')
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
