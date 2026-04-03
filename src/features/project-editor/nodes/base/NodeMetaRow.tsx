"use client";

import { Stack, Typography } from "@mui/material";

import { projectEditorStyles } from "@/src/customization/project-editor";

export function NodeMetaRow({ label, value }: { label: string; value: string }) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography sx={projectEditorStyles.nodeMetaRow.label}>
                {label}
            </Typography>
            <Typography sx={projectEditorStyles.nodeMetaRow.value}>
                {value}
            </Typography>
        </Stack>
    );
}
