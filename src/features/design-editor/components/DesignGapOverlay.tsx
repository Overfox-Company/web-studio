"use client";

import { useEffect, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { DragDropHorizontalIcon, DragDropVerticalIcon } from "@hugeicons-pro/core-solid-standard";
import { Box, Typography } from "@mui/material";

import type { DesignAutoLayoutDirection } from "@/src/features/design-editor/types/design.types";

interface GapDragState {
    startClientX: number;
    startClientY: number;
    initialValue: number;
}

export interface DesignGapSegment {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    handleX: number;
    handleY: number;
}

interface DesignGapOverlayProps {
    direction: DesignAutoLayoutDirection;
    gap: number;
    segments: DesignGapSegment[];
    zoom: number;
    visible: boolean;
    interactive: boolean;
    onChange: (nextValue: number) => void;
}

function getPointerDelta(direction: DesignAutoLayoutDirection, event: PointerEvent, dragState: GapDragState, zoom: number) {
    return direction === "horizontal"
        ? (event.clientX - dragState.startClientX) / zoom
        : (event.clientY - dragState.startClientY) / zoom;
}

function createPattern(fillOpacity: number) {
    return `repeating-linear-gradient(135deg, rgba(255, 158, 66, ${fillOpacity}) 0px, rgba(255, 158, 66, ${fillOpacity}) 6px, rgba(255, 158, 66, 0.06) 6px, rgba(255, 158, 66, 0.06) 12px)`;
}

export function DesignGapOverlay({
    direction,
    gap,
    segments,
    zoom,
    visible,
    interactive,
    onChange,
}: DesignGapOverlayProps) {
    const [dragState, setDragState] = useState<GapDragState | null>(null);

    useEffect(() => {
        if (!dragState) {
            return;
        }

        const currentDragState = dragState;

        function handlePointerMove(event: PointerEvent) {
            const delta = getPointerDelta(direction, event, currentDragState, zoom);
            const nextValue = Math.max(0, Math.round(currentDragState.initialValue + delta));

            onChange(nextValue);
        }

        function handlePointerUp() {
            setDragState(null);
        }

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp, { once: true });

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [direction, dragState, onChange, zoom]);

    if (!visible || segments.length === 0) {
        return null;
    }

    function beginDrag(event: React.PointerEvent<HTMLDivElement>) {
        if (!interactive || event.button !== 0) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        setDragState({
            startClientX: event.clientX,
            startClientY: event.clientY,
            initialValue: gap,
        });
    }

    const handleIcon = direction === "horizontal" ? DragDropVerticalIcon : DragDropHorizontalIcon;
    const cursor = interactive ? (direction === "horizontal" ? "ew-resize" : "ns-resize") : "default";

    return (
        <Box sx={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
            {segments.map((segment) => (
                <Box
                    key={`${segment.id}-fill`}
                    sx={{
                        position: "absolute",
                        left: segment.x,
                        top: segment.y,
                        width: segment.width,
                        height: segment.height,
                        background: segment.width > 0 && segment.height > 0 ? createPattern(0.2) : "transparent",
                        border: segment.width > 0 && segment.height > 0 ? "1px solid rgba(255, 158, 66, 0.5)" : "none",
                        pointerEvents: "none",
                    }}
                />
            ))}

            {segments.map((segment) => (
                <Box
                    key={`${segment.id}-handle`}
                    onPointerDown={beginDrag}
                    sx={{
                        position: "absolute",
                        left: segment.handleX,
                        top: segment.handleY,
                        transform: "translate(-50%, -50%)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.55,
                        px: 0.7,
                        py: 0.4,
                        borderRadius: 999,
                        background: "rgba(34, 22, 12, 0.92)",
                        color: "rgba(255, 239, 220, 0.96)",
                        border: "1px solid rgba(255, 158, 66, 0.54)",
                        boxShadow: "0 8px 18px rgba(33, 20, 7, 0.28)",
                        cursor,
                        pointerEvents: interactive ? "auto" : "none",
                        userSelect: "none",
                        zIndex: 4,
                    }}
                >
                    <HugeiconsIcon icon={handleIcon} size={16} strokeWidth={0} />
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, lineHeight: 1, letterSpacing: "0.04em" }}>
                        G {gap}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}