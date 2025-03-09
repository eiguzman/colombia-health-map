export function updateStory(year, story) {
    // grab the container for the story
    const container = d3.select('.story');

    // clear it out
    container.selectAll('*').remove();

    // get the current story based on the year
    const currentStory = story.find(d => d.year === year);

    // draw the story to the container
    container.append('p').text(currentStory.description);
}
