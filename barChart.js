export function drawBarChart(state) {
  const container = document.getElementById("bar-chart-container");
  const width = container.clientWidth;
  const aspectRatio = 3 / 4;
  const height = width * aspectRatio;

  const svg = d3.select("#bar-chart")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "none");

  const bars = svg.append("g")
    .attr("transform", "translate(180,40)");

  state.barChart = {
    svg,
    bars,
    xScale: d3.scaleLinear().range([0, width - 200]),
    yScale: d3.scaleBand().range([0, height - 80]).padding(0.1),
    xAxisGroup: bars.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height - 80})`),
    yAxisGroup: bars.append("g").attr("class", "y-axis")
  };

  updateBarChart(state);
}


export function updateBarChart(state) {
  const { bars, xScale, yScale, xAxisGroup, yAxisGroup } = state.barChart;
  const year = state.year;

  const data = state.data.features.map(d => ({
    name: d.properties.name,
    value: d.properties[`incident_${year}`] || 0
  }));

  data.sort((a, b) => d3.descending(a.value, b.value));
  const top10 = data.slice(0, 10);

  xScale.domain([0, d3.max(top10, d => d.value)]);
  yScale.domain(top10.map(d => d.name));

  const barsSelection = bars.selectAll(".bar")
    .data(top10, d => d.name);

  barsSelection.join(
    enter => enter
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => yScale(d.name))
      .attr("height", yScale.bandwidth())
      .attr("width", 0)
      .attr("fill", d => state.mapChart.colorScale(d.value))
      .on("mouseover", (event, d) => {
        // detemines the correct municipality and strokes it
        const matchingMunicipalities = state.data.features.filter(
          p => p.properties.name === d.name
        );

        const topMunicipality = matchingMunicipalities.reduce((max, p) => {
          const incidentRate = p.properties[`incident_${state.year}`] || 0;
          return incidentRate > (max?.properties[`incident_${state.year}`] || 0) ? p : max;
        }, null);

        if (topMunicipality) {
          d3.selectAll(".map-path")
            .filter(p => p === topMunicipality)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        }

        d3.select(event.target)
          .style("cursor", "pointer");
      })
      .on("mouseout", (event, d) => {
        // detemines the correct municipality and unstrokes it
        const matchingMunicipalities = state.data.features.filter(
          p => p.properties.name === d.name
        );

        const topMunicipality = matchingMunicipalities.reduce((max, p) => {
          const incidentRate = p.properties[`incident_${state.year}`] || 0;
          return incidentRate > (max?.properties[`incident_${state.year}`] || 0) ? p : max;
        }, null);

        if (topMunicipality) {
          d3.selectAll(".map-path")
            .filter(p => p === topMunicipality)
            .attr("stroke", null)
            .attr("stroke-width", null);
        }
      })
      .call(enter => enter.transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("width", d => xScale(d.value))
      ),

    update => update
      .interrupt()
      .call(update => update.transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("y", d => yScale(d.name))
        .attr("width", d => xScale(d.value))
        .attr("fill", d => state.mapChart.colorScale(d.value))
      ),

    exit => exit
      .interrupt()
      .call(exit => exit.transition()
        .duration(500)
        .attr("width", 0)
        .remove()
      )
  );

  const labels = bars
    .selectAll(".bar-label")
    .data(top10, d => d.name);

  labels.join(
    enter => enter
      .append("text")
      .attr("class", "bar-label")
      .attr("x", 0)
      .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2 + 4)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("text-anchor", "end")
      .style("opacity", 0)
      .text(d => d3.format(",.0f")(d.value))
      .call(enter => enter.transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("x", d => xScale(d.value) - 5)
        .style("opacity", 1)
      ),

    update => update
      .interrupt()
      .text(d => d3.format(",.0f")(d.value))
      .call(update => update.transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("x", d => xScale(d.value) - 5)
        .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2 + 4)
        .style("opacity", 1)
      ),

    exit => exit.remove()
  );


  xAxisGroup
    .transition()
    .duration(750)
    .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(",.0f")))
    .selectAll("text")
    .style("font-size", "14px");

  yAxisGroup
    .transition()
    .duration(750)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "14px");
}
