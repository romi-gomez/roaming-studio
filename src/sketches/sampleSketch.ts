// src/sketches/sampleSketch.ts
import p5 from "p5";

export const sampleSketch = (p: InstanceType<typeof p5>, parentRef: HTMLDivElement) => {
  p.setup = () => p.createCanvas(400, 400).parent(parentRef);
  p.draw = () => {
    p.background(200);
    p.circle(200, 200, 50);
  };
};
