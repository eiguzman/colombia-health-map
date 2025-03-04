// barChart.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * Draws an initial horizontal bar chart.
 * - Creates scales, axes, and a group for bars.
 * - Calls `updateBarChart(state)` to populate bars for the current year.
 */
export function drawBarChart(state) {
  // Dimensions and margins
  const margin = { top: 40, right: 20, bottom: 40, left: 150 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Select the <svg> and set its overall width & height
  const svg = d3.select("#bar-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // Append a group to contain bars & axes
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Title
  g.append("text")
    .attr("class", "bar-chart-title")
    .attr("x", 0)
    .attr("y", -10)
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Top 10 by Dengue Incidence");

  // Store chart elements & scales in state so we can update them later
  state.barChart = {
    svg,      // the overall <svg>
    g,        // the main group
    width,
    height,
    margin,
    xScale: d3.scaleLinear().range([0, width]),
    yScale: d3.scaleBand().range([0, height]).padding(0.1),
  };

  // Draw initial axes groups (empty for now)
  state.barChart.xAxisGroup = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

  state.barChart.yAxisGroup = g.append("g")
    .attr("class", "y-axis");

  // Now populate bars based on the current year
  updateBarChart(state);
}

/**
 * Updates the bar chart when the year changes (slider input).
 * - Filters/sorts data for top 10.
 * - Updates scales, bars, axes, and chart title with transitions.
 */
export function updateBarChart(state) {
  const { g, xScale, yScale, xAxisGroup, yAxisGroup, width, height } = state.barChart;
  const year = state.year;

  // Convert GeoJSON features -> array of { name, value } for the current year
  const data = state.data.features.map(d => ({
    name: d.properties.name,
    value: d.properties[`incident_${year}`] || 0
  }));

  // Sort descending by value, then take top 10
  data.sort((a, b) => d3.descending(a.value, b.value));
  const top10 = data.slice(0, 10);

  // Update scales
  xScale.domain([0, d3.max(top10, d => d.value)]);
  yScale.domain(top10.map(d => d.name));

  // Update or create bars
  const bars = g.selectAll(".bar")
    .data(top10, d => d.name);  // key by name

  // ENTER + UPDATE
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
    .attr("fill", "#4682B4");

  // EXIT
  bars.exit().remove();

  // Update axes with transitions
  const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(",.0f"));
  xAxisGroup.transition().duration(750).call(xAxis);

  const yAxis = d3.axisLeft(yScale);
  yAxisGroup.transition().duration(750).call(yAxis);

  // Update chart title to reflect current year
  g.select(".bar-chart-title")
    .text(`Top 10 by Dengue Incidence (${year})`);
}
