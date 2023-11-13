import React from "react";
import dynamic from "next/dynamic";

const Sketch = dynamic(import("react-p5"), { ssr: false });

interface SketchComponentProps {
  setup: any;
  draw:any;
}

const SketchComponent: React.FC<SketchComponentProps> = (props) => {
  return <Sketch setup={props.setup} draw={props.draw} />;
};

export default SketchComponent;
