export function showTooltip(event, d, year) {
    const tooltip = d3.select("#tooltip");

    tooltip
        .style("opacity", 1)
        .html(`
            Name: ${d.properties.name}<br>
            Incidence Rate: ${(d.properties[`incident_${year}`] || 0).toFixed(2)}<br>
            Year: ${year}
        `);

    moveTooltip(event);
}

export function moveTooltip(event) {
    d3.select("#tooltip")
        .style("left", (event.pageX + 16) + "px")
        .style("top", (event.pageY + 16) + "px");
}

export function hideTooltip() {
    d3.select("#tooltip").style("opacity", 0);
}
