// Banff's work on text rendering for year and what happened in that year 

const yearInfo = {
    2007: "Test 2007",
    2008: "Test 2008",
    2009: "Test 2009",
    2010: "Test 2010",
    2011: "Test 2011",
    2012: "Test 2012",
    2013: "Test 2013",
    2014: "Test 2014",
    2015: "Test 2015",
    2016: "Test 2016",
    2017: "Test 2017",
    2018: "Test 2018",
    2019: "Test 2019",
};

export function updateText(year) {
    const yearParagraph = document.getElementById("year-info");
    if (yearInfo[year]) {
        yearParagraph.textContent = yearInfo[year];
    } else {
        yearParagraph.textContent = "No information available for this year.";
    }
}