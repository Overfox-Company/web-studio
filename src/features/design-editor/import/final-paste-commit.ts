import { getNodeAbsoluteFrame, getNodesAbsoluteBounds, isContainerNode } from "@/src/features/design-editor/utils/design-tree";
import { buildImportedDesignNodes, computeImportedBounds, targetParentUsesAutoLayout } from "@/src/features/design-editor/import/node-factory/webstudio-node-factory";
import type { ImportedAstDocument } from "@/src/features/design-editor/import/types/import.types";
import type { DesignDocumentSnapshot, DesignNode } from "@/src/features/design-editor/types/design.types";

interface CommitImportedContentOptions {
    document: DesignDocumentSnapshot;
    importedDocument: ImportedAstDocument;
    targetParentId: string;
    anchorPoint: { x: number; y: number };
    insertSubtree: (payload: { nodes: Record<string, import("@/src/features/design-editor/types/design.types").DesignNode>; rootNodeIds: string[]; targetParentId: string; insertIndex?: number | null }) => void;
}

function getParentPadding(node: DesignNode) {
    if (node.type !== "frame") {
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    return node.layoutMode === "auto" ? node.autoLayout.padding : node.padding;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function resolveFreePastePlacement(
    document: DesignDocumentSnapshot,
    targetParentId: string,
    importedDocument: ImportedAstDocument,
    anchorPoint: { x: number; y: number },
) {
    const targetParent = document.nodes[targetParentId];

    if (!targetParent || !isContainerNode(targetParent)) {
        return { x: 0, y: 0 };
    }

    const importedBounds = computeImportedBounds(importedDocument.roots);
    const parentPadding = getParentPadding(targetParent);
    const parentAbsoluteFrame = getNodeAbsoluteFrame(document, targetParentId);
    const innerLeft = parentPadding.left;
    const innerTop = parentPadding.top;
    const innerRight = Math.max(innerLeft, targetParent.width - parentPadding.right);
    const innerBottom = Math.max(innerTop, targetParent.height - parentPadding.bottom);
    const placementGap = 24;
    const visibleChildIds = targetParent.children.filter((childId) => document.nodes[childId]?.visible);

    if (visibleChildIds.length === 0) {
        return {
            x: innerLeft,
            y: innerTop,
        };
    }

    const siblingBounds = getNodesAbsoluteBounds(document, visibleChildIds);

    if (!siblingBounds) {
        return {
            x: innerLeft,
            y: innerTop,
        };
    }

    const occupiedLeft = siblingBounds.x - parentAbsoluteFrame.x;
    const occupiedTop = siblingBounds.y - parentAbsoluteFrame.y;
    const occupiedRight = occupiedLeft + siblingBounds.width;
    const occupiedBottom = occupiedTop + siblingBounds.height;
    const rightCandidateX = occupiedRight + placementGap;
    const bottomCandidateY = occupiedBottom + placementGap;
    const availableRightSpace = innerRight - rightCandidateX;
    const availableBottomSpace = innerBottom - bottomCandidateY;
    const fitsRight = availableRightSpace >= importedBounds.width;
    const fitsBottom = availableBottomSpace >= importedBounds.height;

    if (fitsRight && (!fitsBottom || availableRightSpace >= availableBottomSpace)) {
        return {
            x: rightCandidateX,
            y: clamp(occupiedTop, innerTop, Math.max(innerTop, innerBottom - importedBounds.height)),
        };
    }

    if (fitsBottom) {
        return {
            x: clamp(occupiedLeft, innerLeft, Math.max(innerLeft, innerRight - importedBounds.width)),
            y: bottomCandidateY,
        };
    }

    return {
        x: clamp(anchorPoint.x - parentAbsoluteFrame.x, innerLeft, Math.max(innerLeft, innerRight - importedBounds.width)),
        y: clamp(anchorPoint.y - parentAbsoluteFrame.y, innerTop, Math.max(innerTop, innerBottom - importedBounds.height)),
    };
}

export function commitImportedContent({
    document,
    importedDocument,
    targetParentId,
    anchorPoint,
    insertSubtree,
}: CommitImportedContentOptions) {
    const targetParent = document.nodes[targetParentId];

    console.log("[DesignClipboard] commitImportedContent:start", {
        targetParentId,
        anchorPoint,
        importedRootCount: importedDocument.roots.length,
    });

    if (!targetParent || !isContainerNode(targetParent)) {
        console.log("[DesignClipboard] commitImportedContent:invalid-target-parent");
        return [];
    }

    const usesAutoLayout = targetParentUsesAutoLayout(document, targetParentId);
    const placementOffset = usesAutoLayout
        ? { x: 0, y: 0 }
        : resolveFreePastePlacement(document, targetParentId, importedDocument, anchorPoint);
    const builtNodes = buildImportedDesignNodes({
        importedDocument,
        targetParentId,
        targetParentUsesAutoLayout: usesAutoLayout,
        placementOffset,
    });

    console.log("[DesignClipboard] commitImportedContent:built-nodes", {
        rootNodeIds: builtNodes.rootNodeIds,
        nodeCount: Object.keys(builtNodes.nodes).length,
        usesAutoLayout,
        placementOffset,
    });

    insertSubtree({
        nodes: builtNodes.nodes,
        rootNodeIds: builtNodes.rootNodeIds,
        targetParentId,
    });

    console.log("[DesignClipboard] commitImportedContent:inserted", {
        rootNodeIds: builtNodes.rootNodeIds,
    });

    return builtNodes.rootNodeIds;
}