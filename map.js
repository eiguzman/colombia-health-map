export function drawMap(containerId, state) {
    const svg = d3.select(containerId)
        .attr("width", "100%")
        .attr("height", "100vh")
        .attr("viewBox", "0 0 800 600")
        .attr("preserveAspectRatio", "xMidYMid meet");

    state.projection = d3.geoMercator().fitSize([800, 600], state.data);
    state.path = d3.geoPath().projection(state.projection);
    state.svg = svg;

    // 🔹 Draw the map once, keeping references for future updates
    state.paths = svg.selectAll("path")
        .data(state.data.features)
        .join("path")
        .attr("d", state.path)
        .attr("stroke", "white")
        .attr("stroke-width", "0.1")
        .on("mouseover", (event, d) => {
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`
                    Name: ${d.properties.name}<br>
                    Cases: ${d.properties[`cases${state.year}`] || 0}<br>
                    Year: ${state.year}
                `);
        })
        .on("mousemove", (event) => {
            d3.select("#tooltip")
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px");
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("opacity", 0);
        });

    updateMap(state);  // 🔹 Initial color update based on cases
}

export function updateMap(state) {
    const year = state.year;

    state.data.features.forEach(feature => {
        const area = parseFloat(feature.properties.area) || 1;  // Avoid division by zero
        const cases = parseFloat(feature.properties[`cases${year}`]) || 0;
        feature.properties.caseDensity = cases / area;
    });

    const caseDensities = state.data.features.map(d => d.properties.caseDensity).filter(d => d > 0);
    const maxDensity = Math.max(...caseDensities) || 1;  // Ensure valid max

    const colorScale = d3.scaleLinear()
        .domain([0, maxDensity])  // 🔹 Linear scale instead of log
        .range(["#f7fbff", "#de2d26"]);  // 🔹 Light blue → Red for hotspots

    state.paths.transition()
        .duration(300)
        .attr("fill", d => colorScale(d.properties.caseDensity || 0));
}
