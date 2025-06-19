export function showTooltip(event, d, year) {
    if (event.srcElement.className.baseVal == "map-path") {
        const tooltip = d3.select("#tooltip");
        const incidentRate = d.properties[`incident_${year}`] || 1;
        const temperature = d.properties[`temp_${year}`] || 0;
        const precipitation = d.properties[`prec_${year}`] || 0;

        tooltip
            .style("opacity", .8
            )
            .html(`
                <strong>${d.properties.name}</strong><br>
                <hr />
                <strong>Year:</strong> <code>${year}</code><br>
                <strong>Incidence Rate:</strong> <code>${incidentRate.toFixed(2)}</code><br>
                <strong>Temperature:</strong> <code>${temperature.toFixed(2)}°C</code><br>
                <strong>Precipitation:</strong> <code>${precipitation.toFixed(2)}mm</code>
            `);

        moveTooltip(event); 
    } else {
        const tooltip = d3.select("#tooltip");
        const incidentRate = d.properties[`incident_${year}`] || 1;
        const temperature = d.properties[`temp_${year}`] || 0;
        const precipitation = d.properties[`prec_${year}`] || 0;
        const illiterate = d.properties["illiterate"] || 0;
        const education = d.properties["education"] || 0;
        const unemployed = d.properties["unemployed"] || 0;
        const water = d.properties["water"] || 0;
        const internet = d.properties["internet"] || 0;
        

        tooltip
            .style("opacity", .8
            )
            .html(`
                <strong>${d.properties.name}</strong><br>
                <hr />
                <strong>Incidence Rate ${year}:</strong> <code>${incidentRate.toFixed(2)}</code><br>
                <strong>Temperature ${year}:</strong> <code>${temperature.toFixed(2)}°C</code><br>
                <strong>Precipitation ${year}:</strong> <code>${precipitation.toFixed(2)}mm</code><br>
                <strong>Illiteracy Rate:</strong> <code>${illiterate.toFixed(2)}%</code><br>
                <strong>Higher Education:</strong> <code>${education.toFixed(2)}%</code><br>
                <strong>Unemployment:</strong> <code>${unemployed.toFixed(2)}%</code><br>
                <strong>No Water Access:</strong> <code>${water.toFixed(2)}%</code><br>
                <strong>No Internet Access:</strong> <code>${internet.toFixed(2)}%</code>
            `);

        moveTooltip(event); 
    }
}


export function moveTooltip(event) {
    d3.select("#tooltip")
        .style("left", (event.pageX + 16) + "px")
        .style("top", (event.pageY + 16) + "px");
}

export function hideTooltip() {
    d3.select("#tooltip").style("opacity", 0);
}
