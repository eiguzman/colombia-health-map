import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function drawBarChart(state) {
  const margin = { top: 40, right: 20, bottom: 40, left: 150 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#bar-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  g.append("text")
    .attr("class", "bar-chart-title")
    .attr("x", 0)
    .attr("y", -10)
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Top 10 by Dengue Incidence");

  state.barChart = {
    svg,
    g,
    width,
    height,
    margin,
    xScale: d3.scaleLinear().range([0, width]),
    yScale: d3.scaleBand().range([0, height]).padding(0.1),
  };

  state.barChart.xAxisGroup = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

  state.barChart.yAxisGroup = g.append("g")
    .attr("class", "y-axis");

  updateBarChart(state);
}

export function updateBarChart(state) {
  const { g, xScale, yScale, xAxisGroup, yAxisGroup, width, height } = state.barChart;
  const year = state.year;

  const data = state.data.features.map(d => ({
    name: d.properties.name,
    value: d.properties[`incident_${year}`] || 0
  }));

  data.sort((a, b) => d3.descending(a.value, b.value));
  const top10 = data.slice(0, 10);

  xScale.domain([0, d3.max(top10, d => d.value)]);
  yScale.domain(top10.map(d => d.name));

  const bars = g.selectAll(".bar")
    .data(top10, d => d.name);

  bars.enter()
    .append("rect")
    .attr("class", "bar")
    .merge(bars)
    .transition()
    .duration(750)
    .attr("y", d => yScale(d.name))
    .attr("x", 0)
    .attr("height", yScale.bandwidth())
    .attr("width", d => xScale(d.value))
    .attr("fill", d => state.colorScale(d.value));

  bars.exit().remove();

  const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(",.0f"));
  xAxisGroup.transition().duration(750).call(xAxis);

  const yAxis = d3.axisLeft(yScale);
  yAxisGroup.transition().duration(750).call(yAxis);

  g.select(".bar-chart-title")
    .text(`Top 10 Municipalities by Dengue Incidence (${year})`);
}
