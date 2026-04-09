import { designEditorDefaults } from "@/src/customization/design-editor";
import type {
    DesignNode,
    DesignNodeSizing,
    DesignNodeStyle,
} from "@/src/features/design-editor/types/design.types";

import type { DesignNodePatch } from "../design-document.types";

function mergeNodeStyle(currentStyle: DesignNodeStyle, patch: DesignNodePatch["style"]): DesignNodeStyle {
    if (!patch) {
        return currentStyle;
    }

    return {
        ...currentStyle,
        ...patch,
        typography: patch.typography
            ? {
                ...(currentStyle.typography ?? designEditorDefaults.typography),
                ...patch.typography,
            }
            : currentStyle.typography,
        image: patch.image
            ? {
                ...(currentStyle.image ?? {
                    src: "placeholder://image",
                    objectFit: "cover",
                }),
                ...patch.image,
            }
            : currentStyle.image,
        shadow:
            patch.shadow === null
                ? null
                : patch.shadow
                    ? {
                        ...(currentStyle.shadow ?? designEditorDefaults.shadows.mergeFallback),
                        ...patch.shadow,
                    }
                    : currentStyle.shadow,
    };
}

function mergeNodeSizing(currentSizing: DesignNodeSizing, patch: DesignNodePatch["sizing"]): DesignNodeSizing {
    if (!patch) {
        return currentSizing;
    }

    return {
        width: patch.width
            ? {
                ...currentSizing.width,
                ...patch.width,
            }
            : currentSizing.width,
        height: patch.height
            ? {
                ...currentSizing.height,
                ...patch.height,
            }
            : currentSizing.height,
    };
}

export function applyNodePatch(node: DesignNode, patch: DesignNodePatch): DesignNode {
    const { style, padding, autoLayout, sizing, ...nodePatch } = patch;
    const nextNode: DesignNode = {
        ...node,
        ...nodePatch,
        sizing: mergeNodeSizing(node.sizing, sizing),
        style: mergeNodeStyle(node.style, style),
    } as DesignNode;

    if (node.type === "frame" && padding) {
        const nextFrameNode = nextNode as typeof node;

        nextFrameNode.padding = {
            ...node.padding,
            ...padding,
        };
    }

    if (node.type === "frame" && autoLayout) {
        const nextFrameNode = nextNode as typeof node;

        nextFrameNode.autoLayout = {
            ...node.autoLayout,
            ...autoLayout,
            padding: {
                ...node.autoLayout.padding,
                ...(autoLayout.padding ?? {}),
            },
        };
    }

    if (node.type !== "text" && "text" in nextNode) {
        delete (nextNode as { text?: string }).text;
    }

    if (node.type !== "image" && "src" in nextNode) {
        delete (nextNode as { src?: string }).src;
    }

    if (JSON.stringify(nextNode) === JSON.stringify(node)) {
        return node;
    }

    return nextNode;
}