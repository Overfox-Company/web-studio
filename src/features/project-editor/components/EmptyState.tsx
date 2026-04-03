"use client";

import { Stack, Typography } from "@mui/material";
import { AddCircleIcon } from "@hugeicons-pro/core-solid-standard";

import { projectEditorStyles } from "@/src/customization/project-editor";
import { ProjectIcon } from "@/src/features/project-editor/components/ui/ProjectIcon";

export function EmptyState() {
    return (
        <Stack
            spacing={1.2}
            alignItems="center"
            sx={projectEditorStyles.emptyState.wrapper}
        >
            <Stack alignItems="center" spacing={1.25} sx={projectEditorStyles.emptyState.card}>
                <ProjectIcon icon={AddCircleIcon} size={22} color={projectEditorStyles.emptyState.iconColor} />
                <Typography sx={projectEditorStyles.emptyState.title}>
                    Drag components here to start designing your project architecture
                </Typography>
            </Stack>
        </Stack>
    );
}
