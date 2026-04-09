import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import type { DesignFrame } from "@/src/features/design-editor/types/interaction.types";

export function commitNodeFrameInDocument(document: DesignDocumentSnapshot, nodeId: string, frame: DesignFrame): DesignDocumentSnapshot {
    const node = document.nodes[nodeId];

    if (!node) {
        return document;
    }

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
        return document;
    }

    return {
        ...document,
        nodes: {
            ...document.nodes,
            [nodeId]: {
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
            },
        },
    };
}