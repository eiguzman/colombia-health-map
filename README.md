# Defeating Dengue: A Colombia Health Mapping Project

*Originally a collaborative final project for DSC 106 at the University of California, San Diego*

## Description

This interactive exploration website visualizes the spread of dengue fever in Colombia from 2007 to 2018, highlighting key geographical and climatic factors that influence its distribution. Featuring an interactive map, linked bar chart, and a synchronized slider, users can explore dengue incidence alongside climate variables such as temperature and precipitation. The analysis reveals persistent hotspots in municipalities like Florencia, Fortul, and Nilo, as well as epidemic and endemic trends over time. Findings suggest that environmental conditions, such as warm and humid climates, play a crucial role in mosquito breeding, while some regions experience shifting outbreak patterns. This tool underscores the need for targeted public health interventions and a deeper understanding of local risk factors.

## Installation

To setup and run the project locally:

```sh
git clone https://github.com/eiguzman/colombia-health-map.git
cd colombia-health-map

# Set up a simple server (if needed)
python -m http.server 8000  # or just use Live Server in VSCode
```

## Usage

Go to https://eiguzman.github.io/colombia-health-map/ or open the index.html in a browser or local server after installation.

1. Select a measurement of Incidence, Temperature or Precipitation from the dropdown above the map.
2. Move the Year slider to see the change over space and time of the measurment selected.
3. Hover over a bar to see the region outlined on the map, and click to zoom into that region.
4. When hovering over a region on the map, a tooltip will appear to provide the municipality name and measument data.
5. Scrolling down, you can explore further metrics that are independent of the time scroll such as illiteracy, secondary education, unemployment, internet access, and water access rates.
6. Additonally, a Mapbox map showing geographic, environmental, and topographic information is included for better understanding of the above statistics.
7. Lastly, explore the many interconnections and read whats going on within the changing text box.
