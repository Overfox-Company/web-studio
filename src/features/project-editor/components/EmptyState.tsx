"use client";

import { Stack, Typography } from "@mui/material";
import { AddCircleIcon } from "@hugeicons-pro/core-solid-standard";

import { ProjectIcon } from "@/src/features/project-editor/components/ui/ProjectIcon";

export function EmptyState() {
    return (
        <Stack
            spacing={1.2}
            alignItems="center"
            sx={{
                pointerEvents: "none",
                position: "absolute",
                inset: 0,
                zIndex: 3,
                justifyContent: "center",
            }}
        >
            <Stack
                alignItems="center"
                spacing={1.25}
                sx={{
                    px: 3,
                    py: 2.5,
                    borderRadius: "4px",
                    border: "1px solid rgba(148, 163, 184, 0.24)",
                    background: "rgba(255,255,255,0.72)",
                    backdropFilter: "blur(12px)",
                }}
            >
                <ProjectIcon icon={AddCircleIcon} size={22} color="#4f7cff" />
                <Typography sx={{ fontSize: "0.94rem", fontWeight: 600, color: "#111827", letterSpacing: "-0.02em" }}>
                    Drag components here to start designing your project architecture
                </Typography>
            </Stack>
        </Stack>
    );
}
