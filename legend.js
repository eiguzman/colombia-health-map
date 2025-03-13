export function createLegend(state) {
    const legendContainer = document.getElementById("legend");
    legendContainer.innerHTML = "";

    const legendWidth = Math.min(legendContainer.clientWidth, 400);
    const legendHeight = 20;
    const margin = { left: 10, right: 10 };

    const svg = d3.select("#legend")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "50")
        .attr("viewBox", `0 0 ${legendWidth + margin.left + margin.right} 50`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const selectedType = state.selectedDataType;
    const maxForType = state.globalMaxCases[selectedType] || 1;

    const legendScale = selectedType === "incident"
        ? d3.scaleLog()
            .domain([1, maxForType])
            .range([0, legendWidth])
        : d3.scaleLinear()
            .domain([0, maxForType])
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
        .attr("stop-color", d => state.mapChart.colorScale(d * maxForType));

    svg.append("rect")
        .attr("x", margin.left)
        .attr("y", 10)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
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
