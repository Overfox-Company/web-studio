import { getNodeAbsoluteFrame, isContainerNode } from "@/src/features/design-editor/utils/design-tree";
import { buildImportedDesignNodes, targetParentUsesAutoLayout } from "@/src/features/design-editor/import/node-factory/webstudio-node-factory";
import type { ImportedAstDocument } from "@/src/features/design-editor/import/types/import.types";
import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";

interface CommitImportedContentOptions {
    document: DesignDocumentSnapshot;
    importedDocument: ImportedAstDocument;
    targetParentId: string;
    anchorPoint: { x: number; y: number };
    insertSubtree: (payload: { nodes: Record<string, import("@/src/features/design-editor/types/design.types").DesignNode>; rootNodeIds: string[]; targetParentId: string; insertIndex?: number | null }) => void;
}

export function commitImportedContent({
    document,
    importedDocument,
    targetParentId,
    anchorPoint,
    insertSubtree,
}: CommitImportedContentOptions) {
    const targetParent = document.nodes[targetParentId];

    if (!targetParent || !isContainerNode(targetParent)) {
        return [];
    }

    const targetParentAbsoluteFrame = getNodeAbsoluteFrame(document, targetParentId);
    const usesAutoLayout = targetParentUsesAutoLayout(document, targetParentId);
    const placementOffset = usesAutoLayout
        ? { x: 0, y: 0 }
        : {
            x: anchorPoint.x - targetParentAbsoluteFrame.x,
            y: anchorPoint.y - targetParentAbsoluteFrame.y,
        };
    const builtNodes = buildImportedDesignNodes({
        importedDocument,
        targetParentId,
        targetParentUsesAutoLayout: usesAutoLayout,
        placementOffset,
    });

    insertSubtree({
        nodes: builtNodes.nodes,
        rootNodeIds: builtNodes.rootNodeIds,
        targetParentId,
    });

    return builtNodes.rootNodeIds;
}