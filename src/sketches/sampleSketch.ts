// src/sketches/sampleSketch.ts
import p5 from "p5";

// Define the sample sketch function
// We use 'InstanceType<typeof p5>' instead of 'p5' directly because 'p5' cannot be used as a type.
// This approach resolves the TypeScript error where 'p5' cannot be used as a value or type.
// It ensures that 'p' is correctly recognized as an instance of p5,
// avoiding TypeScript errors about 'p5' not being usable as a type.
export const sampleSketch = (p: InstanceType<typeof p5>, parentRef: HTMLDivElement) => {
  p.setup = () => p.createCanvas(400, 400).parent(parentRef);
  p.draw = () => {
    p.background(200);
    p.circle(200, 200, 50);
  };
};
