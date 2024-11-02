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
  const numSegments = 3000; // Number of segments that make up the centipede's body. If increased, the length of the centipede will increase.
  const segmentLength = 40; // Length of each body segment. If increased, the length of each leg and body part will increase.

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
  const speed = 0.5; // Speed of the centipede movement. If increased, the centipede will move faster.
  const amplitude = 0.8; // Amplitude of the subtle sinusoidal oscillation. If increased, the side-to-side movement will become more pronounced.
  const frequency = 0.01; // Frequency of the sinusoidal oscillation. If increased, the oscillation will happen more quickly.

  let resizeObserver: ResizeObserver; // Observer to handle resizing of the canvas when the parent element changes size

  // Initializes the canvas based on the dimensions of the parent div element
  const initializeCanvas = () => {
    const width = parentRef.clientWidth;
    const height = parentRef.clientHeight;

    if (width > 0 && height > 0) {
      p.createCanvas(width, height).parent(parentRef);
      initializeCentipede();
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

    p.background(0); // Set the background to black
    updateCentipedeDirection(); // Update centipede's direction based on target direction
    drawCentipedeBody(); // Draw the body of the centipede
  };

  // p5.js function called when the mouse is pressed
  p.mousePressed = () => {
    const mouseVector = p.createVector(p.mouseX, p.mouseY) as P5Vector;
    const head = spinePoints[0];

    // Update the direction to head towards the point clicked by the user
    targetDirection = p.createVector(mouseVector.x - head.x, mouseVector.y - head.y).normalize() as P5Vector;
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
    p.stroke(255); // Set stroke color to white for the centipede body
    p.strokeWeight(2); // Set thickness of the centipede body line
    p.noFill(); // Do not fill the body shape
    p.beginShape();
    for (let i = 0; i < spinePoints.length; i++) {
      const pos = spinePoints[i];
      p.curveVertex(pos.x, pos.y); // Draw smooth curves connecting each segment
    }
    p.endShape();

    // Draw legs for certain segments to create a more realistic centipede appearance
    for (let i = 40; i < spinePoints.length; i += 15) { // Increasing this value increases spacing between legs
      drawLegs(spinePoints[i], spinePoints[i - 1], i);
    }
  };

  // Function to draw the legs of the centipede
  const drawLegs = (center: P5Vector, prev: P5Vector, index: number) => {
    p.stroke(200); // Set stroke color to light gray for the legs
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
