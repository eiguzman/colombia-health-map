export function drawMap(containerId, state) {
    const svg = d3.select(containerId)
        .attr("width", "100%")
        .attr("height", "100vh")
        .attr("viewBox", "0 0 800 600")
        .attr("preserveAspectRatio", "xMidYMid meet");

    state.projection = d3.geoMercator().fitSize([800, 600], state.data);
    state.path = d3.geoPath().projection(state.projection);
    state.svg = svg;

    state.paths = svg.selectAll("path")
        .data(state.data.features)
        .join("path")
        .attr("d", state.path)
        .on("mouseover", (event, d) => {
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`
                    Name: ${d.properties.name}<br>
                    Incidence Rate: ${(d.properties[`incident_${state.year}`] || 0).toFixed(2)} per 100k<br>
                    Year: ${state.year}
                `);
        })
        .on("mousemove", (event) => {
            d3.select("#tooltip")
                .style("left", event.clientX + "px")
                .style("top", event.clientY + "px");
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("opacity", 0);
        });

    updateMap(state);
}

export function updateMap(state) {
    const year = state.year;

    const caseCounts = state.data.features.map(d => d.properties[`incident_${year}`] || 0);
    const maxCases = Math.max(...caseCounts) || 1;

    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, maxCases]);

    state.svg.selectAll("path")
        .transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("fill", d => colorScale(d.properties[`incident_${year}`] || 0));

    drawLegend(state);
}

export function drawLegend(state) {
    const legendWidth = 300;
    const legendHeight = 20;
    const margin = { left: 20, right: 20 };

    d3.select("#legend").select("svg").remove();

    const svg = d3.select("#legend")
        .append("svg")
        .attr("width", legendWidth + margin.left + margin.right)
        .attr("height", 50);

    const caseCounts = state.data.features.map(d => d.properties[`incident_${state.year}`] || 0);
    const maxCases = Math.max(...caseCounts) || 1;

    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, maxCases]);

    const legendScale = d3.scaleLinear()
        .domain([0, maxCases])
        .range([0, legendWidth]);

    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");

    linearGradient.selectAll("stop")
        .data(d3.range(0, 1.01, 0.1))
        .enter().append("stop")
        .attr("offset", d => `${d * 100}%`)
        .attr("stop-color", d => colorScale(d * maxCases));

    svg.append("rect")
        .attr("x", margin.left)
        .attr("y", 10)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    const axis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickSize(5)
        .tickFormat(d3.format(".0f"));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${legendHeight + 10})`)
        .call(axis)
        .select(".domain")
        .remove();
}
