"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Box } from "@mui/material";

import { projectEditorTokens } from "@/src/customization/project-editor";
import { sharedCustomization } from "@/src/customization/shared";

import { clamp, hsvaToCss, type HSVAColor } from "./ColorConversionUtils";

interface ColorField2DProps {
    color: HSVAColor;
    onPreviewChange: (nextColor: HSVAColor) => void;
    onCommit: (nextColor: HSVAColor) => void;
}

export function ColorField2D({ color, onPreviewChange, onCommit }: ColorField2DProps) {
    const areaRef = useRef<HTMLDivElement | null>(null);
    const colorRef = useRef(color);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        colorRef.current = color;
    }, [color]);

    const hueBackground = useMemo(() => hsvaToCss({ h: color.h, s: 100, v: 100, a: 1 }), [color.h]);

    useEffect(() => {
        if (!dragging) {
            return undefined;
        }

        function updateFromPoint(clientX: number, clientY: number, shouldCommit: boolean) {
            const area = areaRef.current;

            if (!area) {
                return;
            }

            const bounds = area.getBoundingClientRect();
            const saturation = clamp(((clientX - bounds.left) / bounds.width) * 100, 0, 100);
            const value = clamp((1 - (clientY - bounds.top) / bounds.height) * 100, 0, 100);
            const nextColor = {
                ...colorRef.current,
                s: roundCoordinate(saturation),
                v: roundCoordinate(value),
            };

            onPreviewChange(nextColor);

            if (shouldCommit) {
                onCommit(nextColor);
            }
        }

        function handlePointerMove(event: PointerEvent) {
            updateFromPoint(event.clientX, event.clientY, false);
        }

        function handlePointerUp(event: PointerEvent) {
            updateFromPoint(event.clientX, event.clientY, true);
            setDragging(false);
        }

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp, { once: true });

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [dragging, onCommit, onPreviewChange]);

    return (
        <Box
            ref={areaRef}
            role="slider"
            aria-label="Saturation and brightness"
            tabIndex={0}
            onPointerDown={(event) => {
                event.preventDefault();
                setDragging(true);
                const area = areaRef.current;

                if (!area) {
                    return;
                }

                const bounds = area.getBoundingClientRect();
                const saturation = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
                const value = clamp((1 - (event.clientY - bounds.top) / bounds.height) * 100, 0, 100);
                const nextColor = {
                    ...color,
                    s: roundCoordinate(saturation),
                    v: roundCoordinate(value),
                };

                onPreviewChange(nextColor);
            }}
            onKeyDown={(event) => {
                const step = event.shiftKey ? 10 : 2;

                if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
                    return;
                }

                event.preventDefault();
                const nextColor = {
                    ...color,
                    s: event.key === "ArrowLeft" ? clamp(color.s - step, 0, 100) : event.key === "ArrowRight" ? clamp(color.s + step, 0, 100) : color.s,
                    v: event.key === "ArrowDown" ? clamp(color.v - step, 0, 100) : event.key === "ArrowUp" ? clamp(color.v + step, 0, 100) : color.v,
                };

                onPreviewChange(nextColor);
                onCommit(nextColor);
            }}
            sx={{
                position: "relative",
                height: 194,
                borderRadius: sharedCustomization.radius.xl,
                overflow: "hidden",
                cursor: "crosshair",
                background: hueBackground,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0) 100%)",
                },
                "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(0deg, #000000 0%, rgba(0,0,0,0) 100%)",
                },
                "&:focus-visible": {
                    outline: `2px solid ${projectEditorTokens.layoutPrimaryAccent}`,
                    outlineOffset: 2,
                },
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    left: `calc(${color.s}% - 8px)`,
                    top: `calc(${100 - color.v}% - 8px)`,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.95)",
                    boxShadow: `0 0 0 1px ${projectEditorTokens.shellBackground}, 0 4px 16px rgba(0,0,0,0.35)`,
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            />
        </Box>
    );
}

function roundCoordinate(value: number) {
    return Math.round(value * 10) / 10;
}