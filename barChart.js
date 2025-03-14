import { zoomToRegion } from "./map.js";

export function drawBarChart(state) {
  // setting up the bar plot container and dimentions
  const container = document.getElementById("bar-chart-container");
  const width = container.clientWidth;
  const aspectRatio = 3 / 4;
  const height = width * aspectRatio;

  const svg = d3.select("#bar-chart")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "none");

  // changing the margins a bit
  const bars = svg.append("g")
    .attr("transform", "translate(180,0)");

  // creating and sharing the bar chart components
  state.barChart = {
    svg,
    bars,
    xScale: d3.scaleLinear().range([0, width - 200]),
    yScale: d3.scaleBand().range([0, height - 20]).padding(0.1),
    xAxisGroup: bars.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - 20})`),
    yAxisGroup: bars.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(-8,0)")
  };

  // update the initial bar plot setup with current global state
  updateBarChart(state);
}

export function updateBarChart(state) {
  // grab and define some global state details
  const { bars, xScale, yScale, xAxisGroup, yAxisGroup } = state.barChart;
  const year = state.year;
  const selectedType = state.selectedDataType;

  // get the data
  const data = state.data.features.map(d => ({
    name: d.properties.name,
    value: d.properties[`${selectedType}_${year}`] || 0
  }));

  // sort and slice the top 10
  data.sort((a, b) => d3.descending(a.value, b.value));
  const top10 = data.slice(0, 10);

  // update x and y scales
  xScale.domain([0, d3.max(top10, d => d.value)]);
  yScale.domain(top10.map(d => d.name));

  const colorInterpolator = {
    "incident": d3.interpolateGreens,
    "temp": d3.interpolateReds,
    "prec": d3.interpolateBlues
  }[selectedType];

  // link data to bars
  const barsSelection = bars.selectAll(".bar")
    .data(top10, d => d.name);

  // build the bars
  barsSelection.join(
    // this is for when new bars appear
    enter => enter
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => yScale(d.name))
      .attr("height", yScale.bandwidth())
      .attr("width", 0)
      .attr("fill", d => state.mapChart.colorScale(d.value))
      .on("click", (event, d) => {
        // call zoom function when a bar is clicked
        zoomToRegion(d.name, state);
      })
      .on("mouseover", (event, d) => {
        // dim all bars except the hovered one
        d3.selectAll(".bar")
          .interrupt()
          .transition()
          .duration(200)
          .style("opacity", 0.5);

        d3.select(event.target)
          .interrupt()
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "black")
          .style("stroke-width", 2);

        // detemines the correct municipality and strokes it
        const matchingMunicipalities = state.data.features.filter(
          p => p.properties.name === d.name
        );

        const topMunicipality = matchingMunicipalities.reduce((max, p) => {
          const value = p.properties[`${selectedType}_${state.year}`] || 0;
          return value > (max?.properties[`${selectedType}_${state.year}`] || 0) ? p : max;
        }, null);

        if (topMunicipality) {
          d3.selectAll(".map-path")
            .filter(p => p === topMunicipality)
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        }

        d3.select(event.target)
          .style("cursor", "pointer");
      })
      .on("mouseout", (event, d) => {
        // restore all bars' opacity
        d3.selectAll(".bar")
          .interrupt()
          .transition()
          .duration(200)
          .style("opacity", 1);

        d3.select(event.target)
          .interrupt()
          .transition()
          .duration(200)
          .style("stroke", null)
          .style("stroke-width", null);

        // detemines the correct municipality and unstrokes it
        const matchingMunicipalities = state.data.features.filter(
          p => p.properties.name === d.name
        );

        const topMunicipality = matchingMunicipalities.reduce((max, p) => {
          const incidentRate = p.properties[`incident_${state.year}`] || 0;
          return incidentRate > (max?.properties[`incident_${state.year}`] || 0) ? p : max;
        }, null);

        d3.selectAll(".map-path")
          .attr("stroke", null)
          .attr("stroke-width", null);
      })
      // animate the bars
      .call(enter => enter
        .transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("width", d => xScale(d.value))
      ),
    // this when bars need to be updated (like position)
    update => update
      .interrupt() // needed to avoid a bug
      // animate bar movement
      .call(update => update.transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("y", d => yScale(d.name))
        .attr("width", d => xScale(d.value))
        .attr("fill", d => state.mapChart.colorScale(d.value))
      ),
    // this when a bar is removed (keep it like this because it avoid another bug)
    exit => exit.remove()
  );

  // link data with labels
  const labels = bars
    .selectAll(".bar-label")
    .data(top10, d => d.name);

  // build the labels
  labels.join(
    // once again, this is for when labels are newly created
    enter => enter
      .append("text")
      .attr("class", "bar-label")
      .attr("x", 0)
      .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2 + 4)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("text-anchor", "end")
      .style("opacity", 0)
      .text(d => {
        // Format temperature values to one decimal place
        return selectedType === "temp" ? d3.format(".1f")(d.value) : d3.format(",.0f")(d.value);
      })
      // animate the new labels
      .call(enter => enter.transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("x", d => xScale(d.value) - 5)
        .style("opacity", 1)
      ),
    // this is when the labels updated (like their rank and thus position)
    update => update
      .interrupt() // keep to avoid a race condition bug
      .text(d => {
        // Format based on selectedType
        return selectedType === "temp" ? d3.format(".1f")(d.value) : d3.format(",.0f")(d.value);
      })
  
      // animate existing labels
      .call(update => update.transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("x", d => xScale(d.value) - 5)
        .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2 + 4)
        .style("opacity", 1)
      ),
    // this is when labels are removed (keep it like this to avoid bugs)
    exit => exit.remove()
  );

  // animate and update axis'
  xAxisGroup
    .transition()
    .duration(750)
    .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => {
      return selectedType === "temp" ? d3.format(".1f")(d) : d3.format(",.0f")(d);
    }))

    .selectAll("text")
    .style("font-size", "14px");

  yAxisGroup
    .transition()
    .duration(750)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "14px");
}
