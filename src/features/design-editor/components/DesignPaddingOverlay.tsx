"use client";

import { useEffect, useMemo, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { DragDropHorizontalIcon, DragDropVerticalIcon } from "@hugeicons-pro/core-solid-standard";
import { Box, Typography } from "@mui/material";

import type { DesignFrameNode, DesignPadding } from "@/src/features/design-editor/types/design.types";

type PaddingSide = "top" | "right" | "bottom" | "left";

interface PaddingDragState {
    side: PaddingSide;
    startClientX: number;
    startClientY: number;
    initialValue: number;
}

interface DesignPaddingOverlayProps {
    node: DesignFrameNode;
    zoom: number;
    visible: boolean;
    interactive: boolean;
    onChange: (nextValue: Partial<DesignPadding>) => void;
}

function getEditablePadding(node: DesignFrameNode) {
    return node.layoutMode === "auto" ? node.autoLayout.padding : node.padding;
}

function getSideValue(padding: DesignPadding, side: PaddingSide) {
    return padding[side];
}

function createSidePatch(side: PaddingSide, value: number): Partial<DesignPadding> {
    return { [side]: value };
}

function formatSideLabel(side: PaddingSide, value: number) {
    const sideLabelMap: Record<PaddingSide, string> = {
        top: "T",
        right: "R",
        bottom: "B",
        left: "L",
    };

    return `${sideLabelMap[side]} ${value}`;
}

function getHandleIcon(side: PaddingSide) {
    return side === "left" || side === "right" ? DragDropVerticalIcon : DragDropHorizontalIcon;
}

function getPointerDelta(side: PaddingSide, event: PointerEvent, dragState: PaddingDragState, zoom: number) {
    switch (side) {
        case "left":
            return (event.clientX - dragState.startClientX) / zoom;
        case "right":
            return (dragState.startClientX - event.clientX) / zoom;
        case "top":
            return (event.clientY - dragState.startClientY) / zoom;
        case "bottom":
            return (dragState.startClientY - event.clientY) / zoom;
    }
}

export function DesignPaddingOverlay({
    node,
    zoom,
    visible,
    interactive,
    onChange,
}: DesignPaddingOverlayProps) {
    const padding = useMemo(() => getEditablePadding(node), [node]);
    const [dragState, setDragState] = useState<PaddingDragState | null>(null);

    useEffect(() => {
        if (!dragState) {
            return;
        }

        const currentDragState = dragState;

        function handlePointerMove(event: PointerEvent) {
            const delta = getPointerDelta(currentDragState.side, event, currentDragState, zoom);
            const nextValue = Math.max(0, Math.round(currentDragState.initialValue + delta));

            onChange(createSidePatch(currentDragState.side, nextValue));
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
    }, [dragState, onChange, zoom]);

    if (!visible) {
        return null;
    }

    const actualTop = Math.max(0, padding.top);
    const actualRight = Math.max(0, padding.right);
    const actualBottom = Math.max(0, padding.bottom);
    const actualLeft = Math.max(0, padding.left);
    const handleInset = 6;

    function resolveCenterPosition(value: number) {
        return value > 0 ? value / 2 : handleInset;
    }

    function beginDrag(side: PaddingSide, event: React.PointerEvent<HTMLDivElement>) {
        if (!interactive || event.button !== 0) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        setDragState({
            side,
            startClientX: event.clientX,
            startClientY: event.clientY,
            initialValue: getSideValue(padding, side),
        });
    }

    function createPattern(fillOpacity: number) {
        return `repeating-linear-gradient(135deg, rgba(79, 124, 255, ${fillOpacity}) 0px, rgba(79, 124, 255, ${fillOpacity}) 6px, rgba(79, 124, 255, 0.06) 6px, rgba(79, 124, 255, 0.06) 12px)`;
    }

    function renderHandle(options: {
        side: PaddingSide;
        value: number;
        left?: number | string;
        right?: number | string;
        top?: number | string;
        bottom?: number | string;
        transform: string;
        cursor: "ew-resize" | "ns-resize";
    }) {
        return (
            <Box
                onPointerDown={(event) => beginDrag(options.side, event)}
                sx={{
                    position: "absolute",
                    left: options.left,
                    right: options.right,
                    top: options.top,
                    bottom: options.bottom,
                    transform: options.transform,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.55,
                    px: 0.7,
                    py: 0.4,
                    borderRadius: 999,
                    background: "rgba(20, 20, 28, 0.92)",
                    color: "rgba(235, 242, 255, 0.92)",
                    border: "1px solid rgba(79, 124, 255, 0.45)",
                    boxShadow: "0 8px 18px rgba(7, 11, 24, 0.28)",
                    cursor: interactive ? "grab" : "default",
                    pointerEvents: interactive ? "auto" : "none",
                    userSelect: "none",
                    zIndex: 4,
                    "&:active": {
                        cursor: interactive ? "grabbing" : "default",
                    },
                }}
            >
                <HugeiconsIcon icon={getHandleIcon(options.side)} size={16} strokeWidth={0} />
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, lineHeight: 1, letterSpacing: "0.04em" }}>
                    {formatSideLabel(options.side, options.value)}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
            {actualTop > 0 ? (
                <Box
                    sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: actualTop,
                        background: createPattern(0.22),
                        borderBottom: "1px solid rgba(79, 124, 255, 0.55)",
                        pointerEvents: "none",
                    }}
                />
            ) : null}

            {actualBottom > 0 ? (
                <Box
                    sx={{
                        position: "absolute",
                        left: 0,
                        bottom: 0,
                        width: "100%",
                        height: actualBottom,
                        background: createPattern(0.16),
                        borderTop: "1px solid rgba(79, 124, 255, 0.45)",
                        pointerEvents: "none",
                    }}
                />
            ) : null}

            {actualLeft > 0 ? (
                <Box
                    sx={{
                        position: "absolute",
                        left: 0,
                        top: actualTop,
                        bottom: actualBottom,
                        width: actualLeft,
                        background: createPattern(0.14),
                        borderRight: "1px solid rgba(79, 124, 255, 0.42)",
                        pointerEvents: "none",
                    }}
                />
            ) : null}

            {actualRight > 0 ? (
                <Box
                    sx={{
                        position: "absolute",
                        right: 0,
                        top: actualTop,
                        bottom: actualBottom,
                        width: actualRight,
                        background: createPattern(0.2),
                        borderLeft: "1px solid rgba(79, 124, 255, 0.5)",
                        pointerEvents: "none",
                    }}
                />
            ) : null}

            {renderHandle({
                side: "top",
                value: padding.top,
                left: "50%",
                top: resolveCenterPosition(actualTop),
                transform: "translateX(-50%)",
                cursor: "ns-resize",
            })}

            {renderHandle({
                side: "bottom",
                value: padding.bottom,
                left: "50%",
                bottom: resolveCenterPosition(actualBottom),
                transform: "translateX(-50%)",
                cursor: "ns-resize",
            })}

            {renderHandle({
                side: "left",
                value: padding.left,
                left: resolveCenterPosition(actualLeft),
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "ew-resize",
            })}

            {renderHandle({
                side: "right",
                value: padding.right,
                right: resolveCenterPosition(actualRight),
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "ew-resize",
            })}
        </Box>
    );
}