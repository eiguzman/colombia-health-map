export function createNewLegend(state) {
    const legendContainer = document.getElementById("new-legend");
    legendContainer.innerHTML = "";

    const legendWidth = Math.min(legendContainer.clientWidth, 400);
    const legendHeight = 20;
    const margin = { left: 10, right: 10 };
    const svg = d3.select("#new-legend")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "50")
        .attr("viewBox", `0 0 ${legendWidth + margin.left + margin.right} 50`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    const selectedType = state.selectedSocialDataType;
    const maxForType = d3.max(state.data.features, d => d.properties[selectedType] || 0) || 1;
    const legendScale = d3.scaleLinear()
        .domain([0, maxForType])
        .range([0, legendWidth]);
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "new-legend-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");
    const interpolatorMap = {
        "illiterate": d3.interpolateGreys,
        "education": d3.interpolateBlues,
        "unemployed": d3.interpolateReds,
        "water": d3.interpolateGreens,
        "internet": d3.interpolatePurples
    };
    const colorInterpolator = interpolatorMap[selectedType];

    linearGradient.selectAll("stop")
        .data(d3.range(0, 1.01, 0.1))
        .enter().append("stop")
        .attr("offset", d => `${d * 100}%`)
        .attr("stop-color", d => colorInterpolator(d));
    svg.append("rect")
        .attr("x", margin.left)
        .attr("y", 10)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#new-legend-gradient)")
        .style("stroke", "white")
        .style("stroke-width", "1px");

    const axis = d3.axisBottom(legendScale)
        .ticks(5, d3.format(".0f"))
        .tickSize(5);

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${legendHeight + 10})`)
        .call(axis)
        .select(".domain")
        .remove();
    svg.selectAll("text").style("font-size", "14px");
}