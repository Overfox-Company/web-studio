"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Box, Stack, Typography } from "@mui/material";

import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document.store";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
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

function mapAutoLayoutJustify(justifyContent: DesignNode extends never ? never : "start" | "center" | "end" | "space-between") {
    switch (justifyContent) {
        case "center":
            return "center";
        case "end":
            return "flex-end";
        case "space-between":
            return "space-between";
        default:
            return "flex-start";
    }
}

function mapAutoLayoutAlign(alignItems: DesignNode extends never ? never : "start" | "center" | "end" | "stretch") {
    switch (alignItems) {
        case "center":
            return "center";
        case "end":
            return "flex-end";
        case "stretch":
            return "stretch";
        default:
            return "flex-start";
    }
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

function getResizeHandleStyle(handle: DesignResizeHandle) {
    const base = { transform: "translate(-50%, -50%)" };

    switch (handle) {
        case "nw":
            return { ...base, left: 0, top: 0, cursor: "nwse-resize" };
        case "n":
            return { ...base, left: "50%", top: 0, cursor: "ns-resize" };
        case "ne":
            return { ...base, left: "100%", top: 0, cursor: "nesw-resize" };
        case "e":
            return { ...base, left: "100%", top: "50%", cursor: "ew-resize" };
        case "se":
            return { ...base, left: "100%", top: "100%", cursor: "nwse-resize" };
        case "s":
            return { ...base, left: "50%", top: "100%", cursor: "ns-resize" };
        case "sw":
            return { ...base, left: 0, top: "100%", cursor: "nesw-resize" };
        case "w":
            return { ...base, left: 0, top: "50%", cursor: "ew-resize" };
    }
}

export function DesignCanvas() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const document = useDesignDocumentStore((state) => state.document);
    const patchNode = useDesignDocumentStore((state) => state.patchNode);
    const insertNode = useDesignDocumentStore((state) => state.insertNode);
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

    const effectiveTool = isSpacePressed ? "hand" : activeTool;

    const rootNode = useMemo(() => {
        if (!document) {
            return null;
        }

        return document.nodes[document.rootNodeId] ?? null;
    }, [document]);

    useEffect(() => {
        function isEditableTarget(target: EventTarget | null) {
            return target instanceof HTMLElement && target.matches("input, textarea, [contenteditable='true']");
        }

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

    function renderNode(nodeId: string, options?: { isRoot?: boolean; renderMode?: "tree" | "overlay"; overrideFrame?: DesignFrame }): React.ReactNode {
        if (!document) {
            return null;
        }

        const currentDocument = document;

        const node = currentDocument.nodes[nodeId];

        if (!node) {
            return null;
        }

        const isRoot = options?.isRoot ?? false;
        const renderMode = options?.renderMode ?? "tree";
        const isMoveOverlay = renderMode === "overlay";

        if (renderMode === "tree" && activeSession?.kind === "move" && activeSession.nodeId === node.id) {
            return null;
        }

        const frame = options?.overrideFrame ?? getPreviewFrame(node, activeSession);
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

        const sharedBoxSx = {
            ...(parentUsesAutoLayout && !isMoveOverlay
                ? {
                    position: "relative" as const,
                    flexShrink: 0,
                }
                : {
                    position: "absolute" as const,
                    left: frame.x,
                    top: frame.y,
                }),
            width: frame.width,
            height: frame.height,
            transform: `rotate(${frame.rotation}deg)`,
            transformOrigin: "center center",
            borderRadius: `${node.style.borderRadius}px`,
            opacity: node.visible ? (isMoveOverlay ? 0.92 : node.style.opacity) : 0.2,
            pointerEvents: isMoveOverlay ? "none" : node.locked ? "none" : "auto",
            overflow: isFrameNode(node) && node.clipContent ? "hidden" : "visible",
            outline: isCandidateParent
                ? "2px solid rgba(56, 189, 248, 0.96)"
                : isSelected
                    ? "1px solid rgba(56, 189, 248, 0.96)"
                    : isHovered
                        ? "1px solid rgba(125, 211, 252, 0.42)"
                        : isActiveContainer
                            ? "1px solid rgba(125, 211, 252, 0.28)"
                            : "none",
            outlineOffset: isSelected || isHovered ? "2px" : 0,
            boxShadow: node.style.shadow
                ? `${node.style.shadow.x}px ${node.style.shadow.y}px ${node.style.shadow.blur}px ${node.style.shadow.spread}px ${node.style.shadow.color}`
                : "none",
            background: node.type === "text" ? "transparent" : node.style.fill,
            border: node.style.stroke ? `${node.style.strokeWidth}px solid ${node.style.stroke}` : "none",
            transition: activeSession ? "none" : "outline-color 120ms ease, box-shadow 120ms ease",
            ...(node.type === "frame" && node.layoutMode === "auto"
                ? {
                    display: "flex",
                    flexDirection: node.autoLayout.direction === "horizontal" ? "row" : "column",
                    justifyContent: mapAutoLayoutJustify(node.autoLayout.justifyContent),
                    alignItems: mapAutoLayoutAlign(node.autoLayout.alignItems),
                    gap: `${node.autoLayout.gap}px`,
                    padding: `${node.autoLayout.padding.top}px ${node.autoLayout.padding.right}px ${node.autoLayout.padding.bottom}px ${node.autoLayout.padding.left}px`,
                }
                : {}),
        };

        function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
            if (isMoveOverlay) {
                return;
            }

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
            if (isMoveOverlay) {
                return;
            }

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
            ? node.children.map((childId) => renderNode(childId, { renderMode }))
            : null;

        if (renderMode === "tree" && activeSession?.kind === "move" && activeSession.nodeId === node.id && parentUsesAutoLayout) {
            return (
                <Box
                    key={`${node.id}-placeholder`}
                    sx={{
                        width: frame.width,
                        height: frame.height,
                        flexShrink: 0,
                        opacity: 0,
                        pointerEvents: "none",
                    }}
                />
            );
        }

        return (
            <Box
                key={node.id}
                sx={sharedBoxSx}
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
                {node.type === "text" ? (
                    isEditingText ? (
                        <Box
                            component="textarea"
                            value={draftText}
                            autoFocus
                            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDraftText(event.target.value)}
                            onBlur={commitInlineText}
                            sx={{
                                width: "100%",
                                height: "100%",
                                px: 0,
                                py: 0,
                                border: "none",
                                outline: "none",
                                resize: "none",
                                background: "transparent",
                                color: node.style.typography?.color ?? "#0f172a",
                                fontFamily: node.style.typography?.fontFamily,
                                fontSize: node.style.typography?.fontSize,
                                fontWeight: node.style.typography?.fontWeight,
                                lineHeight: node.style.typography?.lineHeight,
                                textAlign: node.style.typography?.textAlign,
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                color: node.style.typography?.color ?? "#0f172a",
                                fontFamily: node.style.typography?.fontFamily,
                                fontSize: node.style.typography?.fontSize,
                                fontWeight: node.style.typography?.fontWeight,
                                lineHeight: node.style.typography?.lineHeight,
                                textAlign: node.style.typography?.textAlign,
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {node.text}
                        </Box>
                    )
                ) : null}

                {node.type === "image" ? (
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        spacing={1}
                        sx={{
                            width: "100%",
                            height: "100%",
                            borderRadius: `${node.style.borderRadius}px`,
                            background:
                                "linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(51, 65, 85, 0.88) 100%), radial-gradient(circle at top left, rgba(125, 211, 252, 0.22), transparent 48%)",
                            color: "#e2e8f0",
                        }}
                    >
                        <Typography sx={{ fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#94a3b8" }}>
                            Image
                        </Typography>
                        <Typography sx={{ fontSize: "0.94rem", fontWeight: 600 }}>{node.name}</Typography>
                    </Stack>
                ) : null}

                {node.type === "frame" && isRoot ? (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 18,
                            left: 18,
                            px: 1,
                            py: 0.55,
                            borderRadius: "999px",
                            background: "rgba(8, 12, 19, 0.55)",
                            color: "#e2e8f0",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            zIndex: 2,
                        }}
                    >
                        {node.name} · {Math.round(node.width)} x {Math.round(node.height)}
                    </Box>
                ) : null}

                {node.type === "frame" && node.layoutMode === "auto" ? (
                    <Box
                        sx={{
                            position: "absolute",
                            right: 14,
                            top: 14,
                            px: 0.9,
                            py: 0.45,
                            borderRadius: "999px",
                            background: "rgba(8, 12, 19, 0.62)",
                            color: "#7dd3fc",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            zIndex: 3,
                        }}
                    >
                        Auto Layout
                    </Box>
                ) : null}

                {treeChildren}

                {previewChild ? (
                    <Box
                        sx={{
                            position: "absolute",
                            left: previewChild.previewFrame.x,
                            top: previewChild.previewFrame.y,
                            width: previewChild.previewFrame.width,
                            height: previewChild.previewFrame.height,
                            borderRadius: previewChild.nodeType === "text" ? "8px" : "18px",
                            border: "1px dashed rgba(125, 211, 252, 0.92)",
                            background:
                                previewChild.nodeType === "text"
                                    ? "rgba(125, 211, 252, 0.12)"
                                    : previewChild.nodeType === "image"
                                        ? "linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(51, 65, 85, 0.75))"
                                        : "rgba(125, 211, 252, 0.16)",
                        }}
                    />
                ) : null}

                {isSelected && hasSingleSelection && !isRoot && effectiveTool === "select"
                    ? DESIGN_RESIZE_HANDLES.map((handle) => (
                        <Box
                            key={handle}
                            onPointerDown={(event) => handleResizePointerDown(event, handle)}
                            sx={{
                                position: "absolute",
                                width: 10,
                                height: 10,
                                borderRadius: "999px",
                                background: "#38bdf8",
                                border: "2px solid #020617",
                                ...getResizeHandleStyle(handle),
                            }}
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
            sx={{
                position: "relative",
                minHeight: 0,
                height: "100%",
                overflow: "hidden",
                background:
                    "radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), transparent 28%), linear-gradient(180deg, #06080f 0%, #0f172a 100%)",
                backgroundSize: "cover",
                cursor:
                    effectiveTool === "hand"
                        ? activeSession?.kind === "pan"
                            ? "grabbing"
                            : "grab"
                        : activeSession?.kind === "move"
                            ? "grabbing"
                            : "default",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px)",
                    backgroundSize: `${24 * viewport.zoom}px ${24 * viewport.zoom}px`,
                    backgroundPosition: `${viewport.x}px ${viewport.y}px`,
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                    transformOrigin: "top left",
                    width: rootNode.width,
                    height: rootNode.height,
                }}
            >
                {renderNode(document.rootNodeId, { isRoot: true })}

                {activeSession?.kind === "move"
                    ? renderNode(activeSession.nodeId, {
                        renderMode: "overlay",
                        overrideFrame: activeSession.previewAbsoluteFrame,
                    })
                    : null}

                {alignmentGuides.map((guide) => (
                    <Box
                        key={guide.id}
                        sx={{
                            position: "absolute",
                            left: guide.axis === "vertical" ? guide.position : guide.start,
                            top: guide.axis === "vertical" ? guide.start : guide.position,
                            width: guide.axis === "vertical" ? 1.5 : Math.max(1.5, guide.end - guide.start),
                            height: guide.axis === "vertical" ? Math.max(1.5, guide.end - guide.start) : 1.5,
                            background: guide.source === "container" ? "rgba(248, 250, 252, 0.92)" : "rgba(56, 189, 248, 0.96)",
                            boxShadow: "0 0 0 1px rgba(8, 12, 19, 0.42)",
                            pointerEvents: "none",
                        }}
                    />
                ))}

                {autoLayoutInsertionIndicator ? (
                    <Box
                        sx={{
                            position: "absolute",
                            left: autoLayoutInsertionIndicator.left,
                            top: autoLayoutInsertionIndicator.top,
                            width: autoLayoutInsertionIndicator.width,
                            height: autoLayoutInsertionIndicator.height,
                            borderRadius: "999px",
                            background: "rgba(248, 250, 252, 0.94)",
                            boxShadow: "0 0 0 1px rgba(8, 12, 19, 0.42)",
                            pointerEvents: "none",
                        }}
                    />
                ) : null}
            </Box>
        </Box>
    );
}