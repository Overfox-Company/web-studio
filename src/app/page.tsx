'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useRef, useState } from "react";

export default function Home() {
  const [size, setSize] = useState({ width: 200, height: 150 });
  const [selected, setSelected] = useState(false);
  const resizableRef = useRef(null);
  const isResizing = useRef(false);
  const currentResizer = useRef(null);

  const startResize = (e, direction) => {
    e.preventDefault();
    isResizing.current = true;
    currentResizer.current = direction;
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  };

  const resize = (e) => {
    if (!isResizing.current) return;

    const rect = resizableRef.current.getBoundingClientRect();
    let newWidth = size.width;
    let newHeight = size.height;

    if (currentResizer.current === "right") {
      newWidth = e.clientX - rect.left;
    }
    if (currentResizer.current === "bottom") {
      newHeight = e.clientY - rect.top;
    }
    if (currentResizer.current === "corner") {
      newWidth = e.clientX - rect.left;
      newHeight = e.clientY - rect.top;
    }

    setSize({
      width: Math.max(100, newWidth), // Evita tamaño demasiado pequeño
      height: Math.max(100, newHeight),
    });
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  };
  return (
    <div >

      <div
        ref={resizableRef}
        style={{
          width: size.width,
          height: size.height,
          position: "relative",
          backgroundColor: "white",
          border: selected ? "2px solid #007bff" : "2px solid #ccc",
          boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
          transition: "border 0.2s ease",
        }}
        onClick={() => setSelected(true)}
        onBlur={() => setSelected(false)}
        tabIndex={0} // Permite perder foco al hacer clic fuera
      >
        {selected && (
          <>
            {/* Resizer derecho */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                width: "5px",
                height: "50px",
                background: "#007bff",
                cursor: "ew-resize",
                transform: "translateY(-50%)",
              }}
              onMouseDown={(e) => startResize(e, "right")}
            />
            {/* Resizer inferior */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                width: "50px",
                height: "5px",
                background: "#007bff",
                cursor: "ns-resize",
                transform: "translateX(-50%)",
              }}
              onMouseDown={(e) => startResize(e, "bottom")}
            />
            {/* Resizer esquina */}
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "10px",
                height: "10px",
                background: "#007bff",
                cursor: "nwse-resize",
              }}
              onMouseDown={(e) => startResize(e, "corner")}
            />
          </>
        )}
      </div>
    </div>
  );
}
