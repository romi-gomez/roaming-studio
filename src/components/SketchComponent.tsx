import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Importa react-p5 solo en el cliente
const Sketch = dynamic(() => import("react-p5"), { ssr: false });

interface SketchComponentProps {
  setup: any;
  draw: any;
}

const SketchComponent: React.FC<SketchComponentProps> = (props) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Cambia el estado a true en el montaje del cliente
  }, []);

  if (!isClient) return null; // Evita la renderización en el servidor

  return <Sketch setup={props.setup} draw={props.draw} />;
};

export default SketchComponent;
