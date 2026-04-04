"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, DragDropHorizontalIcon } from "@hugeicons-pro/core-solid-standard";
import { Box, Divider, IconButton, Popover, Stack, Typography } from "@mui/material";

import { sharedCustomization } from "@/src/customization/shared";

import { AlphaSlider } from "./AlphaSlider";
import { ColorField2D } from "./ColorField2D";
import { ColorModeTabs } from "./ColorModeTabs";
import {
    copyValueForColor,
    detectColorMode,
    formatValueForInput,
    hsvaToCss,
    parseCssColor,
    type ColorFormat,
    type ColorMode,
    type HSVAColor,
} from "./ColorConversionUtils";
import { ColorValueRow } from "./ColorValueRow";
import { CopyAction } from "./CopyAction";
import { EyedropperButton } from "./EyedropperButton";
import { HueSlider } from "./HueSlider";
import { PaletteSection } from "./PaletteSection";

interface ColorPickerPopoverProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    title: string;
    value: string;
    paletteColors: string[];
    allowGradient?: boolean;
    allowEmpty?: boolean;
    manualPalette: string[];
    onManualPaletteChange: (colors: string[]) => void;
    onChange: (nextValue: string) => void;
    onClose: () => void;
}

export function ColorPickerPopover({
    anchorEl,
    open,
    title,
    value,
    paletteColors,
    allowGradient = false,
    allowEmpty = false,
    manualPalette,
    onManualPaletteChange,
    onChange,
    onClose,
}: ColorPickerPopoverProps) {
    const [mode, setMode] = useState<ColorMode>("solid");
    const [format, setFormat] = useState<ColorFormat>("hex");
    const [draftColor, setDraftColor] = useState<HSVAColor>(() => parseCssColor(value));
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const [dragging, setDragging] = useState(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!open) {
            return;
        }

        setMode(detectColorMode(value, allowGradient));
        setDraftColor(parseCssColor(value));
    }, [allowGradient, open, value]);

    useEffect(() => {
        if (!open || !anchorEl) {
            return;
        }

        const rect = anchorEl.getBoundingClientRect();
        setPosition(clampPopoverPosition({
            top: rect.bottom + 10,
            left: rect.left,
        }));
    }, [anchorEl, open]);

    useEffect(() => {
        if (!dragging) {
            return undefined;
        }

        function handlePointerMove(event: PointerEvent) {
            setPosition(clampPopoverPosition({
                left: event.clientX - dragOffsetRef.current.x,
                top: event.clientY - dragOffsetRef.current.y,
            }));
        }

        function handlePointerUp() {
            setDragging(false);
        }

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp, { once: true });

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [dragging]);

    const currentCssValue = useMemo(() => hsvaToCss(draftColor), [draftColor]);
    const copyValue = useMemo(() => copyValueForColor(draftColor), [draftColor]);
    const mergedPalette = useMemo(() => {
        const collection = [...paletteColors, ...manualPalette];
        return collection;
    }, [manualPalette, paletteColors]);

    function commit(nextColor: HSVAColor) {
        setDraftColor(nextColor);
        onChange(hsvaToCss(nextColor));
    }

    function handleClose() {
        if (allowEmpty && !value) {
            onClose();
            return;
        }

        if (formatValueForInput(draftColor, format)) {
            onChange(hsvaToCss(draftColor));
        }

        onClose();
    }

    return (
        <Popover
            open={open}
            anchorReference="anchorPosition"
            anchorPosition={position ?? { top: 24, left: 24 }}
            onClose={handleClose}
            disableRestoreFocus
            slotProps={{
                paper: {
                    sx: {
                        background: "transparent",
                        boxShadow: "none",
                        overflow: "visible",
                        margin: 0,
                    },
                },
            }}
        >
            <Stack
                spacing={1}
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        event.preventDefault();
                        handleClose();
                    }
                }}
                sx={{
                    width: 352,
                    p: 1.1,
                    borderRadius: sharedCustomization.radius.xxxl,
                    background: "rgba(16, 16, 20, 0.98)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 24px 72px rgba(0,0,0,0.45)",
                    backdropFilter: "blur(28px)",
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontSize: "0.98rem", fontWeight: 700, color: sharedCustomization.text.primary }}>
                        {title}
                    </Typography>

                    <Stack direction="row" spacing={0.35} alignItems="center">
                        <IconButton
                            aria-label="Drag color picker"
                            size="small"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                const nextPosition = position ?? { top: event.clientY, left: event.clientX };
                                dragOffsetRef.current = {
                                    x: event.clientX - nextPosition.left,
                                    y: event.clientY - nextPosition.top,
                                };
                                setDragging(true);
                            }}
                            sx={{
                                color: dragging ? sharedCustomization.text.primary : sharedCustomization.text.secondary,
                                cursor: dragging ? "grabbing" : "grab",
                            }}
                        >
                            <HugeiconsIcon icon={DragDropHorizontalIcon} size={18} strokeWidth={0} />
                        </IconButton>

                        <IconButton aria-label="Close color picker" size="small" onClick={handleClose} sx={{ color: sharedCustomization.text.secondary }}>
                            <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={0} />
                        </IconButton>
                    </Stack>
                </Stack>

                <ColorModeTabs mode={mode} onChange={setMode} />

                {mode === "solid" ? (
                    <>
                        <ColorField2D color={draftColor} onPreviewChange={setDraftColor} onCommit={commit} />
                        <ColorValueRow color={draftColor} format={format} onFormatChange={setFormat} onCommit={commit} />

                        <Stack direction="row" spacing={0.8} alignItems="stretch">
                            <Box sx={{ flex: 1 }}>
                                <HueSlider
                                    value={draftColor.h}
                                    onPreviewChange={(nextHue) => setDraftColor((current) => ({ ...current, h: nextHue }))}
                                    onCommit={(nextHue) => commit({ ...draftColor, h: nextHue })}
                                />
                            </Box>
                            <EyedropperButton onPick={commit} />
                        </Stack>

                        <AlphaSlider
                            color={draftColor}
                            onPreviewChange={(nextAlpha) => setDraftColor((current) => ({ ...current, a: nextAlpha }))}
                            onCommit={(nextAlpha) => commit({ ...draftColor, a: nextAlpha })}
                        />
                    </>
                ) : (
                    <Box
                        sx={{
                            minHeight: 120,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: sharedCustomization.radius.xl,
                            background: "rgba(255,255,255,0.04)",
                            color: sharedCustomization.text.secondary,
                            textAlign: "center",
                            px: 2,
                        }}
                    >
                        {mode === "linear-gradient"
                            ? "Linear gradient UI is staged next and the structure is already in place."
                            : "This mode is visible now so the picker can grow without redesigning the shell later."}
                    </Box>
                )}

                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

                <PaletteSection
                    colors={mergedPalette}
                    onApply={(nextColor) => commit(parseCssColor(nextColor, draftColor))}
                    onAddCurrent={() => {
                        const nextValue = currentCssValue;

                        if (manualPalette.some((color) => color.toLowerCase() === nextValue.toLowerCase())) {
                            return;
                        }

                        onManualPaletteChange([...manualPalette, nextValue]);
                    }}
                />

                <CopyAction value={copyValue} />
            </Stack>
        </Popover>
    );
}

const PICKER_WIDTH = 352;
const PICKER_HEIGHT = 560;
const VIEWPORT_MARGIN = 16;

function clampPopoverPosition(position: { top: number; left: number }) {
    if (typeof window === "undefined") {
        return position;
    }

    return {
        left: Math.min(Math.max(position.left, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, window.innerWidth - PICKER_WIDTH - VIEWPORT_MARGIN)),
        top: Math.min(Math.max(position.top, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, window.innerHeight - PICKER_HEIGHT - VIEWPORT_MARGIN)),
    };
}