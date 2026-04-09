import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import { getNodeAbsoluteFrame, isAncestorNode, isContainerNode } from "@/src/features/design-editor/utils/design-tree";

export type LayerDropMode = "before" | "inside" | "after";

export interface LayerDropTarget {
    targetNodeId: string;
    mode: LayerDropMode;
}

export interface ResolvedLayerDrop {
    nodeIds: string[];
    nextParentId: string;
    insertIndex: number;
    absoluteFramesByNodeId: Record<string, ReturnType<typeof getNodeAbsoluteFrame>>;
}

export function getDraggedLayerNodeIds(draggedNodeId: string, selectedNodeIds: string[]) {
    if (selectedNodeIds.includes(draggedNodeId)) {
        return selectedNodeIds;
    }

    return [draggedNodeId];
}

export function resolveLayerDrop(
    document: DesignDocumentSnapshot,
    draggedNodeIds: string[],
    dropTarget: LayerDropTarget,
): ResolvedLayerDrop | null {
    const targetNode = document.nodes[dropTarget.targetNodeId];

    if (!targetNode) {
        return null;
    }

    const normalizedNodeIds = Array.from(new Set(draggedNodeIds)).filter((nodeId) => {
        const node = document.nodes[nodeId];

        if (!node || node.id === document.rootNodeId || node.id === dropTarget.targetNodeId) {
            return false;
        }

        return true;
    });

    if (normalizedNodeIds.length === 0) {
        return null;
    }

    let nextParentId: string;
    let insertIndexPreRemoval: number;
    let targetParentChildren: string[];

    if (dropTarget.mode === "inside") {
        if (!isContainerNode(targetNode)) {
            return null;
        }

        nextParentId = targetNode.id;
        targetParentChildren = targetNode.children;
        insertIndexPreRemoval = targetNode.children.length;
    } else {
        if (!targetNode.parentId) {
            return null;
        }

        const parentNode = document.nodes[targetNode.parentId];

        if (!parentNode || !isContainerNode(parentNode)) {
            return null;
        }

        nextParentId = parentNode.id;
        targetParentChildren = parentNode.children;

        const targetIndex = parentNode.children.indexOf(targetNode.id);

        if (targetIndex < 0) {
            return null;
        }

        insertIndexPreRemoval = dropTarget.mode === "before" ? targetIndex + 1 : targetIndex;
    }

    const validatedNodeIds = normalizedNodeIds.filter((nodeId) => {
        if (nodeId === nextParentId) {
            return false;
        }

        return !isAncestorNode(document, nodeId, nextParentId);
    });

    if (validatedNodeIds.length === 0) {
        return null;
    }

    const removedBeforeInsert = validatedNodeIds.reduce((count, nodeId) => {
        const node = document.nodes[nodeId];

        if (!node || node.parentId !== nextParentId) {
            return count;
        }

        const sourceIndex = targetParentChildren.indexOf(nodeId);

        if (sourceIndex < 0 || sourceIndex >= insertIndexPreRemoval) {
            return count;
        }

        return count + 1;
    }, 0);
    const insertIndex = Math.max(0, insertIndexPreRemoval - removedBeforeInsert);

    return {
        nodeIds: validatedNodeIds,
        nextParentId,
        insertIndex,
        absoluteFramesByNodeId: Object.fromEntries(validatedNodeIds.map((nodeId) => [nodeId, getNodeAbsoluteFrame(document, nodeId)])),
    };
}