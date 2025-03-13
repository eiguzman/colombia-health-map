export function showTooltip(event, d, year) {
    const tooltip = d3.select("#tooltip");

    const incidentRate = d.properties[`incident_${year}`] || 1;
    const temperature = d.properties[`temp_${year}`] || 0;
    const precipitation = d.properties[`prec_${year}`] || 0;

    tooltip
        .style("opacity", 1)
        .html(`
            <strong>${d.properties.name}</strong><br>
            <hr />
            <strong>Year:</strong> <code>${year}</code><br>
            <strong>Incidence Rate:</strong> <code>${incidentRate.toFixed(2)}</code><br>
            <strong>Temperature:</strong> <code>${temperature.toFixed(2)}°C</code><br>
            <strong>Precipitation:</strong> <code>${precipitation.toFixed(2)}mm</code>
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
