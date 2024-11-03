// app/components/ClientSketchWrapper.tsx

"use client"; // Ensures this component is rendered client-side

// Import SketchContainer to handle the p5.js instance and dynamic import
import { SketchContainer } from "@/components/SketchContainer";

// Import the sampleSketch, which contains the p5.js code
import { sampleSketch } from "@/sketches/sampleSketch";

export default function ClientSketchWrapper() {
  return (
    <div className="flex flex-col justify-center items-center flex-grow w-full h-full">
      <SketchContainer sketch={sampleSketch} />
    </div>
  );
}
