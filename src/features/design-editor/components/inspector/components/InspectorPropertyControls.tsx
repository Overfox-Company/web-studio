"use client";

import { Box, MenuItem, Stack, TextField } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { FieldLabel } from "@/src/features/design-editor/components/inspector/components/InspectorSectionControls";

export function PropertyChipInput({ value, onChange, placeholder, multiline = false }: { value: string; onChange: (nextValue: string) => void; placeholder?: string; multiline?: boolean }) {
    return (
        <TextField
            value={value}
            placeholder={placeholder}
            multiline={multiline}
            minRows={multiline ? 2 : undefined}
            onChange={(event) => {
                const nextValue = event.target.value;

                if (nextValue === value) {
                    return;
                }

                onChange(nextValue);
            }}
            sx={designEditorStyles.inspector.textField}
        />
    );
}

export function PropertySelectInput<T extends string | number>({
    value,
    onChange,
    label,
    options,
}: {
    value: T;
    onChange: (nextValue: T) => void;
    label?: string;
    options: Array<{ value: T; label: string; previewFontFamily?: string }>;
}) {
    return (
        <Stack spacing={0.32}>
            {label ? <FieldLabel label={label} /> : null}
            <Box sx={designEditorStyles.inspector.metricField}>
                <TextField
                    select
                    value={value}
                    onChange={(event) => {
                        const nextValue = options.find((option) => String(option.value) === event.target.value)?.value;

                        if (nextValue == null || nextValue === value) {
                            return;
                        }

                        onChange(nextValue);
                    }}
                    sx={designEditorStyles.inspector.metricInput}
                >
                    {options.map((option) => (
                        <MenuItem key={String(option.value)} value={String(option.value)} sx={option.previewFontFamily ? { fontFamily: option.previewFontFamily } : undefined}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>
        </Stack>
    );
}