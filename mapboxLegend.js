export function mapboxLegend() {
    const legendContainer = document.getElementById("mapbox-legend");
    legendContainer.innerHTML = "";

    const legendWidth = Math.min(legendContainer.clientWidth, 400);
    const legendHeight = 50; // Increased height for clarity
    const margin = { left: 10, right: 10 };

    const svg = d3.select("#mapbox-legend")
        .append("svg")
        .attr("width", "100%")
        .attr("height", legendHeight)
        .attr("viewBox", `0 0 ${legendWidth + margin.left + margin.right} ${legendHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "mapbox-gradient");

    const colorScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, 1]);

    const turboColors = d3.range(.1, 1.01, 0.01).map(d3.interpolateTurbo);

    turboColors.forEach((color, i) => {
        gradient.append("stop")
            .attr("offset", `${(i / (turboColors.length -1)) * 100}%`)
            .attr("stop-color", color);
    });

    svg.append("rect")
        .attr("x", margin.left)
        .attr("y", 10)
        .attr("width", legendWidth)
        .attr("height", 20)
        .style("fill", "url(#mapbox-gradient)");

    const scale = d3.scaleLinear()
        .domain([0, 6000])
        .range([margin.left, margin.left + legendWidth]);

    const axis = d3.axisBottom(scale)
        .ticks(6)
        .tickFormat(d => d);

    svg.append("g")
        .attr("transform", `translate(0, ${30})`)
        .call(axis);
}
