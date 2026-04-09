"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Box, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";

export function InspectorSectionHeader({ title, icon, meta }: { title: string; icon: IconSvgElement; meta?: React.ReactNode }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={designEditorStyles.inspector.sectionHeader}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Box sx={designEditorStyles.inspector.sectionIconBadge}>
                    <HugeiconsIcon icon={icon} size={14} strokeWidth={0} />
                </Box>
                <Typography sx={designEditorStyles.inspector.sectionTitle}>{title}</Typography>
            </Stack>
            {meta}
        </Stack>
    );
}

export function InspectorSection({ title, icon, meta, children }: { title: string; icon: IconSvgElement; meta?: React.ReactNode; children: React.ReactNode }) {
    return (
        <Stack spacing={0.8} sx={designEditorStyles.inspector.section}>
            <InspectorSectionHeader title={title} icon={icon} meta={meta} />
            <Stack spacing={0.75}>{children}</Stack>
        </Stack>
    );
}

export function FieldLabel({ label }: { label: string }) {
    return <Typography sx={designEditorStyles.inspector.gridFieldLabel}>{label}</Typography>;
}