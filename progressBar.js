export function createProgressBar(state) {
    // define the progress bar object to be shared with global state
    const progressObj = {
        container: null,
        barFill: null,
    };

    function init() {
        // select progress bar container
        progressObj.container = d3.select("#progress-bar")
            .style("width", "100%")
            .style("height", "5px")
            .style("background", "#444")
            .style("position", "relative");

        // append the progress bar indicator
        progressObj.barFill = progressObj.container.append("div")
            .attr("id", "progress-bar-fill")
            .style("height", "100%")
            .style("width", "0%")
            .style("background", "#f00")
            .style("transition", "width 0.1s linear");

        // update the bar with the current global state
        update(state);
    }

    function update(state) {
        // determine progress
        let progress = (state.virtualScroll / window.innerHeight / 5) * 100;

        // fill in progress
        progressObj.barFill.style("width", `${progress}%`);
    }

    // initialize the progress bar
    init();

    // attach the progress bar object to the global state
    state.progressBar = progressObj;

    // return the update function
    return update;
}
