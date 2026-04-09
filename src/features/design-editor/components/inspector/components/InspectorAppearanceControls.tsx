"use client";

import { Box, Stack } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { DesignColorControl } from "@/src/features/design-editor/components/DesignColorControl";
import { PropertyNumberInput } from "@/src/features/design-editor/components/inspector/components/InspectorInputControls";
import { FieldLabel } from "@/src/features/design-editor/components/inspector/components/InspectorSectionControls";

export function FillRowControl({ title, value, onChange, paletteColors }: { title: string; value: string; onChange: (nextValue: string) => void; paletteColors: string[] }) {
    return (
        <Stack spacing={0.4}>
            <FieldLabel label={title} />
            <DesignColorControl title={title} value={value} paletteColors={paletteColors} allowGradient onChange={onChange} />
        </Stack>
    );
}

export function StrokeRowControl({
    value,
    width,
    onColorChange,
    onWidthChange,
    paletteColors,
}: {
    value: string;
    width: number;
    onColorChange: (nextValue: string) => void;
    onWidthChange: (nextValue: number) => void;
    paletteColors: string[];
}) {
    return (
        <Box sx={designEditorStyles.inspector.twoColumnGridCompact}>
            <Stack spacing={0.4}>
                <FieldLabel label="Stroke" />
                <DesignColorControl title="Stroke" value={value} paletteColors={paletteColors} allowEmpty onChange={onColorChange} />
            </Stack>
            <PropertyNumberInput label="Weight" value={width} onChange={onWidthChange} min={0} />
        </Box>
    );
}