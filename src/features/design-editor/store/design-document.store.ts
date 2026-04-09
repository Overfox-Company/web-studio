import { create } from "zustand";

import { designEditorDefaults } from "@/src/customization/design-editor";
import { createDesignFrameNode } from "@/src/features/design-editor/utils/create-design-node";
import {
    getCommonParentId,
    getNodeAbsoluteFrame,
    getNodeLocalFrame,
    getNodesAbsoluteBounds,
    getParentLocalFrame,
    isAncestorNode,
    isContainerNode,
} from "@/src/features/design-editor/utils/design-tree";
import type {
    DesignAutoLayout,
    DesignContainerNode,
    DesignDocumentSnapshot,
    DesignImageStyle,
    DesignNodeAxisSizing,
    DesignNode,
    DesignNodeSizing,
    DesignNodeStyle,
    DesignPadding,
    DesignShadow,
    DesignTypography,
} from "@/src/features/design-editor/types/design.types";
import type { DesignFrame } from "@/src/features/design-editor/types/interaction.types";

interface InsertNodeOptions {
    index?: number | null;
}

interface InsertSubtreePayload {
    nodes: Record<string, DesignNode>;
    rootNodeIds: string[];
    targetParentId: string;
    insertIndex?: number | null;
}

interface ReparentNodesPayload {
    nodeIds: string[];
    nextParentId: string;
    absoluteFramesByNodeId?: Record<string, DesignFrame>;
    insertIndex?: number | null;
}

type DesignNodePatch = Partial<{
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    visible: boolean;
    locked: boolean;
    text: string;
    src: string;
    clipContent: boolean;
    layoutMode: "absolute" | "auto";
}> & {
    sizing?: Partial<{
        width: Partial<DesignNodeAxisSizing>;
        height: Partial<DesignNodeAxisSizing>;
    }>;
    style?: Partial<Omit<DesignNodeStyle, "image" | "shadow" | "typography">> & {
        typography?: Partial<DesignTypography>;
        image?: Partial<DesignImageStyle>;
        shadow?: Partial<DesignShadow> | null;
    };
    padding?: Partial<DesignPadding>;
    autoLayout?: Partial<Omit<DesignAutoLayout, "padding">> & {
        padding?: Partial<DesignPadding>;
    };
};

interface DesignDocumentStore {
    document: DesignDocumentSnapshot | null;
    hydrateDocument: (document: DesignDocumentSnapshot) => void;
    clearDocument: () => void;
    patchNode: (nodeId: string, patch: DesignNodePatch) => void;
    insertNode: (node: DesignNode, options?: InsertNodeOptions) => void;
    insertSubtree: (payload: InsertSubtreePayload) => void;
    removeNode: (nodeId: string) => void;
    commitNodeFrame: (nodeId: string, frame: DesignFrame) => void;
    reparentNodes: (payload: ReparentNodesPayload) => void;
    groupNodes: (nodeIds: string[]) => string | null;
    undo: () => void;
}

interface DesignDocumentStoreState extends DesignDocumentStore {
    pastDocuments: DesignDocumentSnapshot[];
    futureDocuments: DesignDocumentSnapshot[];
}

const HISTORY_LIMIT = 100;

function touchDocument(document: DesignDocumentSnapshot): DesignDocumentSnapshot {
    return {
        ...document,
        updatedAt: new Date().toISOString(),
    };
}

function withDocumentNode(
    document: DesignDocumentSnapshot,
    nodeId: string,
    updater: (node: DesignNode) => DesignNode,
): DesignDocumentSnapshot {
    const currentNode = document.nodes[nodeId];

    if (!currentNode) {
        return document;
    }

    const nextNode = updater(currentNode);

    if (nextNode === currentNode) {
        return document;
    }

    return touchDocument({
        ...document,
        nodes: {
            ...document.nodes,
            [nodeId]: nextNode,
        },
    });
}

function materializeChildFrames(document: DesignDocumentSnapshot, parentId: string): DesignDocumentSnapshot {
    const parentNode = document.nodes[parentId];

    if (!parentNode || !isContainerNode(parentNode)) {
        return document;
    }

    let nextNodes: Record<string, DesignNode> | null = null;

    for (const childId of parentNode.children) {
        const childNode = document.nodes[childId];

        if (!childNode) {
            continue;
        }

        const localFrame = getNodeLocalFrame(document, childId);

        if (
            childNode.x === localFrame.x &&
            childNode.y === localFrame.y &&
            childNode.width === localFrame.width &&
            childNode.height === localFrame.height &&
            childNode.rotation === localFrame.rotation
        ) {
            continue;
        }

        nextNodes ??= { ...document.nodes };
        nextNodes[childId] = {
            ...childNode,
            x: localFrame.x,
            y: localFrame.y,
            width: localFrame.width,
            height: localFrame.height,
            rotation: localFrame.rotation,
        };
    }

    if (!nextNodes) {
        return document;
    }

    return {
        ...document,
        nodes: nextNodes,
    };
}

function expandAutoLayoutFrameToFitChildren(document: DesignDocumentSnapshot, nodeId: string): DesignDocumentSnapshot {
    const node = document.nodes[nodeId];

    if (!node || node.type !== "frame" || node.layoutMode !== "auto") {
        return document;
    }

    const childFrames = node.children
        .filter((childId) => Boolean(document.nodes[childId]))
        .map((childId) => getNodeLocalFrame(document, childId));
    const requiredWidth = childFrames.length === 0
        ? node.autoLayout.padding.left + node.autoLayout.padding.right
        : Math.max(...childFrames.map((frame) => frame.x + frame.width), 0) + node.autoLayout.padding.right;
    const requiredHeight = childFrames.length === 0
        ? node.autoLayout.padding.top + node.autoLayout.padding.bottom
        : Math.max(...childFrames.map((frame) => frame.y + frame.height), 0) + node.autoLayout.padding.bottom;
    const nextWidth = node.sizing.width.mode === "fill"
        ? Math.max(node.width, requiredWidth)
        : Math.max(1, requiredWidth);
    const nextHeight = node.sizing.height.mode === "fill"
        ? Math.max(node.height, requiredHeight)
        : Math.max(1, requiredHeight);

    if (nextWidth === node.width && nextHeight === node.height) {
        return document;
    }

    return {
        ...document,
        nodes: {
            ...document.nodes,
            [node.id]: {
                ...node,
                width: nextWidth,
                height: nextHeight,
            },
        },
    };
}

function expandAutoLayoutFramesFromNode(document: DesignDocumentSnapshot, nodeId: string): DesignDocumentSnapshot {
    let nextDocument = document;
    let currentNodeId: string | null = nodeId;

    while (currentNodeId) {
        nextDocument = expandAutoLayoutFrameToFitChildren(nextDocument, currentNodeId);
        currentNodeId = nextDocument.nodes[currentNodeId]?.parentId ?? null;
    }

    return nextDocument;
}

function mergeNodeStyle(currentStyle: DesignNodeStyle, patch: DesignNodePatch["style"]): DesignNodeStyle {
    if (!patch) {
        return currentStyle;
    }

    return {
        ...currentStyle,
        ...patch,
        typography: patch.typography
            ? {
                ...(currentStyle.typography ?? designEditorDefaults.typography),
                ...patch.typography,
            }
            : currentStyle.typography,
        image: patch.image
            ? {
                ...(currentStyle.image ?? {
                    src: "placeholder://image",
                    objectFit: "cover",
                }),
                ...patch.image,
            }
            : currentStyle.image,
        shadow:
            patch.shadow === null
                ? null
                : patch.shadow
                    ? {
                        ...(currentStyle.shadow ?? designEditorDefaults.shadows.mergeFallback),
                        ...patch.shadow,
                    }
                    : currentStyle.shadow,
    };
}

function mergeNodeSizing(currentSizing: DesignNodeSizing, patch: DesignNodePatch["sizing"]): DesignNodeSizing {
    if (!patch) {
        return currentSizing;
    }

    return {
        width: patch.width
            ? {
                ...currentSizing.width,
                ...patch.width,
            }
            : currentSizing.width,
        height: patch.height
            ? {
                ...currentSizing.height,
                ...patch.height,
            }
            : currentSizing.height,
    };
}

function applyNodePatch(node: DesignNode, patch: DesignNodePatch): DesignNode {
    const { style, padding, autoLayout, sizing, ...nodePatch } = patch;
    const nextNode: DesignNode = {
        ...node,
        ...nodePatch,
        sizing: mergeNodeSizing(node.sizing, sizing),
        style: mergeNodeStyle(node.style, style),
    } as DesignNode;

    if (node.type === "frame" && padding) {
        const nextFrameNode = nextNode as typeof node;

        nextFrameNode.padding = {
            ...node.padding,
            ...padding,
        };
    }

    if (node.type === "frame" && autoLayout) {
        const nextFrameNode = nextNode as typeof node;

        nextFrameNode.autoLayout = {
            ...node.autoLayout,
            ...autoLayout,
            padding: {
                ...node.autoLayout.padding,
                ...(autoLayout.padding ?? {}),
            },
        };
    }

    if (node.type !== "text" && "text" in nextNode) {
        delete (nextNode as { text?: string }).text;
    }

    if (node.type !== "image" && "src" in nextNode) {
        delete (nextNode as { src?: string }).src;
    }

    if (JSON.stringify(nextNode) === JSON.stringify(node)) {
        return node;
    }

    return nextNode;
}

function collectSubtreeIds(document: DesignDocumentSnapshot, nodeId: string): string[] {
    const node = document.nodes[nodeId];

    if (!node) {
        return [];
    }

    return [nodeId, ...node.children.flatMap((childId) => collectSubtreeIds(document, childId))];
}

function insertChildrenAt(children: string[], nodeIds: string[], index?: number | null) {
    const nextChildren = children.filter((childId) => !nodeIds.includes(childId));
    const safeIndex = index == null ? nextChildren.length : Math.max(0, Math.min(index, nextChildren.length));

    nextChildren.splice(safeIndex, 0, ...nodeIds);
    return nextChildren;
}

function pushHistoryEntry(state: DesignDocumentStoreState, nextDocument: DesignDocumentSnapshot) {
    if (!state.document || nextDocument === state.document) {
        return state;
    }

    const nextPastDocuments = [...state.pastDocuments, state.document];

    if (nextPastDocuments.length > HISTORY_LIMIT) {
        nextPastDocuments.shift();
    }

    return {
        document: nextDocument,
        pastDocuments: nextPastDocuments,
        futureDocuments: [],
    };
}

export const useDesignDocumentStore = create<DesignDocumentStoreState>((set) => ({
    document: null,
    pastDocuments: [],
    futureDocuments: [],

    hydrateDocument: (document) => {
        set({ document, pastDocuments: [], futureDocuments: [] });
    },

    clearDocument: () => {
        set({ document: null, pastDocuments: [], futureDocuments: [] });
    },

    patchNode: (nodeId, patch) => {
        set((state) => {
            if (!state.document) {
                return state;
            }

            const currentNode = state.document.nodes[nodeId];

            if (!currentNode) {
                return state;
            }

            const switchesToAbsolute = currentNode.type === "frame"
                && currentNode.layoutMode === "auto"
                && patch.layoutMode === "absolute";
            const switchesToAuto = currentNode.type === "frame"
                && currentNode.layoutMode === "absolute"
                && patch.layoutMode === "auto";
            const normalizedPatch: DesignNodePatch = switchesToAuto
                ? {
                    ...patch,
                    sizing: {
                        width: {
                            ...(patch.sizing?.width ?? {}),
                            mode: patch.sizing?.width?.mode ?? "hug",
                        },
                        height: {
                            ...(patch.sizing?.height ?? {}),
                            mode: patch.sizing?.height?.mode ?? "hug",
                        },
                    },
                }
                : patch;
            const baseDocument = switchesToAbsolute
                ? materializeChildFrames(state.document, nodeId)
                : state.document;
            const baseNode = baseDocument.nodes[nodeId];
            const patchedNode = applyNodePatch(baseNode, normalizedPatch);

            if (patchedNode === baseNode && baseDocument === state.document) {
                return state;
            }

            let nextDocument = patchedNode === baseNode
                ? baseDocument
                : {
                    ...baseDocument,
                    nodes: {
                        ...baseDocument.nodes,
                        [nodeId]: patchedNode,
                    },
                };

            if (switchesToAuto) {
                nextDocument = materializeChildFrames(nextDocument, nodeId);
            }

            nextDocument = expandAutoLayoutFramesFromNode(nextDocument, nodeId);

            return pushHistoryEntry(state, touchDocument(nextDocument));
        });
    },

    insertNode: (node, options) => {
        set((state) => {
            const document = state.document;

            if (!document || !node.parentId || !document.nodes[node.parentId]) {
                return state;
            }

            const parentNode = document.nodes[node.parentId];

            if (!isContainerNode(parentNode)) {
                return state;
            }

            return pushHistoryEntry(state, touchDocument({
                ...document,
                nodes: {
                    ...document.nodes,
                    [node.id]: node,
                    [parentNode.id]: {
                        ...parentNode,
                        children: insertChildrenAt(parentNode.children, [node.id], options?.index),
                    },
                },
            }));
        });
    },

    insertSubtree: ({ nodes, rootNodeIds, targetParentId, insertIndex }) => {
        set((state) => {
            const document = state.document;

            if (!document || rootNodeIds.length === 0 || !document.nodes[targetParentId]) {
                return state;
            }

            const targetParent = document.nodes[targetParentId];

            if (!isContainerNode(targetParent)) {
                return state;
            }

            const nextNodes = {
                ...document.nodes,
                ...nodes,
            };

            for (const rootNodeId of rootNodeIds) {
                const rootNode = nextNodes[rootNodeId];

                if (!rootNode) {
                    continue;
                }

                nextNodes[rootNodeId] = {
                    ...rootNode,
                    parentId: targetParentId,
                };
            }

            nextNodes[targetParentId] = {
                ...targetParent,
                children: insertChildrenAt(targetParent.children, rootNodeIds, insertIndex),
            };

            return pushHistoryEntry(state, touchDocument({
                ...document,
                nodes: nextNodes,
            }));
        });
    },

    removeNode: (nodeId) => {
        set((state) => {
            const document = state.document;

            if (!document || document.rootNodeId === nodeId || !document.nodes[nodeId]) {
                return state;
            }

            const node = document.nodes[nodeId];
            const nextNodes = { ...document.nodes };
            const affectedParentIds = new Set<string>();

            for (const id of collectSubtreeIds(document, nodeId)) {
                delete nextNodes[id];
            }

            if (node.parentId && nextNodes[node.parentId] && isContainerNode(nextNodes[node.parentId])) {
                affectedParentIds.add(node.parentId);
                const parentNode = nextNodes[node.parentId] as DesignContainerNode;
                nextNodes[node.parentId] = {
                    ...parentNode,
                    children: parentNode.children.filter((childId) => childId !== nodeId),
                };
            }

            let nextDocument = {
                ...document,
                nodes: nextNodes,
            };

            for (const parentId of affectedParentIds) {
                nextDocument = expandAutoLayoutFramesFromNode(nextDocument, parentId);
            }

            return pushHistoryEntry(state, touchDocument(nextDocument));
        });
    },

    commitNodeFrame: (nodeId, frame) => {
        set((state) => {
            if (!state.document) {
                return state;
            }

            return pushHistoryEntry(
                state,
                withDocumentNode(state.document, nodeId, (node) => {
                    const frameChanged =
                        node.x !== frame.x ||
                        node.y !== frame.y ||
                        node.width !== frame.width ||
                        node.height !== frame.height ||
                        node.rotation !== frame.rotation;
                    const widthChanged = node.width !== frame.width;
                    const heightChanged = node.height !== frame.height;
                    const shouldSwitchWidthToFixed = widthChanged && node.sizing.width.mode === "fill";
                    const shouldSwitchHeightToFixed = heightChanged && node.sizing.height.mode === "fill";

                    if (!frameChanged && !shouldSwitchWidthToFixed && !shouldSwitchHeightToFixed) {
                        return node;
                    }

                    return {
                        ...node,
                        x: frame.x,
                        y: frame.y,
                        width: frame.width,
                        height: frame.height,
                        rotation: frame.rotation,
                        sizing: shouldSwitchWidthToFixed || shouldSwitchHeightToFixed
                            ? {
                                ...node.sizing,
                                width: shouldSwitchWidthToFixed
                                    ? {
                                        ...node.sizing.width,
                                        mode: "fixed",
                                    }
                                    : node.sizing.width,
                                height: shouldSwitchHeightToFixed
                                    ? {
                                        ...node.sizing.height,
                                        mode: "fixed",
                                    }
                                    : node.sizing.height,
                            }
                            : node.sizing,
                    };
                }),
            );
        });
    },

    reparentNodes: ({ nodeIds, nextParentId, absoluteFramesByNodeId, insertIndex }) => {
        set((state) => {
            const document = state.document;

            if (!document || nodeIds.length === 0) {
                return state;
            }

            const nextParent = document.nodes[nextParentId];

            if (!nextParent || !isContainerNode(nextParent) || nextParent.locked || !nextParent.visible) {
                return state;
            }

            const normalizedNodeIds = Array.from(new Set(nodeIds)).filter((nodeId) => {
                const node = document.nodes[nodeId];

                if (!node || node.id === document.rootNodeId || node.id === nextParentId) {
                    return false;
                }

                return !isAncestorNode(document, nodeId, nextParentId);
            });

            if (normalizedNodeIds.length === 0) {
                return state;
            }

            const nextNodes = { ...document.nodes };
            const affectedParentIds = new Set<string>();

            for (const nodeId of normalizedNodeIds) {
                const node = nextNodes[nodeId];

                if (!node) {
                    continue;
                }

                if (node.parentId) {
                    affectedParentIds.add(node.parentId);
                    const currentParent = nextNodes[node.parentId];

                    if (currentParent && isContainerNode(currentParent)) {
                        nextNodes[node.parentId] = {
                            ...currentParent,
                            children: currentParent.children.filter((childId) => childId !== nodeId),
                        };
                    }
                }
            }

            const freshParent = nextNodes[nextParentId];

            if (!freshParent || !isContainerNode(freshParent)) {
                return state;
            }

            nextNodes[nextParentId] = {
                ...freshParent,
                children: insertChildrenAt(freshParent.children, normalizedNodeIds, insertIndex),
            };
            affectedParentIds.add(nextParentId);

            for (const nodeId of normalizedNodeIds) {
                const node = nextNodes[nodeId];

                if (!node) {
                    continue;
                }

                const absoluteFrame = absoluteFramesByNodeId?.[nodeId] ?? getNodeAbsoluteFrame(document, nodeId);
                const localFrame = getParentLocalFrame(document, nextParentId, absoluteFrame);

                nextNodes[nodeId] = {
                    ...node,
                    parentId: nextParentId,
                    x: localFrame.x,
                    y: localFrame.y,
                    width: localFrame.width,
                    height: localFrame.height,
                    rotation: localFrame.rotation,
                };
            }

            let nextDocument = {
                ...document,
                nodes: nextNodes,
            };

            for (const parentId of affectedParentIds) {
                nextDocument = expandAutoLayoutFramesFromNode(nextDocument, parentId);
            }

            return pushHistoryEntry(state, touchDocument(nextDocument));
        });
    },

    groupNodes: (nodeIds) => {
        let nextGroupId: string | null = null;

        set((state) => {
            const document = state.document;

            if (!document || nodeIds.length < 2) {
                return state;
            }

            const normalizedNodeIds = Array.from(new Set(nodeIds)).filter((nodeId) => {
                const node = document.nodes[nodeId];
                return Boolean(node && node.id !== document.rootNodeId);
            });

            if (normalizedNodeIds.length < 2) {
                return state;
            }

            const commonParentId = getCommonParentId(document, normalizedNodeIds);

            if (!commonParentId) {
                return state;
            }

            const parentNode = document.nodes[commonParentId];

            if (!parentNode || !isContainerNode(parentNode)) {
                return state;
            }

            const bounds = getNodesAbsoluteBounds(document, normalizedNodeIds);

            if (!bounds) {
                return state;
            }

            const parentLocalFrame = getParentLocalFrame(document, commonParentId, bounds);
            const orderedNodeIds = parentNode.children.filter((childId) => normalizedNodeIds.includes(childId));

            if (orderedNodeIds.length < 2) {
                return state;
            }

            const insertionIndex = parentNode.children.findIndex((childId) => childId === orderedNodeIds[0]);
            const groupNode = createDesignFrameNode(commonParentId, parentLocalFrame);
            const nextNodes = { ...document.nodes };

            nextGroupId = groupNode.id;

            nextNodes[groupNode.id] = {
                ...groupNode,
                name: "Group Frame",
                clipContent: false,
                style: {
                    ...groupNode.style,
                    fill: designEditorDefaults.fills.transparent,
                    stroke: null,
                    strokeWidth: 0,
                    borderRadius: 0,
                    shadow: null,
                },
                children: orderedNodeIds,
            };

            nextNodes[commonParentId] = {
                ...parentNode,
                children: insertChildrenAt(parentNode.children, [groupNode.id], insertionIndex).filter((childId) => !orderedNodeIds.includes(childId)),
            };

            for (const nodeId of orderedNodeIds) {
                const currentNode = nextNodes[nodeId];

                if (!currentNode) {
                    continue;
                }

                const absoluteFrame = getNodeAbsoluteFrame(document, nodeId);

                nextNodes[nodeId] = {
                    ...currentNode,
                    parentId: groupNode.id,
                    x: absoluteFrame.x - bounds.x,
                    y: absoluteFrame.y - bounds.y,
                };
            }

            return pushHistoryEntry(state, touchDocument({
                ...document,
                nodes: nextNodes,
            }));
        });

        return nextGroupId;
    },

    undo: () => {
        set((state) => {
            const previousDocument = state.pastDocuments.at(-1);

            if (!previousDocument || !state.document) {
                return state;
            }

            const nextFutureDocuments = [state.document, ...state.futureDocuments].slice(0, HISTORY_LIMIT);

            return {
                document: previousDocument,
                pastDocuments: state.pastDocuments.slice(0, -1),
                futureDocuments: nextFutureDocuments,
            };
        });
    },
}));