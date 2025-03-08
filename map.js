export function createMap(state) {
    // the map object shared with the global object
    const mapObj = {
        width: 800,
        height: 600,
        svg: null,
        path: null,
        projection: null,
        colorScale: null,
        paths: null,
    };

    // intial creation and drawing of the map
    function init() {
        // determining dimentions
        const bounds = d3.geoBounds(state.data);
        const [[x0, y0], [x1, y1]] = bounds;
        mapObj.height = mapObj.width * ((y1 - y0) / (x1 - x0));

        // grabbing the map svg
        mapObj.svg = d3.select('#map')
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${mapObj.width} ${mapObj.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        // creating and sharing the projection
        mapObj.projection = d3.geoMercator()
            .fitExtent([[10, 10], [mapObj.width - 10, mapObj.height - 10]], state.data);

        // creating and sharing a path generator
        mapObj.path = d3.geoPath()
            .projection(mapObj.projection);

        // creating and sharing the paths (aka geometry)
        mapObj.paths = mapObj.svg.selectAll("path")
            .data(state.data.features)
            .join("path")
            .attr("class", "map-path")
            .attr("d", mapObj.path)
            .style("cursor", "pointer")
            // setting up tooltip interactions
            .on("mouseover", (_, d) => {
                d3.select("#tooltip")
                    .style("opacity", 1)
                    .html(`
                        Name: ${d.properties.name}<br>
                        Incidence Rate: ${(d.properties[`incident_${state.year}`] || 0).toFixed(2)}<br>
                        Year: ${state.year}
                    `);
            })
            .on("mousemove", (event) => {
                d3.select("#tooltip")
                    .style("left", (event.pageX + 16) + "px")
                    .style("top", (event.pageY + 16) + "px");
            })
            .on("mouseout", () => {
                d3.select("#tooltip").style("opacity", 0);
            });

        // update the initial map with the current state
        update(state);
        // draw the legend
        createLegend();
    }

    function update(state) {
        const year = state.year;
        const maxCases = state.globalMaxCases || 1;

        // create, share, and update the color scales for the map
        mapObj.colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain([Math.log1p(1), Math.log1p(maxCases)])
            .interpolator(d => d3.interpolateReds((Math.log1p(d) - Math.log1p(1)) / (Math.log1p(maxCases) - Math.log1p(1))));

        // attach animations to the map geometries
        mapObj.svg.selectAll("path")
            .transition()
            .duration(750)
            .ease(d3.easeCubicOut)
            .attr("fill", d => mapObj.colorScale(d.properties[`incident_${year}`] || 1));
    }

    function createLegend() {
        // get and set the legend container and dimensions
        const legendContainer = document.getElementById("legend");
        const legendWidth = Math.min(legendContainer.clientWidth, 400);
        const legendHeight = 20;
        const margin = { left: 10, right: 10 };

        const svg = d3.select("#legend")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "50")
            .attr("viewBox", `0 0 ${legendWidth + margin.left + margin.right} 50`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        // create legend
        const legendScale = d3.scaleLog()
            .domain([1, state.globalMaxCases])
            .range([0, legendWidth]);

        // configure gradient
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");

        linearGradient.selectAll("stop")
            .data(d3.range(0, 1.01, 0.1))
            .enter().append("stop")
            .attr("offset", d => `${d * 100}%`)
            .attr("stop-color", d => mapObj.colorScale(d * state.globalMaxCases));

        // apply gradient to a rectangle
        svg.append("rect")
            .attr("x", margin.left)
            .attr("y", 10)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)")
            .style("stroke", "white")
            .style("stroke-width", "1px");

        // create axis
        const axis = d3.axisBottom(legendScale)
            .ticks(5, d3.format(".0f"))
            .tickSize(5);

        // apply axis
        svg.append("g")
            .attr("transform", `translate(${margin.left}, ${legendHeight + 10})`)
            .call(axis)
            .select(".domain")
            .remove();

        // give a zie to the legend text
        svg.selectAll("text")
            .style("font-size", "14px");
    }

    // create the initial map (that loads an updated state)
    init();
    // share the map object
    state.mapChart = mapObj;
    // return the update function (whic is later attached to global state)
    return update;
}
