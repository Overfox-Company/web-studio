import {
    getNodeAbsoluteFrame,
    getNodeLocalFrame,
    isContainerNode,
} from "@/src/features/design-editor/utils/design-tree";
import type {
    DesignDocumentSnapshot,
    DesignNode,
} from "@/src/features/design-editor/types/design.types";

export function materializeChildFrames(document: DesignDocumentSnapshot, parentId: string): DesignDocumentSnapshot {
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
    const nextWidth = node.sizing.width.mode === "hug"
        ? Math.max(1, requiredWidth)
        : node.sizing.width.mode === "fill"
            ? Math.max(node.width, requiredWidth)
            : node.width;
    const nextHeight = node.sizing.height.mode === "hug"
        ? Math.max(1, requiredHeight)
        : node.sizing.height.mode === "fill"
            ? Math.max(node.height, requiredHeight)
            : node.height;

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

export function expandAutoLayoutFramesFromNode(document: DesignDocumentSnapshot, nodeId: string): DesignDocumentSnapshot {
    let nextDocument = document;
    let currentNodeId: string | null = nodeId;

    while (currentNodeId) {
        nextDocument = expandAutoLayoutFrameToFitChildren(nextDocument, currentNodeId);
        currentNodeId = nextDocument.nodes[currentNodeId]?.parentId ?? null;
    }

    return nextDocument;
}

export function expandRootFrameHeightToFitContent(document: DesignDocumentSnapshot): DesignDocumentSnapshot {
    const rootNode = document.nodes[document.rootNodeId];

    if (!rootNode || rootNode.type !== "frame") {
        return document;
    }

    const rootPadding = rootNode.layoutMode === "auto" ? rootNode.autoLayout.padding : rootNode.padding;
    const rootAbsoluteFrame = getNodeAbsoluteFrame(document, rootNode.id);
    const visibleNodeIds = Object.values(document.nodes)
        .filter((node) => node.id !== rootNode.id && node.visible)
        .map((node) => node.id);
    const maxContentBottom = visibleNodeIds.length === 0
        ? rootPadding.top
        : Math.max(
            ...visibleNodeIds.map((nodeId) => {
                const frame = getNodeAbsoluteFrame(document, nodeId);
                return frame.y + frame.height;
            }),
        ) - rootAbsoluteFrame.y;
    const requiredHeight = Math.max(1, Math.max(rootPadding.top + rootPadding.bottom, maxContentBottom + rootPadding.bottom));

    if (requiredHeight <= rootNode.height) {
        return document;
    }

    return {
        ...document,
        nodes: {
            ...document.nodes,
            [rootNode.id]: {
                ...rootNode,
                height: requiredHeight,
            },
        },
    };
}