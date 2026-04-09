"use client";

import { useEffect, useState } from "react";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { HorizonalScrollPointIcon } from "@hugeicons-pro/core-solid-standard";
import { Box, ButtonBase, Stack, TextField, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { FieldLabel } from "@/src/features/design-editor/components/inspector/components/InspectorSectionControls";

const DRAG_SENSITIVITY_PX = 4;

function clampNumericValue(nextValue: number, min?: number) {
    return min == null ? nextValue : Math.max(min, nextValue);
}

export function DraggableNumberField({
    value,
    onChange,
    disabled = false,
    min,
    unit,
    dragIcon = HorizonalScrollPointIcon,
    placeholder,
}: {
    value: number | null;
    onChange: (nextValue: number | null) => void;
    disabled?: boolean;
    min?: number;
    unit?: string;
    dragIcon?: IconSvgElement;
    placeholder?: string;
}) {
    const [dragState, setDragState] = useState<{
        startClientX: number;
        initialValue: number;
    } | null>(null);

    useEffect(() => {
        if (!dragState) {
            return;
        }

        const currentDragState = dragState;

        function handlePointerMove(event: PointerEvent) {
            const deltaSteps = Math.trunc((event.clientX - currentDragState.startClientX) / DRAG_SENSITIVITY_PX);
            const nextValue = clampNumericValue(currentDragState.initialValue + deltaSteps, min);

            if (nextValue !== value) {
                onChange(nextValue);
            }
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
    }, [dragState, min, onChange, value]);

    function beginDrag(event: React.PointerEvent<HTMLButtonElement>) {
        if (disabled) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        setDragState({
            startClientX: event.clientX,
            initialValue: value ?? 0,
        });
    }

    return (
        <Box sx={designEditorStyles.inspector.metricField}>
            <ButtonBase
                onPointerDown={beginDrag}
                disabled={disabled}
                sx={{
                    ...designEditorStyles.inspector.metricIcon,
                    cursor: disabled ? "default" : "ew-resize",
                    touchAction: "none",
                    pointerEvents: disabled ? "none" : "auto",
                    userSelect: "none",
                }}
            >
                <HugeiconsIcon icon={dragIcon} size={12} strokeWidth={0} />
            </ButtonBase>

            <TextField
                type="number"
                value={value ?? ""}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(event) => {
                    if (event.target.value === "") {
                        onChange(null);
                        return;
                    }

                    const nextValue = Number(event.target.value);

                    if (Number.isNaN(nextValue) || nextValue === value) {
                        return;
                    }

                    onChange(clampNumericValue(nextValue, min));
                }}
                sx={designEditorStyles.inspector.metricInput}
            />

            {unit ? <Typography sx={designEditorStyles.inspector.metricUnit}>{unit}</Typography> : null}
        </Box>
    );
}

export function PropertyNumberInput({
    value,
    onChange,
    label,
    unit,
    min,
    disabled = false,
    dragIcon,
}: {
    value: number;
    onChange: (nextValue: number) => void;
    label?: string;
    unit?: string;
    min?: number;
    disabled?: boolean;
    dragIcon?: IconSvgElement;
}) {
    return (
        <Stack spacing={0.32}>
            {label ? <FieldLabel label={label} /> : null}
            <DraggableNumberField
                value={value}
                disabled={disabled}
                min={min}
                unit={unit}
                dragIcon={dragIcon}
                onChange={(nextValue) => {
                    if (nextValue == null || nextValue === value) {
                        return;
                    }

                    onChange(nextValue);
                }}
            />
        </Stack>
    );
}

export function NullablePropertyNumberInput({
    value,
    onChange,
    label,
    min,
    placeholder,
}: {
    value: number | null;
    onChange: (nextValue: number | null) => void;
    label?: string;
    min?: number;
    placeholder?: string;
}) {
    return (
        <Stack spacing={0.32}>
            {label ? <FieldLabel label={label} /> : null}
            <DraggableNumberField value={value} onChange={onChange} min={min} placeholder={placeholder} />
        </Stack>
    );
}