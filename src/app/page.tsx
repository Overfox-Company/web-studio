'use client'
import { useRef, useState } from "react";
export default function Home() {

  const targetRef = useRef(null);
  const [borderHighlight, setBorderHighlight] = useState({
    top: false,
    bottom: false,
    left: false,
    right: false,
  });

  const threshold = 30; // Umbral en píxeles para detectar cercanía

  const handleDrag = (event) => {
    if (!targetRef.current) return;

    const { clientX, clientY } = event;
    const targetRect = targetRef.current.getBoundingClientRect();

    // Calcular distancias a cada borde
    const distanceTop = Math.abs(clientY - targetRect.top);
    const distanceBottom = Math.abs(clientY - targetRect.bottom);
    const distanceLeft = Math.abs(clientX - targetRect.left);
    const distanceRight = Math.abs(clientX - targetRect.right);

    // Determinar qué borde está más cercano
    const distances = [
      { side: "top", value: distanceTop },
      { side: "bottom", value: distanceBottom },
      { side: "left", value: distanceLeft },
      { side: "right", value: distanceRight },
    ];

    const closest = distances.reduce((prev, curr) =>
      curr.value < prev.value ? curr : prev
    );

    // Activar solo el borde más cercano si está dentro del umbral
    setBorderHighlight({
      top: closest.side === "top" && closest.value < threshold,
      bottom: closest.side === "bottom" && closest.value < threshold,
      left: closest.side === "left" && closest.value < threshold,
      right: closest.side === "right" && closest.value < threshold,
    });
  };

  const handleDragEnd = () => {
    setBorderHighlight({ top: false, bottom: false, left: false, right: false });
  };
  return (
    <div >
      <div style={{ padding: "50px", textAlign: "center" }}>
        <div
          ref={targetRef}
          style={{
            width: "200px",
            height: "200px",
            borderTop: `3px solid ${borderHighlight.top ? "red" : "black"}`,
            borderBottom: `3px solid ${borderHighlight.bottom ? "red" : "black"}`,
            borderLeft: `3px solid ${borderHighlight.left ? "red" : "black"}`,
            borderRight: `3px solid ${borderHighlight.right ? "red" : "black"}`,
            position: "relative",
            margin: "50px auto",
            backgroundColor: "lightgray",
            transition: "border 0.2s",
          }}
        >
          Área objetivo
        </div>

        <div
          draggable
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{
            width: "100px",
            height: "100px",
            backgroundColor: "blue",
            color: "white",
            textAlign: "center",
            lineHeight: "100px",
            cursor: "grab",
            userSelect: "none",
            margin: "auto",
          }}
        >
          Arrástrame
        </div>
      </div>
    </div>
  );
}
