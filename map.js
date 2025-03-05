export function drawMap(containerId, state) {
    const bounds = d3.geoBounds(state.data);
    const [[x0, y0], [x1, y1]] = bounds;

    const width = 800;
    const aspectRatio = (y1 - y0) / (x1 - x0);
    const height = width * aspectRatio;

    const svg = d3.select(containerId)
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    state.projection = d3.geoMercator()
        .fitExtent([[10, 10], [width - 10, height - 10]], state.data);

    state.path = d3.geoPath().projection(state.projection);
    state.svg = svg;

    state.paths = svg.selectAll("path")
        .data(state.data.features)
        .join("path")
        .attr("class", "map-path")
        .attr("d", state.path)
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`
                    Name: ${d.properties.name}<br>
                    Incidence Rate: ${(d.properties[`incident_${state.year}`] || 0).toFixed(2)}<br>
                    Year: ${state.year}
                `);
        })
        .on("mousemove", (event) => {
            d3.select("#tooltip")
                .style("left", (event.pageX + 16) + "px")
                .style("top", (event.pageY + 16) + "px");
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("opacity", 0);
        });

    updateMap(state);
}

export function updateMap(state) {
    const year = state.year;
    const maxCases = state.globalMaxCases || 1;

    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([Math.log1p(1), Math.log1p(maxCases)])
        .interpolator(d => d3.interpolateReds((Math.log1p(d) - Math.log1p(1)) / (Math.log1p(maxCases) - Math.log1p(1))));

    state.colorScale = colorScale;

    state.svg.selectAll("path")
        .transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("fill", d => colorScale(d.properties[`incident_${year}`] || 1));

    drawLegend(state);
}

export function drawLegend(state) {
    const legendContainer = document.getElementById("legend");
    const legendWidth = Math.min(legendContainer.clientWidth, 400);
    const legendHeight = 20;
    const margin = { left: 10, right: 10 };

    d3.select("#legend").select("svg").remove();

    const svg = d3.select("#legend")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "50")
        .attr("viewBox", `0 0 ${legendWidth + margin.left + margin.right} 50`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const maxCases = state.globalMaxCases || 1;

    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, maxCases]);

    const legendScale = d3.scaleLog()
        .domain([1, maxCases])
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
        .ticks(5, d3.format(".0f"))
        .tickSize(5);

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${legendHeight + 10})`)
        .call(axis)
        .select(".domain")
        .remove();
}
