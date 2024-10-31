// src/components/SketchContainer.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";

type Sketch = (p: InstanceType<typeof p5>, parentRef: HTMLDivElement) => void;

export const SketchContainer: React.FC<{ sketch: Sketch }> = ({ sketch }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted || !parentRef.current) return;

    let p5instance: InstanceType<typeof p5>;

    const initP5 = async () => {
      const p5Module = (await import("p5")).default;

      // Type `p` explicitly to avoid implicit `any`
      p5instance = new p5Module((p: InstanceType<typeof p5>) => sketch(p, parentRef.current!));
    };

    initP5();
    return () => p5instance?.remove();
  }, [isMounted, sketch]);

  return <div ref={parentRef} className="w-full h-full" />;
};
