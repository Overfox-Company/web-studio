"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    pointerWithin,
    useSensor,
    useSensors,
    type DragCancelEvent,
    type DragEndEvent,
    type DragMoveEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import {
    PanelLeftCloseIcon,
    PanelLeftOpenIcon,
    PanelRightCloseIcon,
    PanelRightOpenIcon,
} from "@hugeicons-pro/core-solid-standard";
import { motion } from "framer-motion";
import { Box, Stack, Typography } from "@mui/material";
import { ReactFlowProvider } from "@xyflow/react";

import { ProjectIcon } from "@/src/features/project-editor/components/ui/ProjectIcon";
import { useProjectEditorRuntimeStore, useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";
import { EditorPanel, Shell, ToolbarButton } from "@/src/features/project-editor/components/ui/primitives";
import { CanvasArea, type CanvasApi } from "@/src/features/project-editor/components/CanvasArea";
import { EditorTopbar } from "@/src/features/project-editor/components/EditorTopbar";
import { InspectorPanel } from "@/src/features/project-editor/components/InspectorPanel";
import { NodePalette } from "@/src/features/project-editor/components/NodePalette";
import { useEditorPersistence } from "@/src/features/project-editor/hooks/use-editor-persistence";
import { useProjectEditorActions } from "@/src/features/project-editor/hooks/use-project-editor-actions";
import { NodeIcon } from "@/src/features/project-editor/nodes/base/NodeIcon";
import { NODE_VISUALS } from "@/src/features/project-editor/utils/node-colors";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

const DRAG_PREVIEW_POINTER_OFFSET = {
    x: 36,
    y: 24,
};

const LEFT_PANEL_WIDTH = {
    xs: "min(88vw, 304px)",
    lg: "250px",
} as const;

const RIGHT_PANEL_WIDTH = {
    xs: "min(90vw, 360px)",
    lg: "360px",
} as const;

function getClientPoint(event: Event | null | undefined) {
    if (!event) {
        return null;
    }

    if ("touches" in event) {
        const touchEvent = event as TouchEvent;

        if (touchEvent.touches.length > 0) {
            const touch = touchEvent.touches[0];
            return { x: touch.clientX, y: touch.clientY };
        }
    }

    if ("changedTouches" in event) {
        const touchEvent = event as TouchEvent;

        if (touchEvent.changedTouches.length > 0) {
            const touch = touchEvent.changedTouches[0];
            return { x: touch.clientX, y: touch.clientY };
        }
    }

    if ("clientX" in event && "clientY" in event) {
        const pointerEvent = event as MouseEvent | PointerEvent;
        return { x: pointerEvent.clientX, y: pointerEvent.clientY };
    }

    return null;
}

function DragPreview({ kind }: { kind: ProjectNodeKind }) {
    const token = NODE_VISUALS[kind];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ pointerEvents: "none" }}
        >
            <EditorPanel
                sx={{
                    p: 1.4,
                    borderRadius: "6px",
                    minWidth: 240,
                    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
                    pointerEvents: "none",
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.2}>
                    <NodeIcon kind={kind} />
                    <Stack spacing={0.35}>
                        <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827" }}>
                            {token.label}
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: "#667085" }}>
                            {token.description}
                        </Typography>
                    </Stack>
                </Stack>
            </EditorPanel>
        </motion.div>
    );
}

export function EditorLayout({ projectId, initialName }: { projectId: string; initialName: string }) {
    useEditorPersistence({ projectId, projectName: initialName });

    const selectedNodeId = useProjectEditorStore((state) => state.ui.selectedNodeId);
    const dragPreview = useProjectEditorRuntimeStore((state) => state.dragPreview);
    const dragPreviewKind = dragPreview?.node.kind ?? null;
    const isDragPreviewOverCanvas = dragPreview?.isOverCanvas ?? false;

    const deleteSelectedNode = useProjectEditorStore((state) => state.deleteSelectedNode);
    const startDragPreview = useProjectEditorStore((state) => state.startDragPreview);
    const updateDragPreview = useProjectEditorStore((state) => state.updateDragPreview);
    const clearDragPreview = useProjectEditorStore((state) => state.clearDragPreview);

    const { createNode, exportProject } = useProjectEditorActions();

    const [isPaletteOpen, setIsPaletteOpen] = useState(true);
    const [isInspectorOpen, setIsInspectorOpen] = useState(true);

    const canvasApiRef = useRef<CanvasApi | null>(null);
    const dragStartPointRef = useRef<{ x: number; y: number } | null>(null);
    const dragAnimationFrameRef = useRef<number | null>(null);
    const pendingPreviewUpdateRef = useRef<{
        position: { x: number; y: number } | null;
        isOverCanvas: boolean;
    } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 2,
            },
        }),
    );

    const registerCanvasApi = useCallback((api: CanvasApi) => {
        canvasApiRef.current = api;
    }, []);

    const flushPreviewUpdate = useCallback(() => {
        dragAnimationFrameRef.current = null;

        const pending = pendingPreviewUpdateRef.current;
        if (!pending) {
            return;
        }

        pendingPreviewUpdateRef.current = null;
        updateDragPreview(pending.position, pending.isOverCanvas);
    }, [updateDragPreview]);

    const schedulePreviewUpdate = useCallback(
        (position: { x: number; y: number } | null, isOverCanvas: boolean) => {
            pendingPreviewUpdateRef.current = { position, isOverCanvas };

            if (dragAnimationFrameRef.current !== null) {
                return;
            }

            dragAnimationFrameRef.current = window.requestAnimationFrame(flushPreviewUpdate);
        },
        [flushPreviewUpdate],
    );

    const cleanupDragSession = useCallback(() => {
        if (dragAnimationFrameRef.current !== null) {
            window.cancelAnimationFrame(dragAnimationFrameRef.current);
            dragAnimationFrameRef.current = null;
        }

        pendingPreviewUpdateRef.current = null;
        dragStartPointRef.current = null;
        clearDragPreview();
    }, [clearDragPreview]);

    const getCurrentClientPointFromDelta = useCallback((delta: { x: number; y: number }) => {
        const dragStartPoint = dragStartPointRef.current;

        if (!dragStartPoint) {
            return null;
        }

        return {
            x: dragStartPoint.x + delta.x,
            y: dragStartPoint.y + delta.y,
        };
    }, []);

    const isPointOverCanvas = useCallback((point: { x: number; y: number } | null) => {
        const canvasApi = canvasApiRef.current;

        if (!canvasApi) {
            return false;
        }

        return canvasApi.containsClientPoint(point);
    }, []);

    const resolveFlowPositionFromClientPoint = useCallback((point: { x: number; y: number } | null) => {
        const canvasApi = canvasApiRef.current;

        if (!canvasApi || !point) {
            return null;
        }

        return canvasApi.screenToFlowPosition({
            x: point.x - DRAG_PREVIEW_POINTER_OFFSET.x,
            y: point.y - DRAG_PREVIEW_POINTER_OFFSET.y,
        });
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null;
            const isEditable = target?.matches("input, textarea, [contenteditable='true']");

            if (isEditable) {
                return;
            }

            if (event.key === "Backspace" || event.key === "Delete") {
                deleteSelectedNode();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [deleteSelectedNode]);

    useEffect(() => {
        return () => {
            if (dragAnimationFrameRef.current !== null) {
                window.cancelAnimationFrame(dragAnimationFrameRef.current);
            }
        };
    }, []);

    function handleDragStart(event: DragStartEvent) {
        if (event.active.data.current?.source !== "palette") {
            return;
        }

        const nextKind = event.active.data.current?.kind as ProjectNodeKind | undefined;
        const dragStartPoint = getClientPoint(event.activatorEvent);

        dragStartPointRef.current = dragStartPoint;

        if (!nextKind || !dragStartPoint) {
            cleanupDragSession();
            return;
        }

        startDragPreview(nextKind);
    }

    function handleDragMove(event: DragMoveEvent) {
        if (event.active.data.current?.source !== "palette") {
            return;
        }

        const clientPoint = getCurrentClientPointFromDelta(event.delta);
        const isOverCanvas = isPointOverCanvas(clientPoint);

        if (!isOverCanvas) {
            schedulePreviewUpdate(null, false);
            return;
        }

        const position = resolveFlowPositionFromClientPoint(clientPoint);
        schedulePreviewUpdate(position, Boolean(position));
    }

    function handleDragEnd(event: DragEndEvent) {
        if (event.active.data.current?.source !== "palette") {
            cleanupDragSession();
            return;
        }

        const kind = (dragPreview?.node.kind ?? event.active.data.current?.kind) as ProjectNodeKind | undefined;
        const clientPoint = getCurrentClientPointFromDelta(event.delta);
        const isOverCanvas = event.over?.id === "project-editor-canvas" || isPointOverCanvas(clientPoint);
        const position = resolveFlowPositionFromClientPoint(clientPoint);

        if (kind && isOverCanvas && position) {
            createNode(kind, position);
        }

        cleanupDragSession();
    }

    function handleDragCancel(event: DragCancelEvent) {
        if (event.active.data.current?.source !== "palette") {
            return;
        }

        cleanupDragSession();
    }

    return (
        <Shell>
            <ReactFlowProvider>
                <DndContext
                    sensors={sensors}
                    collisionDetection={pointerWithin}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateRows: "auto minmax(0, 1fr)" }}>
                        <EditorTopbar projectId={projectId} onBuild={exportProject} onFitView={() => canvasApiRef.current?.fitView()} />

                        <Box
                            sx={{
                                position: "relative",
                                minHeight: 0,

                                overflow: "hidden",
                            }}
                        >
                            <Box sx={{ minHeight: 0, height: "100%" }}>
                                <CanvasArea registerCanvasApi={registerCanvasApi} />
                            </Box>

                            <Box
                                sx={{
                                    position: "absolute",
                                    top: { xs: 16, lg: 24 },
                                    left: { xs: 16, lg: 24 },
                                    bottom: { xs: 16, lg: 24 },
                                    width: LEFT_PANEL_WIDTH,
                                    zIndex: 5,
                                    pointerEvents: "none",
                                }}
                            >
                                <Box
                                    sx={{
                                        height: "100%",
                                        transform: isPaletteOpen ? "translateX(0)" : "translateX(calc(-100% - 18px))",
                                        opacity: isPaletteOpen ? 1 : 0,
                                        transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease",
                                        pointerEvents: isPaletteOpen ? "auto" : "none",
                                    }}
                                >
                                    <NodePalette activeKind={dragPreviewKind} />
                                </Box>
                            </Box>

                            <ToolbarButton
                                variant="outlined"
                                onClick={() => setIsPaletteOpen((open) => !open)}
                                sx={{
                                    position: "absolute",
                                    top: { xs: 28, lg: 36 },
                                    left: {
                                        xs: isPaletteOpen ? "calc(16px + min(88vw, 304px) - 18px)" : "16px",
                                        lg: isPaletteOpen ? "calc(24px + 296px - 106px)" : "24px",
                                    },
                                    minWidth: 40,
                                    width: 40,
                                    px: 0,
                                    zIndex: 6,
                                    borderRadius: "6px",
                                    background: "rgba(255,255,255,0.94)",
                                    //  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                                    transition: "left 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                                }}
                            >
                                <ProjectIcon icon={isPaletteOpen ? PanelLeftCloseIcon : PanelLeftOpenIcon} size={18} />
                            </ToolbarButton>

                            {selectedNodeId ? (
                                <>
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: { xs: 16, lg: 24 },
                                            right: { xs: 16, lg: 24 },
                                            bottom: { xs: 16, lg: 24 },
                                            width: RIGHT_PANEL_WIDTH,
                                            zIndex: 5,
                                            pointerEvents: "none",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                height: "100%",
                                                transform: isInspectorOpen ? "translateX(0)" : "translateX(calc(100% + 18px))",
                                                opacity: isInspectorOpen ? 1 : 0,
                                                transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease",
                                                pointerEvents: isInspectorOpen ? "auto" : "none",
                                            }}
                                        >
                                            <Box sx={{ minHeight: 0, height: "100%" }}>
                                                <InspectorPanel />
                                            </Box>
                                        </Box>
                                    </Box>

                                    <ToolbarButton
                                        variant="outlined"
                                        onClick={() => setIsInspectorOpen((open) => !open)}
                                        sx={{
                                            position: "absolute",
                                            top: { xs: 28, lg: 36 },
                                            right: {
                                                xs: isInspectorOpen ? "calc(16px + min(90vw, 360px) - 18px)" : "16px",
                                                lg: isInspectorOpen ? "calc(24px + 360px - 54px)" : "24px",
                                            },
                                            minWidth: 40,
                                            width: 40,
                                            px: 0,
                                            zIndex: 6,
                                            borderRadius: "6px",
                                            background: "rgba(255,255,255,0.94)",
                                            //   boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                                            transition: "right 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                                        }}
                                    >
                                        <ProjectIcon icon={isInspectorOpen ? PanelRightCloseIcon : PanelRightOpenIcon} size={18} />
                                    </ToolbarButton>
                                </>
                            ) : null}
                        </Box>
                    </Box>

                    <DragOverlay
                        dropAnimation={{
                            duration: 220,
                            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                    >
                        {dragPreviewKind && !isDragPreviewOverCanvas ? <DragPreview kind={dragPreviewKind} /> : null}
                    </DragOverlay>
                </DndContext>
            </ReactFlowProvider>
        </Shell>
    );
}