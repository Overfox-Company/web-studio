import type {
    DesignAutoLayout,
    DesignContainerNode,
    DesignDocumentSnapshot,
    DesignFrameNode,
    DesignGroupNode,
    DesignNode,
    DesignPadding,
} from "@/src/features/design-editor/types/design.types";
import type { DesignFrame } from "@/src/features/design-editor/types/interaction.types";

export interface DesignLayerItem {
    id: string;
    depth: number;
    node: DesignNode;
    hasChildren: boolean;
}

export function isFrameNode(node: DesignNode): node is DesignFrameNode {
    return node.type === "frame";
}

export function isGroupNode(node: DesignNode): node is DesignGroupNode {
    return node.type === "group";
}

export function isContainerNode(node: DesignNode): node is DesignContainerNode {
    return node.type === "frame" || node.type === "group";
}

export function isAutoLayoutFrame(node: DesignNode): node is DesignFrameNode {
    return node.type === "frame" && node.layoutMode === "auto";
}

function getMainAxisSize(frame: DesignFrame, direction: DesignAutoLayout["direction"]) {
    return direction === "horizontal" ? frame.width : frame.height;
}

function getFlexAlignmentOffset(
    availableSpace: number,
    itemSize: number,
    alignItems: DesignAutoLayout["alignItems"],
) {
    const freeSpace = Math.max(0, availableSpace - itemSize);

    switch (alignItems) {
        case "center":
            return freeSpace / 2;
        case "end":
            return freeSpace;
        default:
            return 0;
    }
}

function getAutoLayoutPadding(frameNode: DesignFrameNode): DesignPadding {
    return frameNode.autoLayout.padding;
}

function getChildBaseSize(document: DesignDocumentSnapshot, childId: string): DesignFrame {
    const childNode = document.nodes[childId];

    if (!childNode) {
        return {
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            rotation: 0,
        };
    }

    return {
        x: childNode.x,
        y: childNode.y,
        width: childNode.width,
        height: childNode.height,
        rotation: childNode.rotation,
    };
}

export function getNodeLocalFrame(document: DesignDocumentSnapshot, nodeId: string): DesignFrame {
    const node = document.nodes[nodeId];

    if (!node) {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
        };
    }

    const parentId = node.parentId;

    if (!parentId) {
        return getNodeFrame(node);
    }

    const parentNode = document.nodes[parentId];

    if (!parentNode || !isAutoLayoutFrame(parentNode)) {
        return getNodeFrame(node);
    }

    const padding = getAutoLayoutPadding(parentNode);
    const direction = parentNode.autoLayout.direction;
    const childIds = parentNode.children.filter((childId) => Boolean(document.nodes[childId]));
    const baseFrames = childIds.map((childId) => getChildBaseSize(document, childId));
    const innerWidth = Math.max(0, parentNode.width - padding.left - padding.right);
    const innerHeight = Math.max(0, parentNode.height - padding.top - padding.bottom);
    const mainAxisSize = direction === "horizontal" ? innerWidth : innerHeight;
    const baseGap = parentNode.autoLayout.gap;
    const totalMainAxisSize = baseFrames.reduce((sum, frame) => sum + getMainAxisSize(frame, direction), 0);
    const occupiedMainAxis = totalMainAxisSize + Math.max(0, childIds.length - 1) * baseGap;
    const remainingMainAxis = Math.max(0, mainAxisSize - occupiedMainAxis);
    const initialOffset =
        parentNode.autoLayout.justifyContent === "center"
            ? remainingMainAxis / 2
            : parentNode.autoLayout.justifyContent === "end"
                ? remainingMainAxis
                : 0;
    const extraDistributedGap =
        parentNode.autoLayout.justifyContent === "space-between" && childIds.length > 1
            ? remainingMainAxis / (childIds.length - 1)
            : 0;
    const gap = baseGap + extraDistributedGap;

    let cursor = initialOffset;

    for (let index = 0; index < childIds.length; index += 1) {
        const childId = childIds[index];
        const childFrame = baseFrames[index];
        const nextWidth = direction === "vertical" && parentNode.autoLayout.alignItems === "stretch" ? innerWidth : childFrame.width;
        const nextHeight = direction === "horizontal" && parentNode.autoLayout.alignItems === "stretch" ? innerHeight : childFrame.height;
        const localFrame = {
            x:
                direction === "horizontal"
                    ? padding.left + cursor
                    : padding.left + getFlexAlignmentOffset(innerWidth, nextWidth, parentNode.autoLayout.alignItems),
            y:
                direction === "horizontal"
                    ? padding.top + getFlexAlignmentOffset(innerHeight, nextHeight, parentNode.autoLayout.alignItems)
                    : padding.top + cursor,
            width: nextWidth,
            height: nextHeight,
            rotation: childFrame.rotation,
        };

        if (childId === nodeId) {
            return localFrame;
        }

        cursor += getMainAxisSize(localFrame, direction) + gap;
    }

    return getNodeFrame(node);
}

export function getNodeFrame(node: DesignNode): DesignFrame {
    return {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        rotation: node.rotation,
    };
}

export function framesEqual(left: DesignFrame, right: DesignFrame) {
    return (
        left.x === right.x &&
        left.y === right.y &&
        left.width === right.width &&
        left.height === right.height &&
        left.rotation === right.rotation
    );
}

export function getFrameBounds(frames: DesignFrame[]): DesignFrame | null {
    if (frames.length === 0) {
        return null;
    }

    const left = Math.min(...frames.map((frame) => frame.x));
    const top = Math.min(...frames.map((frame) => frame.y));
    const right = Math.max(...frames.map((frame) => frame.x + frame.width));
    const bottom = Math.max(...frames.map((frame) => frame.y + frame.height));

    return {
        x: left,
        y: top,
        width: Math.max(1, right - left),
        height: Math.max(1, bottom - top),
        rotation: 0,
    };
}

export function getNodeAbsoluteFrame(document: DesignDocumentSnapshot, nodeId: string): DesignFrame {
    const node = document.nodes[nodeId];

    if (!node) {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
        };
    }

    const localFrame = getNodeLocalFrame(document, nodeId);
    let x = localFrame.x;
    let y = localFrame.y;
    let parentId = node.parentId;

    while (parentId) {
        const parentNode = document.nodes[parentId];

        if (!parentNode) {
            break;
        }

        const parentFrame = getNodeLocalFrame(document, parentId);

        x += parentFrame.x;
        y += parentFrame.y;
        parentId = parentNode.parentId;
    }

    return {
        x,
        y,
        width: localFrame.width,
        height: localFrame.height,
        rotation: localFrame.rotation,
    };
}

export function getNodesAbsoluteBounds(document: DesignDocumentSnapshot, nodeIds: string[]): DesignFrame | null {
    return getFrameBounds(nodeIds.map((nodeId) => getNodeAbsoluteFrame(document, nodeId)).filter((frame) => frame.width > 0 && frame.height > 0));
}

export function getParentLocalFrame(document: DesignDocumentSnapshot, parentId: string, absoluteFrame: DesignFrame): DesignFrame {
    const parentAbsoluteFrame = getNodeAbsoluteFrame(document, parentId);

    return {
        x: absoluteFrame.x - parentAbsoluteFrame.x,
        y: absoluteFrame.y - parentAbsoluteFrame.y,
        width: absoluteFrame.width,
        height: absoluteFrame.height,
        rotation: absoluteFrame.rotation,
    };
}

export function getCommonParentId(document: DesignDocumentSnapshot, nodeIds: string[]): string | null {
    const parentIds = new Set(
        nodeIds
            .map((nodeId) => document.nodes[nodeId]?.parentId ?? null)
            .filter((parentId): parentId is string => Boolean(parentId)),
    );

    return parentIds.size === 1 ? Array.from(parentIds)[0] ?? null : null;
}

export function getNodeDepth(document: DesignDocumentSnapshot, nodeId: string): number {
    let depth = 0;
    let currentParentId = document.nodes[nodeId]?.parentId ?? null;

    while (currentParentId) {
        depth += 1;
        currentParentId = document.nodes[currentParentId]?.parentId ?? null;
    }

    return depth;
}

export function isAncestorNode(document: DesignDocumentSnapshot, ancestorId: string, nodeId: string): boolean {
    let currentParentId = document.nodes[nodeId]?.parentId ?? null;

    while (currentParentId) {
        if (currentParentId === ancestorId) {
            return true;
        }

        currentParentId = document.nodes[currentParentId]?.parentId ?? null;
    }

    return false;
}

export function getCreateParentId(document: DesignDocumentSnapshot, selectedNodeId: string | null) {
    if (selectedNodeId) {
        const selectedNode = document.nodes[selectedNodeId];

        if (selectedNode && isFrameNode(selectedNode)) {
            return selectedNode.id;
        }
    }

    return document.rootNodeId;
}

export function buildLayerItems(
    document: DesignDocumentSnapshot,
    nodeId: string,
    collapsedLayerIds: string[],
    depth = 0,
    items: DesignLayerItem[] = [],
) {
    const node = document.nodes[nodeId];

    if (!node) {
        return items;
    }

    const hasChildren = node.children.length > 0;

    items.push({
        id: node.id,
        depth,
        node,
        hasChildren,
    });

    if (hasChildren && !collapsedLayerIds.includes(node.id)) {
        for (const childId of node.children) {
            buildLayerItems(document, childId, collapsedLayerIds, depth + 1, items);
        }
    }

    return items;
}