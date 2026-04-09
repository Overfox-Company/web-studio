import type { DesignDocumentSnapshot, DesignNode } from "@/src/features/design-editor/types/design.types";
import type { DesignCandidateInsertionMode, DesignFrame, DesignPoint } from "@/src/features/design-editor/types/interaction.types";
import { getNodeAbsoluteFrame, getNodeDepth, isAncestorNode, isAutoLayoutFrame, isContainerNode } from "@/src/features/design-editor/utils/design-tree";

interface ResolveDropTargetOptions {
    document: DesignDocumentSnapshot;
    draggedNodeId: string;
    previewAbsoluteFrame: DesignFrame;
    pointerPosition: DesignPoint | null;
}

interface DropTargetResolution {
    activeContainerId: string | null;
    candidateParentId: string | null;
    candidateInsertionMode: DesignCandidateInsertionMode | null;
    candidateInsertionIndex: number | null;
}

function containsPoint(frame: DesignFrame, point: DesignPoint | null) {
    if (!point) {
        return false;
    }

    return (
        point.x >= frame.x &&
        point.x <= frame.x + frame.width &&
        point.y >= frame.y &&
        point.y <= frame.y + frame.height
    );
}

function getPreviewCenter(frame: DesignFrame): DesignPoint {
    return {
        x: frame.x + frame.width / 2,
        y: frame.y + frame.height / 2,
    };
}

function canAcceptDropTarget(document: DesignDocumentSnapshot, draggedNodeId: string, node: DesignNode) {
    if (!isContainerNode(node) || node.locked || !node.visible) {
        return false;
    }

    if (node.id === draggedNodeId) {
        return false;
    }

    return !isAncestorNode(document, draggedNodeId, node.id);
}

function getAutoLayoutInsertionIndex(
    document: DesignDocumentSnapshot,
    containerId: string,
    draggedNodeId: string,
    previewAbsoluteFrame: DesignFrame,
) {
    const container = document.nodes[containerId];

    if (!container || !isAutoLayoutFrame(container)) {
        return null;
    }

    const siblings = container.children.filter((childId) => childId !== draggedNodeId && document.nodes[childId]?.visible);

    if (siblings.length === 0) {
        return 0;
    }

    const previewCenter =
        container.autoLayout.direction === "horizontal"
            ? previewAbsoluteFrame.x + previewAbsoluteFrame.width / 2
            : previewAbsoluteFrame.y + previewAbsoluteFrame.height / 2;

    for (let index = 0; index < siblings.length; index += 1) {
        const siblingAbsoluteFrame = getNodeAbsoluteFrame(document, siblings[index]);
        const siblingCenter =
            container.autoLayout.direction === "horizontal"
                ? siblingAbsoluteFrame.x + siblingAbsoluteFrame.width / 2
                : siblingAbsoluteFrame.y + siblingAbsoluteFrame.height / 2;

        if (previewCenter < siblingCenter) {
            return index;
        }
    }

    return siblings.length;
}

export function resolveDropTarget({
    document,
    draggedNodeId,
    previewAbsoluteFrame,
    pointerPosition,
}: ResolveDropTargetOptions): DropTargetResolution {
    const currentParentId = document.nodes[draggedNodeId]?.parentId ?? null;
    const previewCenter = getPreviewCenter(previewAbsoluteFrame);

    const candidateContainers = Object.values(document.nodes)
        .filter((node) => canAcceptDropTarget(document, draggedNodeId, node))
        .map((node) => ({
            node,
            absoluteFrame: getNodeAbsoluteFrame(document, node.id),
            depth: getNodeDepth(document, node.id),
        }))
        .sort((left, right) => {
            if (right.depth !== left.depth) {
                return right.depth - left.depth;
            }

            return left.absoluteFrame.width * left.absoluteFrame.height - right.absoluteFrame.width * right.absoluteFrame.height;
        });

    const matchingContainers = candidateContainers.filter(({ absoluteFrame }) => containsPoint(absoluteFrame, pointerPosition));
    const resolvedContainers = matchingContainers.length > 0
        ? matchingContainers
        : candidateContainers.filter(({ absoluteFrame }) => containsPoint(absoluteFrame, previewCenter));

    const activeContainer = resolvedContainers[0]?.node ?? null;
    const isAutoLayoutTarget = Boolean(activeContainer && activeContainer.type === "frame" && activeContainer.layoutMode === "auto");
    const candidateParentId = activeContainer
        ? isAutoLayoutTarget
            ? activeContainer.id
            : activeContainer.id !== currentParentId
                ? activeContainer.id
                : null
        : null;
    const candidateInsertionIndex =
        candidateParentId && isAutoLayoutTarget
            ? getAutoLayoutInsertionIndex(document, candidateParentId, draggedNodeId, previewAbsoluteFrame)
            : null;

    return {
        activeContainerId: activeContainer?.id ?? null,
        candidateParentId,
        candidateInsertionMode: candidateParentId ? (isAutoLayoutTarget ? "auto-layout" : "inside") : null,
        candidateInsertionIndex,
    };
}