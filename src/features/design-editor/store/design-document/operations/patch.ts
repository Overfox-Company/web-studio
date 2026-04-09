import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";

import type { DesignNodePatch } from "../design-document.types";
import { materializeChildFrames, expandAutoLayoutFramesFromNode } from "./layout";
import { applyNodePatch } from "./node-patch";
import { syncDirectChildrenForPaddingChange } from "./padding";

export function patchNodeInDocument(document: DesignDocumentSnapshot, nodeId: string, patch: DesignNodePatch): DesignDocumentSnapshot {
    const currentNode = document.nodes[nodeId];

    if (!currentNode) {
        return document;
    }

    const switchesToAbsolute = currentNode.type === "frame"
        && currentNode.layoutMode === "auto"
        && patch.layoutMode === "absolute";
    const switchesToAuto = currentNode.type === "frame"
        && currentNode.layoutMode === "absolute"
        && patch.layoutMode === "auto";
    const shouldPreserveRootFrameSize = currentNode.type === "frame" && currentNode.parentId == null;
    const normalizedPatch: DesignNodePatch = switchesToAuto
        ? {
            ...patch,
            sizing: {
                width: {
                    ...(patch.sizing?.width ?? {}),
                    mode: patch.sizing?.width?.mode ?? (shouldPreserveRootFrameSize ? "fixed" : "hug"),
                },
                height: {
                    ...(patch.sizing?.height ?? {}),
                    mode: patch.sizing?.height?.mode ?? (shouldPreserveRootFrameSize ? "fixed" : "hug"),
                },
            },
        }
        : patch;
    const baseDocument = switchesToAbsolute
        ? materializeChildFrames(document, nodeId)
        : document;
    const baseNode = baseDocument.nodes[nodeId];

    if (!baseNode) {
        return document;
    }

    const previousPadding = baseNode.type === "frame"
        ? (baseNode.layoutMode === "auto" ? baseNode.autoLayout.padding : baseNode.padding)
        : null;
    const patchedNode = applyNodePatch(baseNode, normalizedPatch);

    if (patchedNode === baseNode && baseDocument === document) {
        return document;
    }

    let nextDocument = patchedNode === baseNode
        ? baseDocument
        : {
            ...baseDocument,
            nodes: {
                ...baseDocument.nodes,
                [nodeId]: patchedNode,
            },
        };

    if (previousPadding && patchedNode.type === "frame") {
        const nextPadding = patchedNode.layoutMode === "auto" ? patchedNode.autoLayout.padding : patchedNode.padding;

        nextDocument = syncDirectChildrenForPaddingChange(nextDocument, nodeId, previousPadding, nextPadding);
    }

    if (switchesToAuto) {
        nextDocument = materializeChildFrames(nextDocument, nodeId);
    }

    return expandAutoLayoutFramesFromNode(nextDocument, nodeId);
}