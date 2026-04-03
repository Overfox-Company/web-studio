"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Box, Typography } from "@mui/material";

import { designEditorStyles, getDesignResizeHandleStyle } from "@/src/customization/design-editor";
import { DesignDocumentRenderer } from "@/src/features/design-editor/components/DesignDocumentRenderer";
import { pasteFromClipboard } from "@/src/features/design-editor/import/paste-from-clipboard";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document.store";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import { createRootViewportFrameOverride } from "@/src/features/design-editor/utils/page-viewport";
import type { DesignNode } from "@/src/features/design-editor/types/design.types";
import {
    DESIGN_RESIZE_HANDLES,
    type CreateInteractionSession,
    type DesignFrame,
    type DesignPoint,
    type DesignResizeHandle,
    type DesignTool,
} from "@/src/features/design-editor/types/interaction.types";
import { computeAlignmentGuides } from "@/src/features/design-editor/utils/alignment-guides";
import { createDesignNode } from "@/src/features/design-editor/utils/create-design-node";
import { resolveDropTarget } from "@/src/features/design-editor/utils/drag-drop";
import {
    framesEqual,
    getNodeAbsoluteFrame,
    getNodeLocalFrame,
    getNodeFrame,
    isContainerNode,
    isAutoLayoutFrame,
    isFrameNode,
} from "@/src/features/design-editor/utils/design-tree";
import type { PageViewportMode } from "@/src/features/project-editor/types/editor.types";

const MIN_CREATION_SIZE = 24;
const ZOOM_LIMITS = {
    min: 0.25,
    max: 2.5,
};

function clampZoom(zoom: number) {
    return Math.min(ZOOM_LIMITS.max, Math.max(ZOOM_LIMITS.min, zoom));
}

function normalizeFrame(start: DesignPoint, end: DesignPoint): DesignFrame {
    return {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.max(1, Math.abs(end.x - start.x)),
        height: Math.max(1, Math.abs(end.y - start.y)),
        rotation: 0,
    };
}

function resizeFrame(frame: DesignFrame, handle: DesignResizeHandle, deltaX: number, deltaY: number): DesignFrame {
    let nextX = frame.x;
    let nextY = frame.y;
    let nextWidth = frame.width;
    let nextHeight = frame.height;

    if (handle.includes("w")) {
        nextX = frame.x + deltaX;
        nextWidth = frame.width - deltaX;
    }

    if (handle.includes("e")) {
        nextWidth = frame.width + deltaX;
    }

    if (handle.includes("n")) {
        nextY = frame.y + deltaY;
        nextHeight = frame.height - deltaY;
    }

    if (handle.includes("s")) {
        nextHeight = frame.height + deltaY;
    }

    if (nextWidth < 1) {
        nextX += nextWidth - 1;
        nextWidth = 1;
    }

    if (nextHeight < 1) {
        nextY += nextHeight - 1;
        nextHeight = 1;
    }

    return {
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
        rotation: frame.rotation,
    };
}

function getPreviewFrame(node: DesignNode, activeSession: ReturnType<typeof useDesignInteractionStore.getState>["activeSession"]) {
    if ((activeSession?.kind === "move" || activeSession?.kind === "resize") && activeSession.nodeId === node.id) {
        return activeSession.previewFrame;
    }

    const document = useDesignDocumentStore.getState().document;

    if (!document) {
        return getNodeFrame(node);
    }

    return getNodeLocalFrame(document, node.id);
}

function isEditableTarget(target: EventTarget | null) {
    return target instanceof HTMLElement && target.matches("input, textarea, [contenteditable='true']");
}

function resolvePasteTargetParentId(document: NonNullable<ReturnType<typeof useDesignDocumentStore.getState>["document"]>, selectedNodeIds: string[]) {
    if (selectedNodeIds.length === 1) {
        const selectedNode = document.nodes[selectedNodeIds[0]];

        if (selectedNode && isContainerNode(selectedNode)) {
            return selectedNode.id;
        }

        if (selectedNode?.parentId) {
            const parentNode = document.nodes[selectedNode.parentId];

            if (parentNode && isContainerNode(parentNode)) {
                return parentNode.id;
            }
        }
    }

    return document.rootNodeId;
}

function getToolNodeType(tool: DesignTool) {
    switch (tool) {
        case "frame":
        case "rectangle":
        case "text":
        case "image":
            return tool;
        default:
            return null;
    }
}

interface DesignCanvasProps {
    viewportMode: PageViewportMode;
    canvasMode?: "page" | "workspace";
}

export function DesignCanvas({ viewportMode, canvasMode = "page" }: DesignCanvasProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lastCenteredViewportModeRef = useRef<string | null>(null);
    const viewportRef = useRef(useDesignInteractionStore.getState().viewport);

    const document = useDesignDocumentStore((state) => state.document);
    const patchNode = useDesignDocumentStore((state) => state.patchNode);
    const insertNode = useDesignDocumentStore((state) => state.insertNode);
    const insertSubtree = useDesignDocumentStore((state) => state.insertSubtree);
    const commitNodeFrame = useDesignDocumentStore((state) => state.commitNodeFrame);
    const groupNodes = useDesignDocumentStore((state) => state.groupNodes);
    const reparentNodes = useDesignDocumentStore((state) => state.reparentNodes);

    const selectedNodeIds = useDesignInteractionStore((state) => state.selectedNodeIds);
    const hoveredNodeId = useDesignInteractionStore((state) => state.hoveredNodeId);
    const activeTool = useDesignInteractionStore((state) => state.activeTool);
    const viewport = useDesignInteractionStore((state) => state.viewport);
    const activeSession = useDesignInteractionStore((state) => state.activeSession);
    const inlineTextNodeId = useDesignInteractionStore((state) => state.inlineTextNodeId);
    const isSpacePressed = useDesignInteractionStore((state) => state.isSpacePressed);
    const candidateParentId = useDesignInteractionStore((state) => state.candidateParentId);
    const candidateInsertionIndex = useDesignInteractionStore((state) => state.candidateInsertionIndex);
    const candidateInsertionMode = useDesignInteractionStore((state) => state.candidateInsertionMode);
    const activeContainerId = useDesignInteractionStore((state) => state.activeContainerId);
    const alignmentGuides = useDesignInteractionStore((state) => state.alignmentGuides);

    const selectNode = useDesignInteractionStore((state) => state.selectNode);
    const clearSelection = useDesignInteractionStore((state) => state.clearSelection);
    const setSelectedNodeIds = useDesignInteractionStore((state) => state.setSelectedNodeIds);
    const hoverNode = useDesignInteractionStore((state) => state.hoverNode);
    const setActiveTool = useDesignInteractionStore((state) => state.setActiveTool);
    const setViewport = useDesignInteractionStore((state) => state.setViewport);
    const setActiveSession = useDesignInteractionStore((state) => state.setActiveSession);
    const setInlineTextNodeId = useDesignInteractionStore((state) => state.setInlineTextNodeId);
    const setSpacePressed = useDesignInteractionStore((state) => state.setSpacePressed);
    const setDragFeedback = useDesignInteractionStore((state) => state.setDragFeedback);
    const clearDragFeedback = useDesignInteractionStore((state) => state.clearDragFeedback);

    const [draftText, setDraftText] = useState("");
    const [pasteFeedback, setPasteFeedback] = useState<{ tone: "info" | "error"; message: string } | null>(null);

    const effectiveTool = isSpacePressed ? "hand" : activeTool;

    const rootNode = useMemo(() => {
        if (!document) {
            return null;
        }

        return document.nodes[document.rootNodeId] ?? null;
    }, [document]);

    const rootFrameOverride = useMemo(() => {
        if (!rootNode || canvasMode === "workspace") {
            return null;
        }

        return createRootViewportFrameOverride(getNodeFrame(rootNode), viewportMode);
    }, [canvasMode, rootNode, viewportMode]);

    const effectiveRootWidth = rootFrameOverride?.width ?? rootNode?.width ?? 0;

    useEffect(() => {
        viewportRef.current = viewport;
    }, [viewport]);

    useEffect(() => {
        if (!containerRef.current || !rootFrameOverride) {
            return;
        }

        const centerSignature = `${rootNode?.id ?? "root"}:${viewportMode}:${rootFrameOverride.width}`;

        if (lastCenteredViewportModeRef.current === centerSignature) {
            return;
        }

        const nextX = (containerRef.current.clientWidth - rootFrameOverride.width * viewport.zoom) / 2;
        const currentViewport = viewportRef.current;

        setViewport({
            ...currentViewport,
            x: nextX,
        });
        lastCenteredViewportModeRef.current = centerSignature;
    }, [rootFrameOverride, rootNode?.id, setViewport, viewport.zoom, viewportMode]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (isEditableTarget(event.target)) {
                return;
            }

            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "g") {
                event.preventDefault();

                if (selectedNodeIds.length < 2) {
                    return;
                }

                const nextGroupId = groupNodes(selectedNodeIds);

                if (nextGroupId) {
                    setSelectedNodeIds([nextGroupId], nextGroupId);
                    setInlineTextNodeId(null);
                }

                return;
            }

            if (event.code === "Space") {
                event.preventDefault();
                setSpacePressed(true);
                return;
            }

            if (event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }

            switch (event.key.toLowerCase()) {
                case "v":
                    setActiveTool("select");
                    break;
                case "f":
                    setActiveTool("frame");
                    break;
                case "r":
                    setActiveTool("rectangle");
                    break;
                case "t":
                    setActiveTool("text");
                    break;
                case "i":
                    setActiveTool("image");
                    break;
                case "h":
                    setActiveTool("hand");
                    break;
                default:
                    break;
            }
        }

        function handleKeyUp(event: KeyboardEvent) {
            if (event.code === "Space") {
                setSpacePressed(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [groupNodes, selectedNodeIds, setActiveTool, setInlineTextNodeId, setSelectedNodeIds, setSpacePressed]);

    useEffect(() => {
        if (!pasteFeedback) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setPasteFeedback(null);
        }, 3200);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [pasteFeedback]);

    const clientToDocumentPoint = useCallback(
        (clientX: number, clientY: number) => {
            const rect = containerRef.current?.getBoundingClientRect();

            if (!rect) {
                return null;
            }

            return {
                x: (clientX - rect.left - viewport.x) / viewport.zoom,
                y: (clientY - rect.top - viewport.y) / viewport.zoom,
            };
        },
        [viewport.x, viewport.y, viewport.zoom],
    );

    const clientToParentPoint = useCallback(
        (clientX: number, clientY: number, parentId: string) => {
            if (!document) {
                return null;
            }

            const documentPoint = clientToDocumentPoint(clientX, clientY);

            if (!documentPoint) {
                return null;
            }

            const parentFrame = getNodeAbsoluteFrame(document, parentId);

            return {
                x: documentPoint.x - parentFrame.x,
                y: documentPoint.y - parentFrame.y,
            };
        },
        [clientToDocumentPoint, document],
    );

    const beginPanSession = useCallback(
        (clientX: number, clientY: number) => {
            setActiveSession({
                kind: "pan",
                pointerStart: { x: clientX, y: clientY },
                initialViewport: viewport,
                previewViewport: viewport,
            });
        },
        [setActiveSession, viewport],
    );

    const beginCreateSession = useCallback(
        (clientX: number, clientY: number, parentId: string, nodeType: CreateInteractionSession["nodeType"]) => {
            const originPoint = clientToParentPoint(clientX, clientY, parentId);

            if (!originPoint) {
                return;
            }

            setActiveSession({
                kind: "create",
                nodeType,
                parentId,
                pointerStart: { x: clientX, y: clientY },
                originPoint,
                previewFrame: {
                    x: originPoint.x,
                    y: originPoint.y,
                    width: 1,
                    height: 1,
                    rotation: 0,
                },
            });
        },
        [clientToParentPoint, setActiveSession],
    );

    const clientPointToDocumentPoint = useCallback((clientX: number, clientY: number) => {
        return clientToDocumentPoint(clientX, clientY);
    }, [clientToDocumentPoint]);

    useEffect(() => {
        if (!document) {
            return;
        }

        const currentDocument = document;

        async function handlePaste(event: ClipboardEvent) {
            if (activeSession || inlineTextNodeId || isEditableTarget(event.target)) {
                return;
            }

            const rect = containerRef.current?.getBoundingClientRect();

            if (!rect) {
                return;
            }

            event.preventDefault();

            const targetParentId = resolvePasteTargetParentId(currentDocument, selectedNodeIds);
            const anchorPoint = {
                x: (-viewport.x + rect.width / 2) / viewport.zoom,
                y: (-viewport.y + rect.height / 2) / viewport.zoom,
            };
            const result = await pasteFromClipboard({
                event,
                document: currentDocument,
                targetParentId,
                anchorPoint,
                insertSubtree,
            });

            if (result.status === "success") {
                if (result.rootNodeIds.length > 0) {
                    const primarySelection = result.rootNodeIds[result.rootNodeIds.length - 1] ?? null;
                    setSelectedNodeIds(result.rootNodeIds, primarySelection);
                    setInlineTextNodeId(null);
                }

                if (result.warnings.length > 0) {
                    setPasteFeedback({
                        tone: "info",
                        message: result.warnings[0],
                    });
                }

                return;
            }

            setPasteFeedback({
                tone: result.status === "error" ? "error" : "info",
                message: result.message ?? "Clipboard content could not be imported.",
            });
        }

        window.addEventListener("paste", handlePaste);

        return () => {
            window.removeEventListener("paste", handlePaste);
        };
    }, [activeSession, document, inlineTextNodeId, insertSubtree, selectedNodeIds, setInlineTextNodeId, setSelectedNodeIds, viewport.x, viewport.y, viewport.zoom]);

    useEffect(() => {
        if (!activeSession || !document) {
            return;
        }

        const session = activeSession;
        const currentDocument = document;

        function handlePointerMove(event: PointerEvent) {
            if (session.kind === "pan") {
                const nextViewport = {
                    ...session.initialViewport,
                    x: session.initialViewport.x + (event.clientX - session.pointerStart.x),
                    y: session.initialViewport.y + (event.clientY - session.pointerStart.y),
                };

                setViewport(nextViewport);
                setActiveSession({
                    ...session,
                    previewViewport: nextViewport,
                });
                return;
            }

            const deltaX = (event.clientX - session.pointerStart.x) / viewport.zoom;
            const deltaY = (event.clientY - session.pointerStart.y) / viewport.zoom;

            if (session.kind === "move") {
                const nextPreviewFrame = {
                    ...session.initialFrame,
                    x: session.initialFrame.x + deltaX,
                    y: session.initialFrame.y + deltaY,
                };
                const nextPreviewAbsoluteFrame = {
                    ...session.initialAbsoluteFrame,
                    x: session.initialAbsoluteFrame.x + deltaX,
                    y: session.initialAbsoluteFrame.y + deltaY,
                };
                const nextPointerPosition = clientPointToDocumentPoint(event.clientX, event.clientY);
                const dropTarget = resolveDropTarget({
                    document: currentDocument,
                    draggedNodeId: session.nodeId,
                    previewAbsoluteFrame: nextPreviewAbsoluteFrame,
                    pointerPosition: nextPointerPosition,
                });
                const currentParentId = currentDocument.nodes[session.nodeId]?.parentId ?? null;
                const guideContainerId = dropTarget.activeContainerId ?? currentParentId;

                setActiveSession({
                    ...session,
                    previewFrame: nextPreviewFrame,
                    previewAbsoluteFrame: nextPreviewAbsoluteFrame,
                });
                setDragFeedback({
                    ...dropTarget,
                    alignmentGuides: computeAlignmentGuides({
                        document: currentDocument,
                        draggedNodeId: session.nodeId,
                        containerId: guideContainerId,
                        previewAbsoluteFrame: nextPreviewAbsoluteFrame,
                    }),
                });
                return;
            }

            if (session.kind === "resize") {
                setActiveSession({
                    ...session,
                    previewFrame: resizeFrame(session.initialFrame, session.handle, deltaX, deltaY),
                });
                return;
            }

            if (session.kind === "create") {
                const currentPoint = clientToParentPoint(event.clientX, event.clientY, session.parentId);

                if (!currentPoint) {
                    return;
                }

                setActiveSession({
                    ...session,
                    previewFrame: normalizeFrame(session.originPoint, currentPoint),
                });
            }
        }

        function handlePointerUp() {
            if (session.kind === "move" || session.kind === "resize") {
                if (session.kind === "move") {
                    const feedbackState = useDesignInteractionStore.getState();

                    if (feedbackState.candidateParentId) {
                        reparentNodes({
                            nodeIds: [session.nodeId],
                            nextParentId: feedbackState.candidateParentId,
                            absoluteFramesByNodeId: {
                                [session.nodeId]: session.previewAbsoluteFrame,
                            },
                            insertIndex: feedbackState.candidateInsertionIndex,
                        });
                    } else if (!framesEqual(session.initialFrame, session.previewFrame)) {
                        commitNodeFrame(session.nodeId, session.previewFrame);
                    }

                    clearDragFeedback();
                    setActiveSession(null);
                    return;
                }

                if (!framesEqual(session.initialFrame, session.previewFrame)) {
                    commitNodeFrame(session.nodeId, session.previewFrame);
                }

                clearDragFeedback();
                setActiveSession(null);
                return;
            }

            if (session.kind === "create") {
                const { previewFrame } = session;

                if (previewFrame.width >= MIN_CREATION_SIZE && previewFrame.height >= MIN_CREATION_SIZE) {
                    const node = createDesignNode({
                        type: session.nodeType,
                        parentId: session.parentId,
                        frame: previewFrame,
                    });

                    insertNode(node);
                    setSelectedNodeIds([node.id], node.id);

                    if (node.type === "text") {
                        setDraftText(node.text);
                        setInlineTextNodeId(node.id);
                    }

                    setActiveTool("select");
                }

                setActiveSession(null);
                clearDragFeedback();
                return;
            }

            clearDragFeedback();
            setActiveSession(null);
        }

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp, { once: true });

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [activeSession, clearDragFeedback, clientPointToDocumentPoint, clientToParentPoint, commitNodeFrame, document, insertNode, reparentNodes, setActiveSession, setActiveTool, setDragFeedback, setInlineTextNodeId, setSelectedNodeIds, setViewport, viewport.zoom]);

    const handleCanvasWheel = useCallback(
        (event: React.WheelEvent<HTMLDivElement>) => {
            event.preventDefault();

            if (!containerRef.current) {
                return;
            }

            const rect = containerRef.current.getBoundingClientRect();
            const localX = event.clientX - rect.left;
            const localY = event.clientY - rect.top;

            if (event.metaKey || event.ctrlKey) {
                const nextZoom = clampZoom(viewport.zoom - event.deltaY * 0.0015);
                const worldX = (localX - viewport.x) / viewport.zoom;
                const worldY = (localY - viewport.y) / viewport.zoom;

                setViewport({
                    x: localX - worldX * nextZoom,
                    y: localY - worldY * nextZoom,
                    zoom: nextZoom,
                });
                return;
            }

            setViewport({
                ...viewport,
                x: viewport.x - event.deltaX,
                y: viewport.y - event.deltaY,
            });
        },
        [setViewport, viewport],
    );

    const commitInlineText = useCallback(() => {
        if (!inlineTextNodeId || !document) {
            return;
        }

        const node = document.nodes[inlineTextNodeId];

        if (node?.type !== "text") {
            setInlineTextNodeId(null);
            return;
        }

        patchNode(node.id, { text: draftText });
        setInlineTextNodeId(null);
    }, [document, draftText, inlineTextNodeId, patchNode, setInlineTextNodeId]);

    const autoLayoutInsertionIndicator = useMemo(() => {
        if (!document || !candidateParentId || candidateInsertionMode !== "auto-layout" || candidateInsertionIndex == null || activeSession?.kind !== "move") {
            return null;
        }

        const containerNode = document.nodes[candidateParentId];

        if (!containerNode || !isAutoLayoutFrame(containerNode)) {
            return null;
        }

        const containerAbsoluteFrame = getNodeAbsoluteFrame(document, candidateParentId);
        const orderedSiblings = containerNode.children.filter((childId) => childId !== activeSession.nodeId && document.nodes[childId]?.visible);
        const innerLeft = containerAbsoluteFrame.x + containerNode.autoLayout.padding.left;
        const innerTop = containerAbsoluteFrame.y + containerNode.autoLayout.padding.top;
        const innerWidth = Math.max(0, containerAbsoluteFrame.width - containerNode.autoLayout.padding.left - containerNode.autoLayout.padding.right);
        const innerHeight = Math.max(0, containerAbsoluteFrame.height - containerNode.autoLayout.padding.top - containerNode.autoLayout.padding.bottom);

        if (containerNode.autoLayout.direction === "horizontal") {
            let position = innerLeft;

            if (orderedSiblings.length > 0) {
                if (candidateInsertionIndex <= 0) {
                    position = getNodeAbsoluteFrame(document, orderedSiblings[0]).x - containerNode.autoLayout.gap / 2;
                } else if (candidateInsertionIndex >= orderedSiblings.length) {
                    const lastFrame = getNodeAbsoluteFrame(document, orderedSiblings[orderedSiblings.length - 1]);
                    position = lastFrame.x + lastFrame.width + containerNode.autoLayout.gap / 2;
                } else {
                    const previousFrame = getNodeAbsoluteFrame(document, orderedSiblings[candidateInsertionIndex - 1]);
                    const nextFrame = getNodeAbsoluteFrame(document, orderedSiblings[candidateInsertionIndex]);
                    position = previousFrame.x + previousFrame.width + (nextFrame.x - (previousFrame.x + previousFrame.width)) / 2;
                }
            }

            return {
                left: position,
                top: innerTop,
                width: 2,
                height: innerHeight,
            };
        }

        let position = innerTop;

        if (orderedSiblings.length > 0) {
            if (candidateInsertionIndex <= 0) {
                position = getNodeAbsoluteFrame(document, orderedSiblings[0]).y - containerNode.autoLayout.gap / 2;
            } else if (candidateInsertionIndex >= orderedSiblings.length) {
                const lastFrame = getNodeAbsoluteFrame(document, orderedSiblings[orderedSiblings.length - 1]);
                position = lastFrame.y + lastFrame.height + containerNode.autoLayout.gap / 2;
            } else {
                const previousFrame = getNodeAbsoluteFrame(document, orderedSiblings[candidateInsertionIndex - 1]);
                const nextFrame = getNodeAbsoluteFrame(document, orderedSiblings[candidateInsertionIndex]);
                position = previousFrame.y + previousFrame.height + (nextFrame.y - (previousFrame.y + previousFrame.height)) / 2;
            }
        }

        return {
            left: innerLeft,
            top: position,
            width: innerWidth,
            height: 2,
        };
    }, [activeSession, candidateInsertionIndex, candidateInsertionMode, candidateParentId, document]);

    const rendererPresentationById = useMemo(() => {
        if (!document || activeSession?.kind !== "move") {
            return undefined;
        }

        const movingNode = document.nodes[activeSession.nodeId];
        const parentNode = movingNode?.parentId ? document.nodes[movingNode.parentId] : null;

        return {
            [activeSession.nodeId]: parentNode && isAutoLayoutFrame(parentNode) ? "ghost" : "hidden",
        } as const;
    }, [activeSession, document]);

    const rendererFrameOverrides = useMemo(() => {
        const overrides: Record<string, DesignFrame> = {};

        if (document && rootFrameOverride) {
            overrides[document.rootNodeId] = rootFrameOverride;
        }

        if (activeSession?.kind === "resize") {
            overrides[activeSession.nodeId] = activeSession.previewFrame;
        }

        return Object.keys(overrides).length > 0 ? overrides : undefined;
    }, [activeSession, document, rootFrameOverride]);

    function renderNodeOverlay(nodeId: string, options?: { isRoot?: boolean }): React.ReactNode {
        if (!document) {
            return null;
        }

        const currentDocument = document;

        const node = currentDocument.nodes[nodeId];

        if (!node) {
            return null;
        }

        const isRoot = options?.isRoot ?? false;

        if (activeSession?.kind === "move" && activeSession.nodeId === node.id) {
            return null;
        }

        const frame = isRoot && rootFrameOverride ? rootFrameOverride : getPreviewFrame(node, activeSession);
        const parentNode = node.parentId ? currentDocument.nodes[node.parentId] : null;
        const parentUsesAutoLayout = Boolean(parentNode && isAutoLayoutFrame(parentNode));
        const isSelected = selectedNodeIds.includes(node.id);
        const hasSingleSelection = selectedNodeIds.length === 1;
        const isHovered = hoveredNodeId === node.id;
        const isEditingText = inlineTextNodeId === node.id && node.type === "text";
        const previewChild = activeSession?.kind === "create" && activeSession.parentId === node.id ? activeSession : null;
        const createNodeType = getToolNodeType(effectiveTool);
        const isCandidateParent = candidateParentId === node.id;
        const isActiveContainer = activeContainerId === node.id;

        const nodeOverlaySx = designEditorStyles.canvas.overlayNode({
            isRoot,
            parentUsesAutoLayout,
            frame,
            borderRadius: node.style.borderRadius,
            locked: node.locked,
            isCandidateParent,
            isSelected,
            isHovered,
            isActiveContainer,
            isEditingText,
            hasActiveSession: Boolean(activeSession),
        });

        function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
            event.stopPropagation();

            if (event.button !== 0) {
                return;
            }

            if (effectiveTool === "hand") {
                beginPanSession(event.clientX, event.clientY);
                return;
            }

            if (isEditingText) {
                return;
            }

            if (createNodeType && isFrameNode(node)) {
                beginCreateSession(event.clientX, event.clientY, node.id, createNodeType);
                return;
            }

            if (effectiveTool !== "select") {
                return;
            }

            if (event.metaKey || event.ctrlKey) {
                selectNode(node.id, { additive: true });
                return;
            }

            if (isRoot) {
                clearSelection();
                setInlineTextNodeId(null);
                return;
            }

            selectNode(node.id);
            setInlineTextNodeId(null);

            if (node.locked) {
                return;
            }

            const nodeAbsoluteFrame = getNodeAbsoluteFrame(currentDocument, node.id);

            setActiveSession({
                kind: "move",
                nodeId: node.id,
                pointerStart: { x: event.clientX, y: event.clientY },
                initialFrame: frame,
                previewFrame: frame,
                initialAbsoluteFrame: nodeAbsoluteFrame,
                previewAbsoluteFrame: nodeAbsoluteFrame,
            });
        }

        function handleResizePointerDown(event: React.PointerEvent<HTMLDivElement>, handle: DesignResizeHandle) {
            event.stopPropagation();
            event.preventDefault();

            setActiveSession({
                kind: "resize",
                nodeId: node.id,
                handle,
                pointerStart: { x: event.clientX, y: event.clientY },
                initialFrame: frame,
                previewFrame: frame,
            });
        }

        const treeChildren = isContainerNode(node)
            ? node.children.map((childId) => renderNodeOverlay(childId))
            : null;

        return (
            <Box
                key={node.id}
                sx={nodeOverlaySx}
                onPointerDown={handlePointerDown}
                onMouseEnter={() => hoverNode(node.id)}
                onMouseLeave={() => hoverNode(null)}
                onDoubleClick={() => {
                    if (node.type === "text") {
                        setSelectedNodeIds([node.id], node.id);
                        setDraftText(node.text);
                        setInlineTextNodeId(node.id);
                    }
                }}
            >
                {node.type === "text" && isEditingText ? (
                    <Box
                        component="textarea"
                        value={draftText}
                        autoFocus
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDraftText(event.target.value)}
                        onBlur={commitInlineText}
                        sx={designEditorStyles.canvas.textEditor({
                            color: node.style.typography?.color,
                            fontFamily: node.style.typography?.fontFamily,
                            fontSize: node.style.typography?.fontSize,
                            fontWeight: node.style.typography?.fontWeight,
                            lineHeight: node.style.typography?.lineHeight,
                            textAlign: node.style.typography?.textAlign,
                        })}
                    />
                ) : null}

                {node.type === "frame" && isRoot && canvasMode === "page" ? (
                    <Box sx={designEditorStyles.canvas.rootBadge}>
                        {node.name} · {Math.round(frame.width)} x {Math.round(frame.height)}
                    </Box>
                ) : null}

                {node.type === "frame" && node.layoutMode === "auto" ? (
                    <Box sx={designEditorStyles.canvas.autoLayoutBadge}>
                        Auto Layout
                    </Box>
                ) : null}

                {treeChildren}

                {previewChild ? (
                    <Box sx={designEditorStyles.canvas.previewChild({ frame: previewChild.previewFrame, nodeType: previewChild.nodeType })} />
                ) : null}

                {isSelected && hasSingleSelection && !isRoot && effectiveTool === "select"
                    ? DESIGN_RESIZE_HANDLES.map((handle) => (
                        <Box
                            key={handle}
                            onPointerDown={(event) => handleResizePointerDown(event, handle)}
                            sx={designEditorStyles.canvas.resizeHandle(getDesignResizeHandleStyle(handle))}
                        />
                    ))
                    : null}
            </Box>
        );
    }

    if (!document || !rootNode) {
        return null;
    }

    return (
        <Box
            ref={containerRef}
            onWheel={handleCanvasWheel}
            onPointerDown={(event) => {
                if (event.button !== 0) {
                    return;
                }

                if (effectiveTool === "hand") {
                    beginPanSession(event.clientX, event.clientY);
                    return;
                }

                clearSelection();
                setInlineTextNodeId(null);
            }}
            sx={designEditorStyles.canvas.root(effectiveTool, activeSession?.kind ?? null, canvasMode)}
        >
            {pasteFeedback ? (
                <Box sx={designEditorStyles.canvas.pasteFeedback(pasteFeedback.tone)}>
                    <Typography sx={designEditorStyles.canvas.pasteFeedbackText}>{pasteFeedback.message}</Typography>
                </Box>
            ) : null}

            <Box sx={designEditorStyles.canvas.grid(viewport)} />

            <Box sx={designEditorStyles.canvas.stage(viewport, effectiveRootWidth, rootNode.height)}>
                <DesignDocumentRenderer
                    document={document}
                    mode="editor"
                    frameOverrides={rendererFrameOverrides}
                    nodePresentationById={rendererPresentationById}
                />

                {renderNodeOverlay(document.rootNodeId, { isRoot: true })}

                {activeSession?.kind === "move"
                    ? (
                        <DesignDocumentRenderer
                            document={document}
                            mode="editor"
                            rootNodeId={activeSession.nodeId}
                            rootPositioning="absolute"
                            frameOverrides={{
                                [activeSession.nodeId]: activeSession.previewAbsoluteFrame,
                            }}
                        />
                    )
                    : null}

                {alignmentGuides.map((guide) => (
                    <Box
                        key={guide.id}
                        sx={designEditorStyles.canvas.alignmentGuide(guide)}
                    />
                ))}

                {autoLayoutInsertionIndicator ? (
                    <Box sx={designEditorStyles.canvas.insertionIndicator(autoLayoutInsertionIndicator)} />
                ) : null}
            </Box>
        </Box>
    );
}