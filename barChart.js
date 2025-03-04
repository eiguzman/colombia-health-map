import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Draws the initial horizontal bar chart.
export function drawBarChart(state) {
  // Set up dimensions and margins for the bar chart.
  const margin = { top: 20, right: 20, bottom: 30, left: 100 };
  const width = 500 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Select the container SVG and set its dimensions.
  const svg = d3.select("#bar-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Save chart settings in state for later use.
  state.barChart = { svg, width, height, margin };

  // Draw the chart initially.
  updateBarChart(state);
}

// Updates the horizontal bar chart based on the selected year.
export function updateBarChart(state) {
  const year = state.year;
  
  // Create data array: for each region, get the incidence value for the selected year.
  const data = state.data.features.map(d => ({
    name: d.properties.name,
    value: d.properties[`incident_${year}`] || 0
  }));

  // Optionally, sort the data by value (highest first).
  data.sort((a, b) => d3.descending(a.value, b.value));

  const { svg, width, height } = state.barChart;

  // Create scales: x for values and y for region names (horizontal bars).
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, height])
    .padding(0.1);

  // Data join for bars.
  const bars = svg.selectAll(".bar")
    .data(data, d => d.name);

  // Update existing bars.
  bars.transition()
    .duration(750)
    .attr("width", d => x(d.value))
    .attr("y", d => y(d.name))
    .attr("height", y.bandwidth());

  // Enter new bars.
  bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", d => y(d.name))
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.value))
    .attr("fill", "steelblue");

  // Remove any bars that are no longer in the data.
  bars.exit().remove();

  // Add or update the x-axis.
  let xAxisGroup = svg.select(".x-axis");
  if (xAxisGroup.empty()) {
    xAxisGroup = svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`);
  }
  xAxisGroup.transition()
    .duration(750)
    .call(d3.axisBottom(x).ticks(5));

  // Add or update the y-axis.
  let yAxisGroup = svg.select(".y-axis");
  if (yAxisGroup.empty()) {
    yAxisGroup = svg.append("g")
      .attr("class", "y-axis");
  }
  yAxisGroup.transition()
    .duration(750)
    .call(d3.axisLeft(y));
}
