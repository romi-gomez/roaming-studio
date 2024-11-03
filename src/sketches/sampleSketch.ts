// src/sketches/sampleSketch.ts

import p5 from "p5";

export const sampleSketch = (
  p: InstanceType<typeof p5>,
  parentRef: HTMLDivElement
) => {
  // Custom interface to represent a vector used by the centipede
  interface P5Vector {
    x: number;
    y: number;
    z?: number;
    copy(): P5Vector;
    mag(): number;
    normalize(): P5Vector;
  }

  // Array to store the centipede body segments
  let spinePoints: P5Vector[] = [];
  let numSegments = 3000; // Number of segments that make up the centipede's body. If increased, the length of the centipede will increase.
  let segmentLength = 40; // Length of each body segment. If increased, the length of each leg and body part will increase.

  // Direction vector to represent the current movement direction of the centipede
  let direction: P5Vector = {
    x: 1,
    y: 0,
    copy() { return { ...this }; },
    mag() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
    normalize() {
      const m = this.mag();
      return {
        x: this.x / m,
        y: this.y / m,
        copy() { return { ...this }; },
        mag() { return Math.sqrt(this.x ** 2 + this.y ** 2); },
        normalize() { return this; }
      };
    }
  };

  // Target direction vector that updates whenever a user clicks
  let targetDirection: P5Vector = direction.copy();
  let speed = 0.5; // Speed of the centipede movement. If increased, the centipede will move faster.
  let amplitude = 0.8; // Amplitude of the subtle sinusoidal oscillation. If increased, the side-to-side movement will become more pronounced.
  let frequency = 0.01; // Frequency of the sinusoidal oscillation. If increased, the oscillation will happen more quickly.
  let legSpacing = 15; // Spacing between legs

  let resizeObserver: ResizeObserver; // Observer to handle resizing of the canvas when the parent element changes size

  // New interaction variables
  let circlePosition: P5Vector; // Position of the random circle
  let circleRadius: number; // Radius of the random circle
  interface P5Color {
    toString(): string;
}

let circleColor: P5Color;
  let centipedeColor: P5Color; // Initial color of the centipede
  let shrinking = false; // Flag to indicate shrinking of the circle

  // Initializes the canvas based on the dimensions of the parent div element
  const initializeCanvas = () => {
    const width = parentRef.clientWidth;
    const height = parentRef.clientHeight;

    if (width > 0 && height > 0) {
      p.createCanvas(width, height).parent(parentRef);
      initializeCentipede();
      initializeCircle(); // Initialize the random circle position
    } else {
      setTimeout(initializeCanvas, 50); // Retry initializing if dimensions are not available yet
    }
  };

  // Initializes the centipede by placing all segments at the center of the canvas
  const initializeCentipede = () => {
    spinePoints = []; // Clear previous segments
    const startX = 0;
    const startY = p.height;
    for (let i = 0; i < numSegments; i++) {
      spinePoints.push(p.createVector(startX, startY) as P5Vector); // Start with all segments at the center
    }
    direction = p.createVector(1, 0).normalize() as P5Vector; // Initial direction is to the right
    targetDirection = direction.copy();
    centipedeColor = p.color(255) as P5Color; // Reset centipede color to white
  };

  // Initializes the random circle position
  const initializeCircle = () => {
    const width = p.width;
    const height = p.height;
    circleRadius = p.random(20, 100); // Random radius between 20 and 100
    circlePosition = p.createVector(p.random(circleRadius, width - circleRadius), p.random(circleRadius, height - circleRadius)) as P5Vector;
    circleColor = p.color(p.random(255), p.random(255), p.random(255)) as P5Color; // Random color for the circle
  };

  // p5.js setup function to initialize the canvas and observer
  p.setup = () => {
    setTimeout(() => {
      initializeCanvas();

      // Observe the parent element for resizing, and adjust the canvas accordingly
      resizeObserver = new ResizeObserver(() => {
        const width = parentRef.clientWidth;
        const height = parentRef.clientHeight;

        if (width > 0 && height > 0) {
          p.resizeCanvas(width, height);
          initializeCentipede(); // Reinitialize centipede to adjust to new canvas size
          initializeCircle(); // Reinitialize circle position to adjust to new canvas size
        }
      });
      resizeObserver.observe(parentRef);
    }, 100); // Delay to ensure the parent element is fully loaded
  };

  // p5.js function to remove the canvas and disconnect the observer
  p.remove = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  };

  // p5.js draw function, called on every frame to update the canvas
  p.draw = () => {
    if (!p.canvas || spinePoints.length < numSegments) return;

    p.background(0, 50); // Set the background to black with opacity

    if (!p.canvas || spinePoints.length < numSegments) return;

    p.background(0, 50); // Set the background to black with opacity
    updateCentipedeDirection(); // Update centipede's direction based on target direction
    drawCentipedeBody(); // Draw the body of the centipede
    drawCircle(); // Draw the random circle

    checkCircleCollision(); // Check if the head of the centipede touches the circle

    if (shrinking) {
      shrinkCircle(); // Shrink the circle until it disappears
    }

    // Display parameter values at the bottom of the screen
    p.fill(0,190);
    p.rect(0, p.height-30, p.width, p.height);
    p.fill(255);
    p.textSize(12);
    p.textAlign(p.LEFT);
    p.text(
      `frequency: ${frequency.toFixed(3)} [ + F ][ - f ]  ` +
      `amplitude: ${amplitude.toFixed(1)} [ + A ][ - a ]  ` +
      `segmentLength: ${segmentLength} [ + S ][ - s ] ` +
      `legSpacing: ${legSpacing} [ + L ][ - l  ]  ` +
      `speed: ${speed.toFixed(1)} [ + V ][ - v ]  ` +
      `numSegments: ${numSegments} [ + N ][ - n ]   `,
      10, p.height - 10
    );
  };

  // p5.js function called when the mouse is pressed
  p.mousePressed = () => {
    const mouseVector = p.createVector(p.mouseX, p.mouseY) as P5Vector;
    const head = spinePoints[0];

    // Update the direction to head towards the point clicked by the user
    targetDirection = p.createVector(mouseVector.x - head.x, mouseVector.y - head.y).normalize() as P5Vector;
  };

  // p5.js function called when a key is pressed to interactively adjust parameters
  p.keyPressed = () => {
    switch (p.key) {
      case 'n':
        numSegments = Math.max(100, numSegments - 100);
        break;
      case 'N':
        numSegments += 100;
        break;
      case 'f':
        frequency = Math.max(0.001, frequency - 0.001);
        break;
      case 'F':
        frequency += 0.001;
        break;
      case 'a':
        amplitude = Math.max(0.1, amplitude - 0.1);
        break;
      case 'A':
        amplitude += 0.1;
        break;
      case 's':
        segmentLength = Math.max(1, segmentLength - 1);
        break;
      case 'S':
        segmentLength += 1;
        break;
      case 'l':
        legSpacing = Math.max(1, legSpacing - 1);
        break;
      case 'L':
        legSpacing += 1;
        break;
      case 'v':
        speed = Math.max(0.1, speed - 0.1);
        break;
      case 'V':
        speed += 0.1;
        break;
    }
  };

  // Function to update the direction of the centipede towards the target
  const updateCentipedeDirection = () => {
    const head = spinePoints[0];

    // Gradually move the current direction towards the target direction for smooth movement
    direction.x = p.lerp(direction.x, targetDirection.x, 0.1); // Smooth transition using linear interpolation
    direction.y = p.lerp(direction.y, targetDirection.y, 0.1);
    direction = direction.normalize();

    // Apply subtle sinusoidal oscillation to the movement for more natural motion
    const angle = p.frameCount * frequency;
    const offsetX = amplitude * Math.sin(angle) * direction.y; // Oscillate perpendicular to the direction of travel
    const offsetY = amplitude * Math.sin(angle) * -direction.x;

    // Calculate the new head position based on the direction, speed, and oscillation offset
    const newHead = p.createVector(
      head.x + direction.x * speed + offsetX,
      head.y + direction.y * speed + offsetY
    ) as P5Vector;

    // Add the new head position to the front of the spinePoints array
    spinePoints.unshift(newHead);
    if (spinePoints.length > numSegments) {
      spinePoints.pop(); // Maintain the length of the centipede by removing the last segment
    }
  };

  // Function to draw the centipede's body
  const drawCentipedeBody = () => {
    p.stroke(centipedeColor); // Set stroke color for the centipede body
    p.strokeWeight(2); // Set thickness of the centipede body line
    p.noFill(); // Do not fill the body shape
    p.beginShape();
    for (let i = 0; i < spinePoints.length; i++) {
      const pos = spinePoints[i];
      p.curveVertex(pos.x, pos.y); // Draw smooth curves connecting each segment
    }
    p.endShape();

    // Draw legs for certain segments to create a more realistic centipede appearance
    for (let i = 40; i < spinePoints.length; i += legSpacing) { // Use adjustable leg spacing
      drawLegs(spinePoints[i], spinePoints[i - 1], i);
    }
  };

  // Function to draw the random circle
  const drawCircle = () => {
    p.fill(circleColor);
    p.noStroke();
    p.circle(circlePosition.x, circlePosition.y, circleRadius * 2);
  };

  // Function to check if the centipede head touches the circle
  const checkCircleCollision = () => {
    const head = spinePoints[0];
    const distance = p.dist(head.x, head.y, circlePosition.x, circlePosition.y);
    if (distance < circleRadius) {
      centipedeColor = circleColor; // Change centipede color to the circle color
      shrinking = true; // Start shrinking the circle
    }
  };

  // Function to shrink the circle until it disappears
  const shrinkCircle = () => {
    if (circleRadius > 0) {
      circleRadius -= 1; // Decrease the radius gradually
    } else {
      shrinking = false; // Stop shrinking
      initializeCircle(); // Initialize a new circle after shrinking is complete
    }
  };

  // Function to draw the legs of the centipede
  const drawLegs = (center: P5Vector, prev: P5Vector, index: number) => {
    p.stroke(centipedeColor); // Set stroke color for the legs to match the centipede body
    p.strokeWeight(1); // Set leg thickness to be thinner than the body

    // Calculate the vector between the current and previous segment to determine orientation
    const vector = p.createVector(center.x - prev.x, center.y - prev.y).normalize();
    const perpendicular = p.createVector(-vector.y, vector.x); // Perpendicular direction for drawing legs

    const t = p.frameCount * 0.01; // Time factor to create oscillation for the legs

    for (let side = -1; side <= 1; side += 2) { // Draw legs on both sides of the body
      // Calculate positions for root, joint, and tip of each leg
      const Zroot = p.createVector(
        center.x + perpendicular.x * side * segmentLength * 2 * Math.sin(t * 0.25),
        center.y + perpendicular.y * side * segmentLength * 2 * Math.cos(t * 0.25)
      ) as P5Vector;
      const Zjoint = p.createVector(
        Zroot.x + perpendicular.x * Math.sin(t * 0.5 + (p.PI * 0.25) * index),
        Zroot.y + perpendicular.y * Math.cos(t * 0.5 + (p.PI * 0.25) * index)
      ) as P5Vector;
      const Ztip = p.createVector(
        Zjoint.x + perpendicular.x * side * 1.2 * segmentLength * 2 * Math.sin(t * 0.0001 * index),
        Zjoint.y + perpendicular.y * side * 1.2 * segmentLength * 2 * Math.cos(t * 0.0005 * index)
      ) as P5Vector;

      // Draw the segments of the leg
      p.line(center.x, center.y, Zroot.x, Zroot.y); // Line from body to root of the leg
      p.line(Zroot.x, Zroot.y, Zjoint.x, Zjoint.y); // Line from root to joint of the leg
      p.line(Zjoint.x, Zjoint.y, Ztip.x, Ztip.y); // Line from joint to tip of the leg

      // Draw small circles at each articulation and tip for better visibility
      p.fill(255, 255, 255); // Set fill color to white
      p.circle(Zroot.x, Zroot.y, 3); // Circle at root
      p.circle(Zjoint.x, Zjoint.y, 3); // Circle at joint
      p.circle(Ztip.x, Ztip.y, 3); // Circle at tip
    }
  };
};
