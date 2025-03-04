
import * as React from 'react';
import styled from '@emotion/styled'

import { Box, Button } from "@mui/material";
import { AppContext, ComponentType } from '@/context/AppContext';

import { useContext, useEffect, useRef, useState } from 'react'
interface DraggableProps {
    children?: React.ReactNode,

    data: ComponentType,
    style: React.CSSProperties,
    index: number;

    onStyleChange?: (newStyle: React.CSSProperties) => void,
    onDragStart: (index: number) => void;
}
export const ButtonCustom = styled(Button)({

})
export const LayoutBasic = styled(Box)({
    // width: '100px',
    // height: '100vh',
})


export const DragableBasicLayout = ({ children, data, index, onDragStart, style }: DraggableProps) => {
    const [size, setSize] = useState({ width: style.width, height: style.height });
    const [selectedId, setSelectedId] = useState<null | number>(null);
    const resizableRef = useRef(null);
    const isResizing = useRef(false);
    const currentResizer = useRef<ResizeDirection | null>(null);
    const initialSize = useRef({ width: size.width, height: size.height });
    const initialMousePos = useRef({ x: 0, y: 0 });

    interface StartResizeEvent extends React.MouseEvent<HTMLDivElement> {
        clientX: number;
        clientY: number;
    }

    interface StartResizeProps {
        (e: StartResizeEvent, direction: ResizeDirection): void;
    }

    const startResize: StartResizeProps = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();

        isResizing.current = true;
        currentResizer.current = direction;

        // Guardar tamaño inicial y posición del mouse
        initialSize.current = { width: size.width, height: size.height };
        initialMousePos.current = { x: e.clientX, y: e.clientY };

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResize);
    };

    interface ResizeEvent extends MouseEvent {
        clientX: number;
        clientY: number;
    }

    type ResizeDirection = "right" | "bottom" | "corner";

    const resize = (e: ResizeEvent) => {
        console.log(size);
        if (!isResizing.current || !resizableRef.current) return;

        const currentWdth = parseInt(initialSize.current.width as string, 10);
        const currentHeight = parseInt(initialSize.current.height as string, 10);
        const deltaX = e.clientX - initialMousePos.current.x;
        const deltaY = e.clientY - initialMousePos.current.y;

        let newWidth = currentWdth;
        let newHeight = currentHeight;

        if (currentResizer.current === "right") {
            newWidth = Math.max(100, currentWdth + deltaX);
        }
        if (currentResizer.current === "bottom") {
            newHeight = Math.max(100, currentHeight + deltaY);
        }
        if (currentResizer.current === "corner") {
            newWidth = Math.max(100, currentWdth + deltaX);
            newHeight = Math.max(100, currentHeight + deltaY);
        }

        setSize({ width: newWidth + "px", height: newHeight + "px" });
    };

    const stopResize = () => {
        isResizing.current = false;
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
    };

    const { onDrop } = useContext(AppContext);

    return (
        <LayoutBasic
            ref={resizableRef}
            style={{
                ...style,
                width: size.width,
                height: size.height,
                padding: 4,
                transform: "scale(0.98)",
                transformOrigin: "top",
                position: "relative",
                border: selectedId === data.id ? "2px solid blue" : "2px solid transparent",
            }}
            className="layout"
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => e.preventDefault()} // Permite drop
            onDrop={(e) => onDrop(e, data, index)} // Maneja drop condicionalmente
            onClick={(e) => {
                e.stopPropagation();
                setSelectedId(data.id);
            }}
            onBlur={() => setSelectedId(null)}
            tabIndex={0}
        >
            {children}
            {selectedId === data.id && (
                <>
                    {/* Anclaje derecho */}
                    <div
                        style={{
                            position: "absolute",
                            right: 0,
                            top: "50%",
                            width: "5px",
                            height: "50px",
                            background: "blue",
                            cursor: "ew-resize",
                            transform: "translateY(-50%)",
                        }}
                        onMouseDown={(e) => startResize(e, "right")}
                    />
                    {/* Anclaje inferior */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: "50%",
                            width: "50px",
                            height: "5px",
                            background: "blue",
                            cursor: "ns-resize",
                            transform: "translateX(-50%)",
                        }}
                        onMouseDown={(e) => startResize(e, "bottom")}
                    />
                    {/* Anclaje en la esquina */}
                    <div
                        style={{
                            position: "absolute",
                            right: 0,
                            bottom: 0,
                            width: "10px",
                            height: "10px",
                            background: "blue",
                            cursor: "nwse-resize",
                        }}
                        onMouseDown={(e) => startResize(e, "corner")}
                    />
                </>
            )}
        </LayoutBasic>
    );
};
export function DraggableComponent({ index, onDragStart, style,

    //  onDrop,
    data }: DraggableProps) {
    return (

        <ButtonCustom
            style={style}
            className="button"
            draggable
            onDragStart={(e) => {

                e.dataTransfer.setData("component", JSON.stringify(data))
                onDragStart(index)
            }}
            onDragOver={(e) => e.preventDefault()} // Necesario para permitir drop
        //   onDrop={() => onDrop(index)}
        >
            {index + 1}
        </ButtonCustom>
    );
}