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

type ResizeDirection = "right" | "bottom" | "corner";
export const DragableBasicLayout = ({ children, data, index, onDragStart, style }: DraggableProps) => {
    const [size, setSize] = useState({ width: style.width, height: style.height });
    const [selectedId, setSelectedId] = useState<null | number>(null);
    const resizableRef = useRef(null);
    const isResizing = useRef(false);
    const currentResizer = useRef<ResizeDirection | null>(null);
    const initialSize = useRef({ width: size.width, height: size.height });
    const initialMousePos = useRef({ x: 0, y: 0 });

    const [borderHighlight, setBorderHighlight] = useState({
        top: false,
        bottom: false,
        left: false,
        right: false,
    });

    const threshold = 30; // Umbral en píxeles para detectar cercanía

    const startResize = (e: React.MouseEvent<HTMLDivElement>, direction: ResizeDirection) => {
        e.preventDefault();
        e.stopPropagation();

        isResizing.current = true;
        currentResizer.current = direction;

        initialSize.current = { width: size.width, height: size.height };
        initialMousePos.current = { x: e.clientX, y: e.clientY };

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResize);
    };

    const resize = (e: MouseEvent) => {
        if (!isResizing.current || !resizableRef.current) return;

        const currentWidth = parseInt(initialSize.current.width as string, 10);
        const currentHeight = parseInt(initialSize.current.height as string, 10);
        const deltaX = e.clientX - initialMousePos.current.x;
        const deltaY = e.clientY - initialMousePos.current.y;

        let newWidth = currentWidth;
        let newHeight = currentHeight;

        if (currentResizer.current === "right") newWidth = Math.max(100, currentWidth + deltaX);
        if (currentResizer.current === "bottom") newHeight = Math.max(100, currentHeight + deltaY);
        if (currentResizer.current === "corner") {
            newWidth = Math.max(100, currentWidth + deltaX);
            newHeight = Math.max(100, currentHeight + deltaY);
        }

        setSize({ width: newWidth + "px", height: newHeight + "px" });
    };

    const stopResize = () => {
        isResizing.current = false;
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
    };

    const handleDrag = (event: React.DragEvent) => {
        if (!resizableRef.current) return;

        const { clientX, clientY } = event;
        const targetRect = (resizableRef.current as HTMLDivElement)?.getBoundingClientRect();

        const distanceTop = Math.abs(clientY - targetRect.top);
        const distanceBottom = Math.abs(clientY - targetRect.bottom);
        const distanceLeft = Math.abs(clientX - targetRect.left);
        const distanceRight = Math.abs(clientX - targetRect.right);

        const distances = [
            { side: "top", value: distanceTop },
            { side: "bottom", value: distanceBottom },
            { side: "left", value: distanceLeft },
            { side: "right", value: distanceRight },
        ];

        const closest = distances.reduce((prev, curr) => (curr.value < prev.value ? curr : prev));

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

    const { onDrop } = useContext(AppContext);

    const handleDrop = (e: React.DragEvent) => {
        handleDragEnd();
        const droppedData = e.dataTransfer.getData("component")
        console.log(e.dataTransfer.getData("component"));

        if (droppedData.id === data.id) {
            return; // No permitir drop sobre sí mismo
        }

        const targetRect = (resizableRef.current as HTMLDivElement).getBoundingClientRect();
        const dropX = e.clientX - targetRect.left;
        const dropY = e.clientY - targetRect.top;
        const centerX = targetRect.width / 2;
        const centerY = targetRect.height / 2;

        const distanceToCenter = Math.sqrt(Math.pow(dropX - centerX, 2) + Math.pow(dropY - centerY, 2));
        const distanceToEdge = Math.min(dropX, targetRect.width - dropX, dropY, targetRect.height - dropY);

        let action = "none";
        if (distanceToEdge < distanceToCenter) {
            action = "swap";
        } else {
            action = "insert";
        }

        console.log(`Drop action: ${action}`);
        onDrop(e as React.DragEvent<HTMLDivElement>, data, index, action);
    };

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
                overflow: "auto",
                borderTop: `2px solid ${borderHighlight.top ? "black" : "transparent"}`,
                borderBottom: `2px solid ${borderHighlight.bottom ? "black" : "transparent"}`,
                borderLeft: `2px solid ${borderHighlight.left ? "black" : "transparent"}`,
                borderRight: `2px solid ${borderHighlight.right ? "black" : "transparent"}`,
                transition: "border 0.2s",
            }}
            className="layout"
            draggable
            onDragStart={(e) => {
                onDragStart(index)
                e.dataTransfer.setData("component", JSON.stringify(data));
            }}
            onDragOver={(e) => {
                e.preventDefault();
                handleDrag(e);
            }}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedId(data.id);
            }}
            onBlur={() => setSelectedId(null)}
            tabIndex={index}
        >
            {children}
            {selectedId === data.id && (
                <>
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