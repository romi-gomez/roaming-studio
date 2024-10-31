// app/components/ClientSketch.tsx
"use client"; // Ensures this component is rendered client-side

import { SketchContainer } from "@/components/SketchContainer";
import { sampleSketch } from "@/sketches/sampleSketch";

export default function ClientSketch() {
  return (
    <div className="w-[400px] h-[300px]">
      <SketchContainer sketch={sampleSketch} />
    </div>
  );
}
