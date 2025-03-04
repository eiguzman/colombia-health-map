import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Load the data from the JSON file
d3.json('./lib/dynamic.json').then(data => {
    const dynamicContainer = d3.select('.dynamic');

    // Function to update the text based on the selected year
    const updateText = (year) => {
        dynamicContainer.selectAll('*').remove(); // Clear previous text

        // Filter the data for the selected year
        const selectedYearData = data.find(d => d.year === year);
        const negativeOneData = data.find(d => d.year === -1);

        // Display text for the selected year
        if (selectedYearData) {
            dynamicContainer.append('p').text(`${selectedYearData.description}\n`);
        }

        // Display text for the year -1
        if (negativeOneData) {
            dynamicContainer.append('p').text(`\n${negativeOneData.description}`);
        }
    };

    // Initial load
    updateText(2019); // Default to the slider's initial value

    // Listen for changes on the slider
    d3.select('#map-slider').on('input', function() {
        const selectedYear = +this.value; // Get the selected year from the slider
        updateText(selectedYear);
    });
}).catch(error => {
    console.error('Error loading the data:', error);
});
