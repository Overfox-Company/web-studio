"use client";

import { useState } from "react";

import { Box, ButtonBase, Collapse, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { SegmentedIconControl } from "@/src/features/design-editor/components/inspector/components/InspectorChoiceControls";
import { DraggableNumberField, NullablePropertyNumberInput } from "@/src/features/design-editor/components/inspector/components/InspectorInputControls";
import type { DesignSizeMode } from "@/src/features/design-editor/types/design.types";

export function SizeConstraintControl({
    label,
    mode,
    value,
    minValue,
    maxValue,
    allowFill = true,
    allowHug = false,
    onModeChange,
    onValueChange,
    onMinChange,
    onMaxChange,
}: {
    label: string;
    mode: DesignSizeMode;
    value: number;
    minValue: number | null;
    maxValue: number | null;
    allowFill?: boolean;
    allowHug?: boolean;
    onModeChange: (nextValue: DesignSizeMode) => void;
    onValueChange: (nextValue: number) => void;
    onMinChange: (nextValue: number | null) => void;
    onMaxChange: (nextValue: number | null) => void;
}) {
    const [showAdvanced, setShowAdvanced] = useState(Boolean(minValue != null || maxValue != null));
    const options: Array<{ value: DesignSizeMode; label: string }> = [{ value: "fixed", label: "Fixed" }];

    if (allowFill) {
        options.push({ value: "fill", label: "Fill" });
    }

    if (allowHug) {
        options.push({ value: "hug", label: "Hug" });
    }

    return (
        <Stack spacing={0.45}>
            <Box sx={{ display: "grid", gridTemplateColumns: "20px minmax(0, 1fr) minmax(88px, auto)", gap: 0.5, alignItems: "center" }}>
                <Typography sx={designEditorStyles.inspector.gridFieldLabel}>{label}</Typography>

                <DraggableNumberField
                    value={value}
                    disabled={mode !== "fixed"}
                    min={1}
                    onChange={(nextValue) => {
                        if (nextValue == null || nextValue === value) {
                            return;
                        }

                        onValueChange(nextValue);
                    }}
                />

                <SegmentedIconControl dense value={mode} onChange={onModeChange} options={options} />
            </Box>

            <ButtonBase onClick={() => setShowAdvanced((current) => !current)} sx={designEditorStyles.inspector.sectionDisclosure}>
                <Typography sx={designEditorStyles.inspector.sectionDisclosureLabel}>Advanced sizing</Typography>
                <Typography sx={designEditorStyles.inspector.sectionDisclosureValue}>{showAdvanced ? "Hide" : "Show"}</Typography>
            </ButtonBase>

            <Collapse in={showAdvanced}>
                <Box sx={designEditorStyles.inspector.metricGrid2}>
                    <NullablePropertyNumberInput label="Min" value={minValue} onChange={onMinChange} min={0} placeholder="-" />
                    <NullablePropertyNumberInput label="Max" value={maxValue} onChange={onMaxChange} min={0} placeholder="-" />
                </Box>
            </Collapse>
        </Stack>
    );
}