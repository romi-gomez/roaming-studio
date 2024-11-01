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
  let pts: P5Vector[] = [];
  let spinePositions: P5Vector[] = [];
  let t = 0;
  const segments = 60;
  const factor1 = 4;
  const factor2 = 3;
  let n: number;
  let totalTimeSteps: number;
  let resizeObserver: ResizeObserver;

  // Helper class for B-spline interpolation
  class BSpline {
    controlPoints: P5Vector[];

    constructor(controlPoints: P5Vector[]) {
      this.controlPoints = controlPoints;
    }

    // De Boor's algorithm for B-spline evaluation
    getPoint(t: number): P5Vector {
      const n = this.controlPoints.length - 1;
      const degree = 3; // Cubic B-spline
      const knots: number[] = [];

      // Uniform knot vector
      for (let i = 0; i <= n + degree + 1; i++) {
        knots.push(i);
      }

      // Scale t to the knot vector range
      const tScaled = t * knots[n + degree + 1];

      // Find the knot span
      let span = -1;
      for (let i = degree; i <= n; i++) {
        if (tScaled >= knots[i] && tScaled < knots[i + 1]) {
          span = i;
          break;
        }
      }

      // If t is at the end, use the last span
      if (span === -1) {
        span = n;
      }

      // Initialize the de Boor points
      const d: P5Vector[] = [];
      for (let j = 0; j <= degree; j++) {
        d[j] = this.controlPoints[span - degree + j].copy();
      }

      // De Boor recursion
      for (let r = 1; r <= degree; r++) {
        for (let j = degree; j >= r; j--) {
          const i = span - degree + j;
          const alpha =
            (tScaled - knots[i]) / (knots[i + degree - r + 1] - knots[i]);
          d[j] = vectorAdd(
            vectorMult(d[j - 1], 1 - alpha),
            vectorMult(d[j], alpha)
          );
        }
      }

      return d[degree];
    }
  }

  // Initialize the canvas with correct dimensions
  const initializeCanvas = () => {
    const width = parentRef.clientWidth;
    const height = parentRef.clientHeight;

    // Check if the dimensions are greater than zero
    if (width > 0 && height > 0) {
      // Create the canvas with the same dimensions as the parent and attach it to parentRef
      console.log("SIZE:::::", width, height);
      p.createCanvas(width, height).parent(parentRef);

      // Initialize any variables or arrays after the canvas is created
      initializeCentipede();
    } else {
      // If dimensions are zero, wait and retry after a short delay
      setTimeout(initializeCanvas, 50);
    }
  };

  // Initialize centipede parameters and precompute positions
  const initializeCentipede = () => {
    // Define the control points for the spline path
    pts = [
      p.createVector(0, 0),
      p.createVector(100, 100),
      p.createVector(200, -100),
      p.createVector(300, 0),
      p.createVector(400, -200),
      p.createVector(600, 100),
      p.createVector(200, 300),
      p.createVector(200, 0),
      p.createVector(300, -200),
      p.createVector(400, -100),
      p.createVector(500, 200),
      p.createVector(400, 200),
      p.createVector(300, 200),
      p.createVector(100, 100),
      p.createVector(100, -100),
    ];

    // Scale the points to fit the canvas
    for (let i = 0; i < pts.length; i++) {
      pts[i].x = (pts[i].x / 600) * p.width;
      pts[i].y = (pts[i].y / 600) * p.height;
    }

    // Precompute spine positions along the spline
    n = Math.floor(factor1 * segments);
    totalTimeSteps = n - segments - 1;

    // Generate positions along the spline
    generateSpinePositions();
  };

  // Generate the positions along the spline
  const generateSpinePositions = () => {
    spinePositions = [];

    // Create a spline path using the control points
    const spline = new BSpline(pts);

    // Sample points along the spline
    const totalPoints = Math.floor(factor1 * factor2 * segments);
    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const pos = spline.getPoint(t);
      spinePositions.push(pos);
    }
  };

  // p5.js setup function
  p.setup = () => {
    // Delay canvas initialization to ensure parent element dimensions are stable
    setTimeout(() => {
      initializeCanvas();

      // Set up a ResizeObserver on parentRef after canvas is initialized
      resizeObserver = new ResizeObserver(() => {
        const width = parentRef.clientWidth;
        const height = parentRef.clientHeight;

        // Ensure that the canvas dimensions are updated
        if (width > 0 && height > 0) {
          p.resizeCanvas(width, height);
          initializeCentipede(); // Reinitialize centipede positions to fit the new size
        }
      });
      resizeObserver.observe(parentRef);
    }, 100);
  };

  // Clean up the observer when the sketch is removed
  p.remove = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  };

  // p5.js draw function
  p.draw = () => {
    // Ensure that the canvas has been created before drawing
    if (!p.canvas || spinePositions.length < segments) return;

    // Clear the background
    p.background(0);

    // Draw the centipede
    drawCentipede();

    // Update time
    t = (t + 1) % totalTimeSteps;
  };

  // Function to draw the centipede
  const drawCentipede = () => {
    // For each segment
    for (let L = 1; L < segments - 1; L++) {
      drawSegment(t, L);
    }
  };

  // Function to draw a segment at time 't' and segment index 'L'
  const drawSegment = (t: number, L: number) => {
    // Ensure that the segment is drawn by calculating positions
    const index = t + L;
    if (index >= spinePositions.length - 1) return;

    const center = spinePositions[index];
    const next = spinePositions[index + 1];

    if (!center || !next) return; // Ensure both points are defined

    // Draw the body segment
    p.stroke(255);
    p.strokeWeight(2);
    p.line(center.x, center.y, next.x, next.y);

    // Parameters for leg movement
    const vector = vectorSub(next, center);
    const norm = vector.mag();
    const e2 = vector.copy().normalize();
    const e1 = p.createVector(-e2.y, e2.x); // Perpendicular vector

    const lambda = 3 * Math.sqrt(1 - Math.pow(L - segments / 2, 2) / Math.pow(segments / 2, 2));
    const omega = 0.2;

    // Calculate angles for legs
    const angle1 = ((5 * p.PI) / 180) * Math.sin(omega * t + (p.PI / 6) * L);
    const angle2 = (((5 + 17) * p.PI) / 180) * Math.sin(omega * t + (p.PI / 6) * L);

    // Directions for legs
    const dir1 = vectorAdd(vectorMult(e2, norm * lambda * Math.cos(angle1)), vectorMult(e1, norm * lambda * Math.sin(angle1)));
    const dir2 = vectorAdd(vectorMult(e2, norm * lambda * Math.cos(angle2)), vectorMult(e1, norm * lambda * Math.sin(angle2)));

    // Alternate direction based on segment index L
    const directionFactor = Math.pow(-1, L);

    // Left leg positions
    const jointLeft = vectorAdd(center, vectorMult(dir1, directionFactor));
    const tipLeft = vectorAdd(jointLeft, vectorMult(dir2, directionFactor));

    // Right leg positions
    const jointRight = vectorAdd(center, vectorMult(dir1, -directionFactor));
    const tipRight = vectorAdd(jointRight, vectorMult(dir2, -directionFactor));

    // Draw the legs
    p.strokeWeight(1);
    p.fill(255);
    // Left leg
    p.line(center.x, center.y, jointLeft.x, jointLeft.y);
    p.line(jointLeft.x, jointLeft.y, tipLeft.x, tipLeft.y);
    // Right leg
    p.line(center.x, center.y, jointRight.x, jointRight.y);
    p.line(jointRight.x, jointRight.y, tipRight.x, tipRight.y);
  };

  // Helper functions to perform vector operations without accessing p5.Vector at the module level
  const vectorAdd = (v1: P5Vector, v2: P5Vector): P5Vector => {
    return p.createVector(v1.x + v2.x, v1.y + v2.y);
  };

  const vectorSub = (v1: P5Vector, v2: P5Vector): P5Vector => {
    return p.createVector(v1.x - v2.x, v1.y - v2.y);
  };

  const vectorMult = (v: P5Vector, scalar: number): P5Vector => {
    return p.createVector(v.x * scalar, v.y * scalar);
  };
};
