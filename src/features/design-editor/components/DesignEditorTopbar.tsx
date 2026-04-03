"use client";

import { useMemo } from "react";

import { ModernTvIcon, SmartPhone01Icon } from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import type { DesignTool } from "@/src/features/design-editor/types/interaction.types";
import type { PageViewportMode } from "@/src/features/project-editor/types/editor.types";

interface DesignEditorTopbarProps {
    projectId: string;
    viewId: string;
    viewName: string;
    saveState: "saved" | "saving" | "error";
    compileState: "idle" | "compiling" | "success" | "error";
    compileMessage: string | null;
    onCompile: () => void;
    viewportMode: PageViewportMode;
    onViewportModeChange: (mode: PageViewportMode) => void;
}

const VIEWPORT_ITEMS: Array<{ mode: PageViewportMode; label: string; icon: typeof ModernTvIcon }> = [
    { mode: "desktop", label: "Desktop", icon: ModernTvIcon },
    { mode: "mobile", label: "Mobile", icon: SmartPhone01Icon },
];

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

function getCompileLabel(compileState: DesignEditorTopbarProps["compileState"]) {
    switch (compileState) {
        case "compiling":
            return "Compiling...";
        case "success":
            return "Compile ready";
        case "error":
            return "Retry compile";
        default:
            return "Compile";
    }
}

function getPreviewWindowName(projectId: string, viewId: string) {
    return `webstudio-preview-${projectId}-${viewId}`;
}

function getPreviewRoute(projectId: string, viewId: string) {
    return `/projects/${projectId}/editor/view/${viewId}/preview`;
}

export function DesignEditorTopbar({ projectId, viewId, viewName, saveState, compileState, compileMessage, onCompile, viewportMode, onViewportModeChange }: DesignEditorTopbarProps) {
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

    function handleOpenPreview() {
        const previewWindow = window.open(getPreviewRoute(projectId, viewId), getPreviewWindowName(projectId, viewId));
        previewWindow?.focus();
    }

    return (
        <Box sx={designEditorStyles.topbar.root}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={designEditorStyles.topbar.leftGroup}>
                <Button
                    variant="outlined"
                    onClick={() => router.push(`/projects/${projectId}/editor`)}
                    sx={designEditorStyles.topbar.chromeButton}
                >
                    Back
                </Button>

                <Stack spacing={0.25} sx={designEditorStyles.topbar.meta}>
                    <Typography sx={designEditorStyles.topbar.eyebrow}>
                        Design Editor
                    </Typography>
                    <Typography sx={designEditorStyles.topbar.title}>
                        {viewName}
                    </Typography>
                </Stack>

                <Box sx={designEditorStyles.topbar.status(saveState)}>
                    {getStatusLabel(saveState)}
                </Box>

                {compileMessage ? (
                    <Box sx={designEditorStyles.topbar.status(compileState === "error" ? "error" : "saved")}>
                        {compileMessage}
                    </Box>
                ) : null}

                <Button
                    variant="outlined"
                    onClick={handleOpenPreview}
                    sx={designEditorStyles.topbar.chromeButton}
                >
                    Preview
                </Button>

                <Button
                    variant="outlined"
                    onClick={onCompile}
                    disabled={compileState === "compiling"}
                    sx={designEditorStyles.topbar.chromeButton}
                >
                    {getCompileLabel(compileState)}
                </Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={designEditorStyles.topbar.rightGroup}>
                <Stack direction="row" spacing={0.5} sx={designEditorStyles.topbar.viewportGroup}>
                    {VIEWPORT_ITEMS.map((item) => {
                        const isActive = viewportMode === item.mode;

                        return (
                            <Button
                                key={item.mode}
                                variant={isActive ? "contained" : "text"}
                                onClick={() => onViewportModeChange(item.mode)}
                                sx={designEditorStyles.topbar.viewportButton(isActive)}
                            >
                                <HugeiconsIcon icon={item.icon} size={24} strokeWidth={1.5} />
                                <Typography sx={designEditorStyles.topbar.viewportButtonLabel}>{item.label}</Typography>
                            </Button>
                        );
                    })}
                </Stack>

                <Divider orientation="vertical" flexItem sx={designEditorStyles.topbar.divider} />

                <Stack direction="row" spacing={0.75} sx={designEditorStyles.topbar.toolGroup}>
                    {TOOLBAR_ITEMS.map((item) => {
                        const isActive = activeTool === item.tool;

                        return (
                            <Button
                                key={item.tool}
                                variant={isActive ? "contained" : "text"}
                                onClick={() => setActiveTool(item.tool)}
                                sx={designEditorStyles.topbar.toolButton(isActive)}
                            >
                                <Typography sx={designEditorStyles.topbar.toolLabel}>{item.label}</Typography>
                                <Typography sx={designEditorStyles.topbar.toolShortcut(isActive)}>{item.shortcut}</Typography>
                            </Button>
                        );
                    })}
                </Stack>

                <Divider orientation="vertical" flexItem sx={designEditorStyles.topbar.divider} />

                <Stack direction="row" spacing={0.75} alignItems="center">
                    <Button
                        variant="text"
                        onClick={() => updateZoom(viewport.zoom - 0.1)}
                        sx={designEditorStyles.topbar.zoomStepButton}
                    >
                        -
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setViewport({ x: 120, y: 96, zoom: 0.9 })}
                        sx={designEditorStyles.topbar.zoomDisplayButton}
                    >
                        {zoomLabel}
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => updateZoom(viewport.zoom + 0.1)}
                        sx={designEditorStyles.topbar.zoomStepButton}
                    >
                        +
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}