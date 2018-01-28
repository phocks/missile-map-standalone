/* globals d3 topojson */

const margin = 100
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

let currentLocationId = "northkorea"
let currentRangeInKms = 1000
let previousRangeInKms = 0


const body = d3.select('body')
  .style("background-color", "#f9f9f9")
  .style('margin', 0)


const canvas = d3.select(".world")
  .append("canvas")
  .style("display", "block")
  .attr("width", screenWidth)
  .attr("height", screenHeight)

import worldMap from "./world-map.js"
import storyData from "./story-data.js"

const land = topojson.feature(worldMap, worldMap.objects.land)
const globe = { type: "Sphere" }
  

const projection = d3
  .geoOrthographic() // Globe projection
  .clipAngle(90) // Only display front side of the world
  .fitExtent( // Auto zoom
    [[margin, margin], [screenWidth - margin, screenHeight - margin]],
    globe
  )

const context = canvas.node().getContext("2d")

const path = d3
    .geoPath()
    .projection(projection)
    .context(context)





// Set the main point
const initialPoint = getItem("pyongyang").longlat;
  projection.rotate([-initialPoint[0], -initialPoint[1]]);

const rangeCircle = d3
    .geoCircle()
    .center(initialPoint)
    .radius(kmsToRadius(currentRangeInKms));


// Draw the inital state of the world
drawWorld()

function drawWorld() {
  // Clear the canvas ready for redraw
  context.clearRect(0, 0, screenWidth, screenHeight);

  // Draw the oceans and the seas
  context.beginPath();
  context.lineWidth = 1.2;
  context.strokeStyle = "#B6CED6";
  context.fillStyle = "#E4EDF0";
  path(globe);
  context.fill();
  context.stroke();

  // Draw all landmasses
  context.beginPath();
  context.strokeStyle = "darkgrey";
  context.fillStyle = "white";
  context.lineWidth = 1.1;
  path(land);
  context.fill();
  context.stroke();
  
  // Draw circle launch radius
  context.beginPath();
  context.strokeStyle = "#FF6100";
  context.globalAlpha = 0.1;
  context.fillStyle = "#FF4D00";
  context.lineWidth = 2.2;
  path(rangeCircle());
  context.fill();
  context.globalAlpha = 1;
  context.stroke();


  // Draw a circle outline around the world
  // First clear any radius around the outside
  context.beginPath();
  context.strokeStyle = "#f9f9f9";
  context.lineWidth = 12;
  path(globe);
  context.stroke();

  // Draw a little circle a bit smaller radius
  // We mess with the scale then put it back
  // This is to hide the range border when past clipAngle
  context.beginPath();
  context.strokeStyle = "#B6CED6";
  context.lineWidth = 2;
  projection.scale(projection.scale() - 5);
  path(globe);
  context.stroke();
  projection.scale(projection.scale() + 5);
}

// // The story starts here
let currentStoryPosition = 0;
let storyPositionMax = storyData.length;

// Set initial global scale to handle zoom ins and outs
let initialGlobeScale = projection.scale();


body.on("keydown", () => {
  // Advance the story on keydown event
  console.log("Keycode: " + d3.event.keyCode)
  
  // If back left arrow key go back one
  if (d3.event.keyCode === 37) {
    currentStoryPosition--;
    if (currentStoryPosition < 0) currentStoryPosition = storyPositionMax-1;
  } else {
    // Otherwise proceed
    currentStoryPosition++;
    if (currentStoryPosition >= storyPositionMax) currentStoryPosition = 0;
  }
  
  
  // Set ranges
  previousRangeInKms = currentRangeInKms;
  currentRangeInKms = storyData[currentStoryPosition].range
  
  // Set rotations
  let previousRotation = projection.rotate();
  let currentRotation = storyData[currentStoryPosition].longlat
  
  // Set scales
  let previousScale = projection.scale();
  let currentScale = initialGlobeScale * (storyData[currentStoryPosition].scale / 100);
  
  console.log("Story position: " + currentStoryPosition);
  console.log(storyData[currentStoryPosition].name);
  console.log("Missile range: " + currentRangeInKms);
  console.log("Earth's rotation: " + currentRotation);
  console.log("Zoom: " + currentScale);
  
  let dummyTransition = {}
  
  d3.select(dummyTransition)
    .transition("transition")
    .delay(0)
    .duration(1000)
    .tween("rotate", function() {
      let rotationInterpolate = d3.interpolate(previousRotation, [
        -currentRotation[0],
        -currentRotation[1],
        0
      ]);
    
      let radiusInterpolate = d3.interpolate(
        kmsToRadius(previousRangeInKms),
        kmsToRadius(currentRangeInKms)
      );
    
      let scaleInterpolate = d3.interpolate(
            previousScale,
            currentScale
      );

      // Return the tween function
      return function(time) {
        projection.rotate(rotationInterpolate(time));
        rangeCircle.radius(radiusInterpolate(time));
        projection.scale(scaleInterpolate(time));
        drawWorld();
      };
    }
  );
});



// Helper to turn kilometres into a D3 radius
function kmsToRadius(kms) {
  return kms / 111.319444; // This many kilometres per degree
}

// A helper function to index an array of objects
function getItem(id) {
  return storyData.find(item => item.id === id);
}
