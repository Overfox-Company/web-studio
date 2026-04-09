import { designEditorDefaults } from "@/src/customization/design-editor";
import type {
    DesignContainerNode,
    DesignDocumentSnapshot,
    DesignNode,
} from "@/src/features/design-editor/types/design.types";
import type { DesignFrame } from "@/src/features/design-editor/types/interaction.types";
import { createDesignFrameNode } from "@/src/features/design-editor/utils/create-design-node";
import {
    getCommonParentId,
    getNodeAbsoluteFrame,
    getNodesAbsoluteBounds,
    getParentLocalFrame,
    isAncestorNode,
    isContainerNode,
} from "@/src/features/design-editor/utils/design-tree";

import type {
    InsertNodeOptions,
    InsertSubtreePayload,
    ReparentNodesPayload,
} from "../design-document.types";
import { expandAutoLayoutFramesFromNode } from "./layout";

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

export function insertNodeInDocument(document: DesignDocumentSnapshot, node: DesignNode, options?: InsertNodeOptions): DesignDocumentSnapshot {
    if (!node.parentId || !document.nodes[node.parentId]) {
        return document;
    }

    const parentNode = document.nodes[node.parentId];

    if (!isContainerNode(parentNode)) {
        return document;
    }

    return {
        ...document,
        nodes: {
            ...document.nodes,
            [node.id]: node,
            [parentNode.id]: {
                ...parentNode,
                children: insertChildrenAt(parentNode.children, [node.id], options?.index),
            },
        },
    };
}

export function insertSubtreeInDocument(
    document: DesignDocumentSnapshot,
    { nodes, rootNodeIds, targetParentId, insertIndex }: InsertSubtreePayload,
): DesignDocumentSnapshot {
    if (rootNodeIds.length === 0 || !document.nodes[targetParentId]) {
        return document;
    }

    const targetParent = document.nodes[targetParentId];

    if (!isContainerNode(targetParent)) {
        return document;
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

    return {
        ...document,
        nodes: nextNodes,
    };
}

export function removeNodeFromDocument(document: DesignDocumentSnapshot, nodeId: string): DesignDocumentSnapshot {
    if (document.rootNodeId === nodeId || !document.nodes[nodeId]) {
        return document;
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

    return nextDocument;
}

export function reparentNodesInDocument(
    document: DesignDocumentSnapshot,
    { nodeIds, nextParentId, absoluteFramesByNodeId, insertIndex }: ReparentNodesPayload,
): DesignDocumentSnapshot {
    if (nodeIds.length === 0) {
        return document;
    }

    const nextParent = document.nodes[nextParentId];

    if (!nextParent || !isContainerNode(nextParent) || nextParent.locked || !nextParent.visible) {
        return document;
    }

    const normalizedNodeIds = Array.from(new Set(nodeIds)).filter((nodeId) => {
        const node = document.nodes[nodeId];

        if (!node || node.id === document.rootNodeId || node.id === nextParentId) {
            return false;
        }

        return !isAncestorNode(document, nodeId, nextParentId);
    });

    if (normalizedNodeIds.length === 0) {
        return document;
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
        return document;
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

    return nextDocument;
}

export interface GroupNodesResult {
    document: DesignDocumentSnapshot;
    groupId: string | null;
}

export function groupNodesInDocument(document: DesignDocumentSnapshot, nodeIds: string[]): GroupNodesResult {
    const normalizedNodeIds = Array.from(new Set(nodeIds)).filter((nodeId) => {
        const node = document.nodes[nodeId];
        return Boolean(node && node.id !== document.rootNodeId);
    });

    if (normalizedNodeIds.length < 2) {
        return {
            document,
            groupId: null,
        };
    }

    const commonParentId = getCommonParentId(document, normalizedNodeIds);

    if (!commonParentId) {
        return {
            document,
            groupId: null,
        };
    }

    const parentNode = document.nodes[commonParentId];

    if (!parentNode || !isContainerNode(parentNode)) {
        return {
            document,
            groupId: null,
        };
    }

    const bounds = getNodesAbsoluteBounds(document, normalizedNodeIds);

    if (!bounds) {
        return {
            document,
            groupId: null,
        };
    }

    const parentLocalFrame = getParentLocalFrame(document, commonParentId, bounds);
    const orderedNodeIds = parentNode.children.filter((childId) => normalizedNodeIds.includes(childId));

    if (orderedNodeIds.length < 2) {
        return {
            document,
            groupId: null,
        };
    }

    const insertionIndex = parentNode.children.findIndex((childId) => childId === orderedNodeIds[0]);
    const groupNode = createDesignFrameNode(commonParentId, parentLocalFrame);
    const nextNodes = { ...document.nodes };

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

    return {
        document: {
            ...document,
            nodes: nextNodes,
        },
        groupId: groupNode.id,
    };
}