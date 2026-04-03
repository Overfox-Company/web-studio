import { create } from "zustand";

import { createDesignGroupNode } from "@/src/features/design-editor/utils/create-design-node";
import {
    getCommonParentId,
    getNodeAbsoluteFrame,
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
    DesignNode,
    DesignNodeStyle,
    DesignPadding,
    DesignShadow,
    DesignTypography,
} from "@/src/features/design-editor/types/design.types";
import type { DesignFrame } from "@/src/features/design-editor/types/interaction.types";

interface InsertNodeOptions {
    index?: number | null;
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
    removeNode: (nodeId: string) => void;
    commitNodeFrame: (nodeId: string, frame: DesignFrame) => void;
    reparentNodes: (payload: ReparentNodesPayload) => void;
    groupNodes: (nodeIds: string[]) => string | null;
}

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

function mergeNodeStyle(currentStyle: DesignNodeStyle, patch: DesignNodePatch["style"]): DesignNodeStyle {
    if (!patch) {
        return currentStyle;
    }

    return {
        ...currentStyle,
        ...patch,
        typography: patch.typography
            ? {
                ...(currentStyle.typography ?? {
                    fontFamily: "var(--font-ibm-plex-sans)",
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    textAlign: "left",
                    color: "#0f172a",
                }),
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
                        ...(currentStyle.shadow ?? {
                            x: 0,
                            y: 12,
                            blur: 24,
                            spread: -12,
                            color: "rgba(15, 23, 42, 0.18)",
                        }),
                        ...patch.shadow,
                    }
                    : currentStyle.shadow,
    };
}

function applyNodePatch(node: DesignNode, patch: DesignNodePatch): DesignNode {
    const { style, padding, autoLayout, ...nodePatch } = patch;
    const nextNode: DesignNode = {
        ...node,
        ...nodePatch,
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

export const useDesignDocumentStore = create<DesignDocumentStore>((set) => ({
    document: null,

    hydrateDocument: (document) => {
        set({ document });
    },

    clearDocument: () => {
        set({ document: null });
    },

    patchNode: (nodeId, patch) => {
        set((state) => {
            if (!state.document) {
                return state;
            }

            return {
                document: withDocumentNode(state.document, nodeId, (node) => applyNodePatch(node, patch)),
            };
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

            return {
                document: touchDocument({
                    ...document,
                    nodes: {
                        ...document.nodes,
                        [node.id]: node,
                        [parentNode.id]: {
                            ...parentNode,
                            children: insertChildrenAt(parentNode.children, [node.id], options?.index),
                        },
                    },
                }),
            };
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

            for (const id of collectSubtreeIds(document, nodeId)) {
                delete nextNodes[id];
            }

            if (node.parentId && nextNodes[node.parentId] && isContainerNode(nextNodes[node.parentId])) {
                const parentNode = nextNodes[node.parentId] as DesignContainerNode;
                nextNodes[node.parentId] = {
                    ...parentNode,
                    children: parentNode.children.filter((childId) => childId !== nodeId),
                };
            }

            return {
                document: touchDocument({
                    ...document,
                    nodes: nextNodes,
                }),
            };
        });
    },

    commitNodeFrame: (nodeId, frame) => {
        set((state) => {
            if (!state.document) {
                return state;
            }

            return {
                document: withDocumentNode(state.document, nodeId, (node) => ({
                    ...(node.x === frame.x &&
                        node.y === frame.y &&
                        node.width === frame.width &&
                        node.height === frame.height &&
                        node.rotation === frame.rotation
                        ? node
                        : {
                            ...node,
                            x: frame.x,
                            y: frame.y,
                            width: frame.width,
                            height: frame.height,
                            rotation: frame.rotation,
                        }),
                })),
            };
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

            for (const nodeId of normalizedNodeIds) {
                const node = nextNodes[nodeId];

                if (!node) {
                    continue;
                }

                if (node.parentId) {
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

            return {
                document: touchDocument({
                    ...document,
                    nodes: nextNodes,
                }),
            };
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
            const groupNode = createDesignGroupNode(commonParentId, parentLocalFrame);
            const nextNodes = { ...document.nodes };

            nextGroupId = groupNode.id;

            nextNodes[groupNode.id] = {
                ...groupNode,
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

            return {
                document: touchDocument({
                    ...document,
                    nodes: nextNodes,
                }),
            };
        });

        return nextGroupId;
    },
}));