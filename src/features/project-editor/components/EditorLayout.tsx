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

import { projectEditorStyles } from "@/src/customization/project-editor";
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
import { useProjectCompile } from "@/src/features/project-compile/use-project-compile";
import { NODE_VISUALS } from "@/src/features/project-editor/utils/node-colors";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";
import { useLockBodyScroll } from "@/src/lib/hooks/use-lock-body-scroll";

const DRAG_PREVIEW_POINTER_OFFSET = {
    x: 36,
    y: 24,
};

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
            style={projectEditorStyles.dragPreview.wrapper}
        >
            <EditorPanel sx={projectEditorStyles.dragPreview.panel}>
                <Stack direction="row" alignItems="center" spacing={1.2}>
                    <NodeIcon kind={kind} />
                    <Stack spacing={0.35}>
                        <Typography sx={projectEditorStyles.dragPreview.title}>
                            {token.label}
                        </Typography>
                        <Typography sx={projectEditorStyles.dragPreview.description}>
                            {token.description}
                        </Typography>
                    </Stack>
                </Stack>
            </EditorPanel>
        </motion.div>
    );
}

export function EditorLayout({ projectId, initialName }: { projectId: string; initialName: string }) {
    useLockBodyScroll();

    useEditorPersistence({ projectId, projectName: initialName });

    const selectedNodeId = useProjectEditorStore((state) => state.ui.selectedNodeId);
    const dragPreview = useProjectEditorRuntimeStore((state) => state.dragPreview);
    const dragPreviewKind = dragPreview?.node.kind ?? null;
    const activePaletteKind = dragPreviewKind === "view" ? "page" : dragPreviewKind;
    const isDragPreviewOverCanvas = dragPreview?.isOverCanvas ?? false;

    const deleteSelectedNode = useProjectEditorStore((state) => state.deleteSelectedNode);
    const startDragPreview = useProjectEditorStore((state) => state.startDragPreview);
    const updateDragPreview = useProjectEditorStore((state) => state.updateDragPreview);
    const clearDragPreview = useProjectEditorStore((state) => state.clearDragPreview);

    const project = useProjectEditorStore((state) => state.project);
    const { createNode } = useProjectEditorActions();
    const { compileState, compileMessage, runCompile } = useProjectCompile({
        getProjectSnapshot: () => project,
    });

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
                    <Box sx={projectEditorStyles.layout.root}>
                        <EditorTopbar onCompile={runCompile} onFitView={() => canvasApiRef.current?.fitView()} compileState={compileState} compileMessage={compileMessage} />

                        <Box sx={projectEditorStyles.layout.stage}>
                            <Box sx={projectEditorStyles.layout.canvasFill}>
                                <CanvasArea registerCanvasApi={registerCanvasApi} />
                            </Box>

                            <Box sx={projectEditorStyles.layout.dock("left")}>
                                <Box sx={projectEditorStyles.layout.dockPanel(isPaletteOpen, "left")}>
                                    <NodePalette activeKind={activePaletteKind} />
                                </Box>
                            </Box>

                            <ToolbarButton
                                variant="outlined"
                                onClick={() => setIsPaletteOpen((open) => !open)}
                                sx={projectEditorStyles.layout.paletteToggle(isPaletteOpen)}
                            >
                                <ProjectIcon icon={isPaletteOpen ? PanelLeftCloseIcon : PanelLeftOpenIcon} size={18} />
                            </ToolbarButton>

                            {selectedNodeId ? (
                                <>
                                    <Box sx={projectEditorStyles.layout.dock("right")}>
                                        <Box sx={projectEditorStyles.layout.dockPanel(isInspectorOpen, "right")}>
                                            <Box sx={projectEditorStyles.layout.canvasFill}>
                                                <InspectorPanel />
                                            </Box>
                                        </Box>
                                    </Box>

                                    <ToolbarButton
                                        variant="outlined"
                                        onClick={() => setIsInspectorOpen((open) => !open)}
                                        sx={projectEditorStyles.layout.inspectorToggle(isInspectorOpen)}
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
                        {activePaletteKind && !isDragPreviewOverCanvas ? <DragPreview kind={activePaletteKind} /> : null}
                    </DragOverlay>
                </DndContext>
            </ReactFlowProvider>
        </Shell>
    );
}