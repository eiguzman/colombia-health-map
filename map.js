export function drawMap(containerId, state) {

    const svg = d3.select(containerId)
        .attr("width", "100%")
        .attr("height", "100vh")
        .attr("viewBox", "0 0 800 600")
        .attr("preserveAspectRatio", "xMidYMid meet");

    const data = state.data;

    const projection = d3
        .geoMercator()
        .fitSize([800, 600], state.data);

    const path = d3
        .geoPath()
        .projection(projection);

    // Compute and update bounding box
    const [[minX, minY], [maxX, maxY]] = path.bounds(state.data);
    const width = maxX - minX;
    const height = maxY - minY;
    svg.attr("viewBox", `${minX} ${minY} ${width} ${height}`);

    // Filter out zeroes
    const densities = state.data.features
        .map(d => +d.properties.density || 1)
        .filter(d => d > 0);

    const colorScale = d3
        .scaleLog()
        .domain([Math.min(...densities), Math.max(...densities)])
        .range(["#deebf7", "#08306b"]);

    // Draw map
    svg.selectAll("path")
        .data(state.data.features)
        .join("path")
        .attr("d", path)
        .attr("fill", d => colorScale(Math.max(1, +d.properties.density || 1)))
        .attr("stroke", "white")
        .attr("stroke-width", "0.1")
        .on("mouseover", (_, d) => {
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`
                    Name: ${d.properties.name}<br>
                    Population: ${d.properties.pop2019}<br>
                    Area: ${Math.round(d.properties.area)} km2`
                );
        })
        .on("mousemove", (event) => {
            d3.select("#tooltip")
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px");
        })
        .on("mouseout", () => {
            d3.select("#tooltip")
                .style("opacity", 0);
        });
}
