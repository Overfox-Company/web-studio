"use client";

import { useMemo } from "react";

import {
    AiViewIcon,
    ArrowLeft01Icon,
    CodeIcon,
    Cursor01Icon,
    ImageAdd02Icon,
    LayoutTwoRowIcon,
    MinusSignIcon,
    MoveIcon,
    PaintBoardIcon,
    PlusSignIcon,
    SmartPhone01Icon,
    TextCreationIcon,
    ModernTvIcon,
} from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document.store";
import type { DesignTool } from "@/src/features/design-editor/types/interaction.types";
import { createRootViewportFrameOverride } from "@/src/features/design-editor/utils/page-viewport";
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

const TOOLBAR_ITEMS: Array<{ tool: DesignTool; label: string; shortcut: string; icon: typeof Cursor01Icon }> = [
    { tool: "select", label: "Select", shortcut: "V", icon: Cursor01Icon },
    { tool: "frame", label: "Frame", shortcut: "F", icon: LayoutTwoRowIcon },
    { tool: "rectangle", label: "Rect", shortcut: "R", icon: PaintBoardIcon },
    { tool: "text", label: "Text", shortcut: "T", icon: TextCreationIcon },
    { tool: "image", label: "Image", shortcut: "I", icon: ImageAdd02Icon },
    { tool: "hand", label: "Hand", shortcut: "H", icon: MoveIcon },
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
    const designDocument = useDesignDocumentStore((state) => state.document);

    const viewport = useDesignInteractionStore((state) => state.viewport);
    const setViewport = useDesignInteractionStore((state) => state.setViewport);

    const zoomLabel = useMemo(() => `${Math.round(viewport.zoom * 100)}%`, [viewport.zoom]);
    const rootNode = useMemo(() => {
        if (!designDocument) {
            return null;
        }

        return designDocument.nodes[designDocument.rootNodeId] ?? null;
    }, [designDocument]);

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

    function handleResetViewport() {
        if (!rootNode) {
            setViewport({ x: 120, y: 96, zoom: 0.9 });
            return;
        }

        const canvasElement = window.document.getElementById("design-editor-canvas");
        const canvasRect = canvasElement?.getBoundingClientRect();
        const nextZoom = 0.9;
        const rootFrame = createRootViewportFrameOverride(
            {
                x: rootNode.x,
                y: rootNode.y,
                width: rootNode.width,
                height: rootNode.height,
                rotation: rootNode.rotation,
            },
            viewportMode,
        );

        if (!canvasRect) {
            setViewport({ x: 120, y: 96, zoom: nextZoom });
            return;
        }

        setViewport({
            x: (canvasRect.width - rootFrame.width * nextZoom) / 2,
            y: (canvasRect.height - rootFrame.height * nextZoom) / 2,
            zoom: nextZoom,
        });
    }

    return (
        <Box sx={designEditorStyles.topbar.root}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={designEditorStyles.topbar.leftGroup}>
                <Button
                    variant="outlined"
                    onClick={() => router.push(`/projects/${projectId}/editor`)}
                    sx={designEditorStyles.topbar.chromeButton}
                >
                    <Box sx={designEditorStyles.topbar.chromeButtonIcon}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={1.9} />
                    </Box>
                    <Typography sx={designEditorStyles.topbar.chromeButtonLabel}>Back</Typography>
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
                    <Box sx={designEditorStyles.topbar.chromeButtonIcon}>
                        <HugeiconsIcon icon={AiViewIcon} size={18} strokeWidth={1.8} />
                    </Box>
                    <Typography sx={designEditorStyles.topbar.chromeButtonLabel}>Preview</Typography>
                </Button>

                <Button
                    variant="outlined"
                    onClick={onCompile}
                    disabled={compileState === "compiling"}
                    sx={designEditorStyles.topbar.chromeButtonPrimary}
                >
                    <Box sx={designEditorStyles.topbar.chromeButtonIcon}>
                        <HugeiconsIcon icon={CodeIcon} size={18} strokeWidth={1.8} />
                    </Box>
                    <Typography sx={designEditorStyles.topbar.chromeButtonLabel}>{getCompileLabel(compileState)}</Typography>
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

                <Stack direction="row" spacing={0.75} alignItems="center">
                    <Button
                        variant="text"
                        onClick={() => updateZoom(viewport.zoom - 0.1)}
                        sx={designEditorStyles.topbar.zoomStepButton}
                    >
                        <HugeiconsIcon icon={MinusSignIcon} size={16} strokeWidth={2.2} />
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleResetViewport}
                        sx={designEditorStyles.topbar.zoomDisplayButton}
                    >
                        {zoomLabel}
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => updateZoom(viewport.zoom + 0.1)}
                        sx={designEditorStyles.topbar.zoomStepButton}
                    >
                        <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.2} />
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}

export function DesignEditorFloatingToolbar() {
    const activeTool = useDesignInteractionStore((state) => state.activeTool);
    const setActiveTool = useDesignInteractionStore((state) => state.setActiveTool);

    return (
        <Box sx={designEditorStyles.topbar.floatingToolDock}>
            <Stack direction="row" spacing={0.75} sx={designEditorStyles.topbar.floatingToolGroup}>
                {TOOLBAR_ITEMS.map((item) => {
                    const isActive = activeTool === item.tool;

                    return (
                        <Button
                            key={item.tool}
                            variant={isActive ? "contained" : "text"}
                            onClick={() => setActiveTool(item.tool)}
                            sx={designEditorStyles.topbar.toolButton(isActive)}
                        >
                            <Box sx={designEditorStyles.topbar.toolIcon(isActive)}>
                                <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.8} />
                            </Box>
                            <Typography sx={designEditorStyles.topbar.toolLabel}>{item.label}</Typography>
                            <Typography sx={designEditorStyles.topbar.toolShortcut(isActive)}>{item.shortcut}</Typography>
                        </Button>
                    );
                })}
            </Stack>
        </Box>
    );
}