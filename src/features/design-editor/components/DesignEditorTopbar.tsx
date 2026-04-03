"use client";

import { useMemo } from "react";

import { useRouter } from "next/navigation";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";

import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import type { DesignTool } from "@/src/features/design-editor/types/interaction.types";

interface DesignEditorTopbarProps {
    projectId: string;
    viewName: string;
    saveState: "saved" | "saving" | "error";
}

const TOOLBAR_ITEMS: Array<{ tool: DesignTool; label: string; shortcut: string }> = [
    { tool: "select", label: "Select", shortcut: "V" },
    { tool: "frame", label: "Frame", shortcut: "F" },
    { tool: "rectangle", label: "Rect", shortcut: "R" },
    { tool: "text", label: "Text", shortcut: "T" },
    { tool: "image", label: "Image", shortcut: "I" },
    { tool: "hand", label: "Hand", shortcut: "H" },
];

function getStatusLabel(saveState: DesignEditorTopbarProps["saveState"]) {
    switch (saveState) {
        case "saving":
            return "Saving";
        case "error":
            return "Save error";
        default:
            return "Saved";
    }
}

export function DesignEditorTopbar({ projectId, viewName, saveState }: DesignEditorTopbarProps) {
    const router = useRouter();

    const activeTool = useDesignInteractionStore((state) => state.activeTool);
    const viewport = useDesignInteractionStore((state) => state.viewport);
    const setActiveTool = useDesignInteractionStore((state) => state.setActiveTool);
    const setViewport = useDesignInteractionStore((state) => state.setViewport);

    const zoomLabel = useMemo(() => `${Math.round(viewport.zoom * 100)}%`, [viewport.zoom]);

    function updateZoom(nextZoom: number) {
        const clampedZoom = Math.min(2.5, Math.max(0.25, nextZoom));

        setViewport({
            ...viewport,
            zoom: clampedZoom,
        });
    }

    return (
        <Box
            sx={{
                position: "sticky",
                top: 0,
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
                px: { xs: 2, lg: 3 },
                py: 1.5,
                borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
                background: "rgba(8, 12, 19, 0.86)",
                backdropFilter: "blur(24px)",
            }}
        >
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flexWrap: "wrap" }}>
                <Button
                    variant="outlined"
                    onClick={() => router.push(`/projects/${projectId}/editor`)}
                    sx={{
                        minWidth: 0,
                        px: 1.4,
                        color: "#e2e8f0",
                        borderColor: "rgba(148, 163, 184, 0.24)",
                        background: "rgba(15, 23, 42, 0.42)",
                    }}
                >
                    Back
                </Button>

                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
                        Design Editor
                    </Typography>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#f8fafc", letterSpacing: "-0.03em" }}>
                        {viewName}
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        px: 1.1,
                        py: 0.55,
                        borderRadius: "999px",
                        border: "1px solid rgba(148, 163, 184, 0.18)",
                        background: "rgba(15, 23, 42, 0.52)",
                        color: saveState === "error" ? "#fca5a5" : "#cbd5e1",
                        fontSize: "0.76rem",
                        fontWeight: 600,
                    }}
                >
                    {getStatusLabel(saveState)}
                </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{
                        p: 0.5,
                        borderRadius: "999px",
                        border: "1px solid rgba(148, 163, 184, 0.16)",
                        background: "rgba(15, 23, 42, 0.58)",
                    }}
                >
                    {TOOLBAR_ITEMS.map((item) => {
                        const isActive = activeTool === item.tool;

                        return (
                            <Button
                                key={item.tool}
                                variant={isActive ? "contained" : "text"}
                                onClick={() => setActiveTool(item.tool)}
                                sx={{
                                    minWidth: 0,
                                    gap: 0.8,
                                    px: 1.25,
                                    color: isActive ? "#020617" : "#cbd5e1",
                                    background: isActive ? "#e2e8f0" : "transparent",
                                    "&:hover": {
                                        background: isActive ? "#f8fafc" : "rgba(255, 255, 255, 0.06)",
                                    },
                                }}
                            >
                                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{item.label}</Typography>
                                <Typography sx={{ fontSize: "0.7rem", color: isActive ? "#334155" : "#64748b" }}>{item.shortcut}</Typography>
                            </Button>
                        );
                    })}
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(148, 163, 184, 0.16)", display: { xs: "none", sm: "block" } }} />

                <Stack direction="row" spacing={0.75} alignItems="center">
                    <Button
                        variant="text"
                        onClick={() => updateZoom(viewport.zoom - 0.1)}
                        sx={{ minWidth: 36, px: 0, color: "#cbd5e1" }}
                    >
                        -
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setViewport({ x: 120, y: 96, zoom: 0.9 })}
                        sx={{
                            minWidth: 84,
                            color: "#e2e8f0",
                            borderColor: "rgba(148, 163, 184, 0.22)",
                            background: "rgba(15, 23, 42, 0.48)",
                        }}
                    >
                        {zoomLabel}
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => updateZoom(viewport.zoom + 0.1)}
                        sx={{ minWidth: 36, px: 0, color: "#cbd5e1" }}
                    >
                        +
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}