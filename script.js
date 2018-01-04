/* globals d3 topojson */

console.log("Hi and welcome to the world.");

// Go get size of window
const screenWidth = window.innerWidth,
      screenHeight = window.innerHeight;

// A json representation of the continents
const topojsonUrl = "https://cdn.glitch.com/ecd65865-433e-4560-8104-4a18cad12c20%2Fworld-simple.topo.json?1515022555174";

// Set some body styles for full window niceness
d3.select("body")
  .style("background-color", "#f9f9f9")
  .style("margin", "0");

// Append the background canvas to the page
d3.select(".globe")
  .append("canvas")
  .style("display", "block")
  .attr("width", screenWidth)
  .attr("height", screenHeight);

// Let's asynchronously load up our data
d3.queue(1) // load a certain number of files concurrently
  .defer(d3.json, topojsonUrl)
  .awaitAll(dataLoaded);

function dataLoaded(error, data) {
  console.log(data);
}