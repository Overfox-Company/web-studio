import type {
    DesignDocumentSnapshot,
    DesignImageNode,
    DesignNode,
    DesignSvgAssetNode,
    DesignTextNode,
} from "@/src/features/design-editor/types/design.types";
import type { DesignPreviewSnapshot } from "@/src/features/design-editor/preview/preview.types";

function serializeNode(node: DesignNode): DesignNode {
    const baseNode = {
        id: node.id,
        type: node.type,
        name: node.name,
        parentId: node.parentId,
        children: [...node.children],
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        sizing: {
            width: {
                ...node.sizing.width,
            },
            height: {
                ...node.sizing.height,
            },
        },
        rotation: node.rotation,
        visible: node.visible,
        locked: node.locked,
        style: {
            fill: node.style.fill,
            stroke: node.style.stroke,
            strokeWidth: node.style.strokeWidth,
            borderRadius: node.style.borderRadius,
            opacity: node.style.opacity,
            shadow: node.style.shadow
                ? {
                    ...node.style.shadow,
                }
                : null,
            typography: node.style.typography
                ? {
                    ...node.style.typography,
                }
                : undefined,
            image: node.style.image
                ? {
                    ...node.style.image,
                }
                : undefined,
        },
    };

    switch (node.type) {
        case "frame":
            return {
                ...baseNode,
                type: node.type,
                clipContent: node.clipContent,
                padding: {
                    ...node.padding,
                },
                layoutMode: node.layoutMode,
                autoLayout: {
                    ...node.autoLayout,
                    padding: {
                        ...node.autoLayout.padding,
                    },
                },
            };
        case "text":
            return {
                ...baseNode,
                type: node.type,
                text: (node as DesignTextNode).text,
            };
        case "image":
            return {
                ...baseNode,
                type: node.type,
                src: (node as DesignImageNode).src,
            };
        case "svg-asset":
            return {
                ...baseNode,
                type: node.type,
                svgMarkup: (node as DesignSvgAssetNode).svgMarkup,
                viewBox: (node as DesignSvgAssetNode).viewBox,
            };
        case "group":
        case "rectangle":
        default:
            return baseNode as DesignNode;
    }
}

export function serializeDesignDocumentForPreview(document: DesignDocumentSnapshot): DesignPreviewSnapshot {
    return {
        id: document.id,
        viewNodeId: document.viewNodeId,
        name: document.name,
        rootNodeId: document.rootNodeId,
        version: document.version,
        updatedAt: document.updatedAt,
        nodes: Object.fromEntries(
            Object.entries(document.nodes).map(([nodeId, node]) => [nodeId, serializeNode(node)]),
        ),
    };
}