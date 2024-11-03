// src/components/SketchContainer.tsx

"use client"; // Ensures this component is client-side rendered
import React, { useEffect, useRef, useState } from "react";
// Import p5 to get type definitions without initializing it immediately
import p5 from "p5";

// Define the type for the sketch function, specifying the types of its arguments
   
// 'InstanceType<typeof p5>' correctly infers the instance type of p5.
type Sketch = (p: InstanceType<typeof p5>, parentRef: HTMLDivElement) => void;

export const SketchContainer: React.FC<{ sketch: Sketch }> = ({ sketch }) => {
  // Create a ref to attach the p5 canvas to a DOM element
  const parentRef = useRef<HTMLDivElement>(null);
  // State to check if the component has mounted
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true after the component mounts
  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    // If not mounted or ref is not available, exit early
    if (!isMounted || !parentRef.current) return;
    
    let p5instance: InstanceType<typeof p5>;
    
    const initP5 = async () => {
      // Dynamically import p5 to avoid server-side rendering issues
      const p5Module = (await import("p5")).default;

      // Initialize p5 with the provided sketch function
      p5instance = new p5Module((p: InstanceType<typeof p5>) => sketch(p, parentRef.current!));
    };

    initP5();

    // Cleanup function to remove the p5 instance when the component unmounts
    return () => p5instance?.remove();
  }, [isMounted, sketch]);

  // Render a div to attach the p5 canvas to
  return <div ref={parentRef} className="flex-grow w-full h-full" />;
};
