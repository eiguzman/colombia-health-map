import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";
import { createNewLegend } from "./newLegend.js";

export function createNewMap(state) {
    // Initial map vars
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
        // Generate map dimensions
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
        newMapObj.zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [newMapObj.width, newMapObj.height]])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
        
        newMapObj.svg.call(newMapObj.zoom);
        state.newnewM = newMapObj;

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
                    .attr("transform", `translate(${x}, ${y})`)
                    // Add click event to zoom into the star
                    .on("click", () => {
                        // Call zoomToStar with the centroid
                        zoomToStar(d.centroid, state);
                    });
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

    function zoomToStar(centroid, state) {
        const newMapObj = state.newnewM;
        const projection = newMapObj.projection;
        const svg = newMapObj.svg;
        const zoom = newMapObj.zoom; // access the zoom behavior

        // Convert centroid to pixel coordinates
        const [x, y] = projection(centroid);

        // Determine scale for zooming in
        const zoomScale = 4; // Adjust as needed for zoom level
        const translateX = newMapObj.width / 2 - x * zoomScale;
        const translateY = newMapObj.height / 2 - y * zoomScale;

        // Create the transform
        const transform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(zoomScale);

        // Transition to zoom into the star
        svg.transition()
            .duration(750)
            .call(zoom.transform, transform);
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

        state.newnewM.colorScale = d3.scaleSequential(colorInterpolator)
            .domain([0, maxForType]);
        newMapObj.paths.transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .attr("fill", d => {
                const value = d.properties[selectedType] || 0;
                return state.newnewM.colorScale(value);
            });
        createNewLegend(state);
    }

    init();
    return update;
}

export function zoomToRegion(regionName, state) {
    const newMapObj = state.newMapChart;
    const selectedType = state.selectedDataType;
    const year = state.year;
    const matchingLocations = state.data.features.filter(d => d.properties.name === regionName);
    const bestLocation = matchingLocations.reduce((max, loc) => {
        const value = loc.properties[`${selectedType}_${year}`] || 0;
        return value > (max?.properties[`${selectedType}_${year}`] || 0) ? loc : max;
    }, null);
    const [[x0, y0], [x1, y1]] = d3.geoBounds(bestLocation);
    const centroid = d3.geoCentroid(bestLocation);
    const projection = newMapObj.projection;
    const [centerX, centerY] = projection(centroid);
    const [[minX, minY], [maxX, maxY]] = d3.geoBounds(state.data);
    const scaleFactor = Math.min(
        (maxX - minX) / (x1 - x0),
        (maxY - minY) / (y1 - y0)
    );
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
            newMapObj.svg.select("g").attr("transform", event.transform);
        });

    newMapObj.svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity
            .translate(newMapObj.width / 2, newMapObj.height / 2)
            .scale(scaleFactor * 0.5)
            .translate(-centerX, -centerY));
}
