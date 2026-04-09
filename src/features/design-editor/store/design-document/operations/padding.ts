import type {
    DesignDocumentSnapshot,
    DesignNode,
    DesignPadding,
} from "@/src/features/design-editor/types/design.types";

import { materializeChildFrames } from "./layout";

export function syncDirectChildrenForPaddingChange(
    document: DesignDocumentSnapshot,
    parentId: string,
    previousPadding: DesignPadding,
    nextPadding: DesignPadding,
): DesignDocumentSnapshot {
    const EDGE_EPSILON = 0.5;
    const parentNode = document.nodes[parentId];

    if (!parentNode || parentNode.type !== "frame") {
        return document;
    }

    if (parentNode.layoutMode === "auto") {
        return materializeChildFrames(document, parentId);
    }

    const deltaLeft = nextPadding.left - previousPadding.left;
    const deltaRight = nextPadding.right - previousPadding.right;
    const deltaTop = nextPadding.top - previousPadding.top;
    const deltaBottom = nextPadding.bottom - previousPadding.bottom;

    if (deltaLeft === 0 && deltaRight === 0 && deltaTop === 0 && deltaBottom === 0) {
        return document;
    }

    let nextNodes: Record<string, DesignNode> | null = null;

    for (const childId of parentNode.children) {
        const childNode = document.nodes[childId];

        if (!childNode) {
            continue;
        }

        const touchesLeft = Math.abs(childNode.x - previousPadding.left) <= EDGE_EPSILON;
        const touchesRight = Math.abs((childNode.x + childNode.width) - (parentNode.width - previousPadding.right)) <= EDGE_EPSILON;
        const touchesTop = Math.abs(childNode.y - previousPadding.top) <= EDGE_EPSILON;
        const touchesBottom = Math.abs((childNode.y + childNode.height) - (parentNode.height - previousPadding.bottom)) <= EDGE_EPSILON;

        let nextX = childNode.x;
        let nextY = childNode.y;

        if (childNode.sizing.width.mode !== "fill") {
            if (touchesLeft) {
                nextX += deltaLeft;
            }

            if (touchesRight) {
                nextX -= deltaRight;
            }
        }

        if (childNode.sizing.height.mode !== "fill") {
            if (touchesTop) {
                nextY += deltaTop;
            }

            if (touchesBottom) {
                nextY -= deltaBottom;
            }
        }

        if (nextX === childNode.x && nextY === childNode.y) {
            continue;
        }

        nextNodes ??= { ...document.nodes };
        nextNodes[childId] = {
            ...childNode,
            x: nextX,
            y: nextY,
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