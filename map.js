export function initMap(containerID) {
    return d3.select("#map")
        .attr("width", "100%")
        .attr("height", "100vh")
        .attr("viewBox", "0 0 800 600")
        .attr("preserveAspectRatio", "xMidYMid meet");
}

export function drawMap(svg, data) {
    // Define projection
    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection);

    // Fit projection to data
    projection.fitSize([800, 600], data);

    // Compute new bounding box
    const [[minX, minY], [maxX, maxY]] = path.bounds(data);
    const width = maxX - minX, height = maxY - minY;

    // Update viewBox dynamically
    svg.attr("viewBox", `${minX} ${minY} ${width} ${height}`);

    // Draw the map
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "steelblue")
        .attr("stroke", "white")
        .attr("stroke-width", "0.1");
}