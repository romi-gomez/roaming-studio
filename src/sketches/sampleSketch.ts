// src/sketches/sampleSketch.ts

import p5 from "p5";

export const sampleSketch = (
  p: InstanceType<typeof p5>,
  parentRef: HTMLDivElement
) => {
  // Define a minimal interface for p5.Vector
  interface P5Vector {
    x: number;
    y: number;
    z?: number;
    copy(): P5Vector;
    mag(): number;
    normalize(): P5Vector;
  }

  // Variables for the centipede animation
  let spinePoints: P5Vector[] = []; // Array to store the positions of the centipede's body segments
  const numSegments = 3000; // Number of segments to control the length of the centipede
  const segmentLength = 40; // Length of the central segment of each leg
  let direction: P5Vector = { // Current direction of the centipede
    x: 1,
    y: 1,
    // Copy the current vector to ensure modifications don't affect the original
    copy() { return { ...this }; }, // Create a new object with the same x and y values to prevent modifying the original vector when adjustments are needed
    // Calculate the magnitude of the vector (length)
    mag() { return Math.sqrt(this.x ** 2 + this.y ** 2); }, // Calculate the length of the vector using Pythagoras' theorem to determine how far the vector points in space
    // Normalize the vector (make its magnitude 1) to keep movement consistent
    normalize() {
      const m = this.mag(); // Get the magnitude of the current vector to scale it
      return {
        x: this.x / m, // Divide x by magnitude to make the vector unit length (length = 1)
        y: this.y / m, // Divide y by magnitude to make the vector unit length (length = 1)
        // Provide new methods for the normalized vector
        copy() { return { ...this }; }, // Provide a copy method for the normalized vector so it can be cloned independently
        mag() { return Math.sqrt(this.x ** 2 + this.y ** 2); }, // Provide a magnitude method for the normalized vector so we can calculate its length if needed
        normalize() { return this; } // Provide a normalize method that returns itself, since it's already normalized
      };
    }
  };
  const speed = 0.8; // Speed of the centipede's movement
  let angleOffset = -0.005; // Angle offset used for oscillating movement of the centipede
  let resizeObserver: ResizeObserver;

  // Initialize the canvas with correct dimensions
  const initializeCanvas = () => {
    const width = parentRef.clientWidth;
    const height = parentRef.clientHeight;

    if (width > 0 && height > 0) {
      p.createCanvas(width, height).parent(parentRef);
      initializeCentipede(); // Initialize the centipede after canvas is set to start drawing
    } else {
      setTimeout(initializeCanvas, 50); // Retry if dimensions are not available yet, e.g., if the parent is not fully loaded
    }
  };

  // Initialize centipede parameters
  const initializeCentipede = () => {
    spinePoints = []; // Clear the current spine points to reset the centipede
    for (let i = 0; i < numSegments; i++) {
      spinePoints.push(p.createVector(0, 0) as P5Vector); // Start the centipede from the center of the canvas with all points initialized at (0, 0)
    }
    direction = p.createVector(1, 0).normalize() as P5Vector; // Set the initial direction of movement to the right
  };

  // p5.js setup function
  p.setup = () => {
    setTimeout(() => {
      initializeCanvas(); // Set up the canvas with appropriate dimensions

      resizeObserver = new ResizeObserver(() => {
        const width = parentRef.clientWidth;
        const height = parentRef.clientHeight;

        if (width > 0 && height > 0) {
          p.resizeCanvas(width, height); // Resize the canvas if the parent changes size
          initializeCentipede(); // Reinitialize centipede to adjust to the new canvas size
        }
      });
      resizeObserver.observe(parentRef); // Start observing the size of the parent element to adjust the canvas
    }, 100); // Delay to ensure parent element is ready
  };

  // Clean up the observer when the sketch is removed
  p.remove = () => {
    if (resizeObserver) {
      resizeObserver.disconnect(); // Stop observing when the sketch is removed to avoid memory leaks
    }
  };

  // p5.js draw function
  p.draw = () => {
    if (!p.canvas || spinePoints.length < numSegments) return; // Ensure canvas and spinePoints are properly initialized before drawing

    p.background(0); // Clear the canvas with a black background each frame

    // Update centipede position and direction
    updateCentipedeDirection();

    // Draw the centipede body and legs
    drawCentipedeBody();
  };

  // Function to update centipede's direction and move smoothly
  const updateCentipedeDirection = () => {
    const head = spinePoints[0]; // Get the current head position of the centipede

    // Calculate new direction based on oscillation, making an infinity shape
    angleOffset += 0.0009; // Controls how fast the centipede oscillates to create a looping path
    const offsetX = Math.sin(angleOffset) * (p.width * 0.8); // Determine how much to oscillate in the X-axis
    const offsetY = Math.cos(2 * angleOffset) * (p.height * 0.8); // Determine how much to oscillate in the Y-axis

    // Update direction vector with oscillation
    direction.x += offsetX; // Add oscillation to X direction to create dynamic movement
    direction.y += offsetY; // Add oscillation to Y direction to create dynamic movement
    direction = direction.normalize(); // Normalize to maintain consistent speed regardless of direction changes

    // Update the head position to move in the new direction
    const newHead = p.createVector(
      head.x + direction.x * speed, // Move the head position by speed in the direction of X
      head.y + direction.y * speed // Move the head position by speed in the direction of Y
    ) as P5Vector;

    // Check for boundary and adjust direction smoothly when approaching canvas limits
    const margin = 50; // Margin from edge to trigger a direction change
    if (newHead.x <= margin || newHead.x >= p.width - margin) {
      direction.x = -Math.abs(direction.x) * Math.sign(p.width / 2 - newHead.x); // Reverse direction on X-axis when near canvas boundary
    }
    if (newHead.y <= margin || newHead.y >= p.height - margin) {
      direction.y = -Math.abs(direction.y) * Math.sign(p.height / 2 - newHead.y); // Reverse direction on Y-axis when near canvas boundary
    }

    // Add new head position to the front and remove the last segment to maintain length
    spinePoints.unshift(newHead); // Add the new head position at the front of the spine
    if (spinePoints.length > numSegments) {
      spinePoints.pop(); // Remove the last segment to keep the centipede the same length
    }
  };

  // Function to draw the centipede body and its legs based on given equations
  const drawCentipedeBody = () => {
    p.stroke(255); // Set stroke color to white for the centipede body
    p.strokeWeight(2); // Set thickness of the centipede body lines
    p.noFill(); // Do not fill the shape, as it's just the outline
    p.beginShape();
    for (let i = 0; i < spinePoints.length; i++) {
      const pos = spinePoints[i];
      p.curveVertex(pos.x, pos.y); // Draw a smooth curve through each spine point
    }
    p.endShape();

    // Draw legs for fewer segments to increase spacing between legs
    for (let i = 40; i < spinePoints.length; i += 10) {
      drawLegs(spinePoints[i], spinePoints[i - 1], i); // Draw legs for every 30th segment to reduce visual clutter
    }
  };

  // Function to draw legs for each segment
  const drawLegs = (center: P5Vector, prev: P5Vector, index: number) => {
    p.stroke(200); // Set stroke color for the legs (lighter gray)
    p.strokeWeight(1); // Set leg thickness to be thinner than the body

    // Calculate the direction vector between the current and previous segment to determine leg orientation
    const vector = p.createVector(center.x - prev.x, center.y - prev.y).normalize(); // Direction from previous segment to current
    const perpendicular = p.createVector(-vector.y, vector.x); // Get a vector perpendicular to the body direction to draw legs

    const t = p.frameCount * 0.01; // Controls the speed of oscillation for leg movement

    for (let side = -1; side <= 1; side += 2) { // Draw legs on both sides of the body
      // Calculate root, joint, and tip based on the given equations for oscillatory leg movement
      const Zroot = p.createVector(
        center.x + perpendicular.x * side * segmentLength * 1, // Root of the leg relative to the body center
        center.y + perpendicular.y * side * segmentLength * 1
      ) as P5Vector;
      const Zjoint = p.createVector(
        Zroot.x + perpendicular.x * side * 1 * segmentLength, // Joint position relative to the root, to form articulation
        Zroot.y + perpendicular.y * side * 1 * segmentLength
      ) as P5Vector;
      const Ztip = p.createVector(
        Zjoint.x + perpendicular.x * side * 1 * segmentLength * Math.sin(t + (p.PI / 3) * index), // Tip position influenced by further oscillation
        Zjoint.y + perpendicular.y * side * 1 * segmentLength * Math.cos(t + (p.PI / 5) * index)
      ) as P5Vector;

      // Draw central leg segment
      p.line(center.x, center.y, Zroot.x, Zroot.y); // Draw line from body center to root of the leg
      // Draw articulated side segments
      p.line(Zroot.x, Zroot.y, Zjoint.x, Zjoint.y); // Draw line from root to joint
      p.line(Zjoint.x, Zjoint.y, Ztip.x, Ztip.y); // Draw line from joint to tip for complete leg
    }
  };
};
