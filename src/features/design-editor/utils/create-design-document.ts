import { designEditorDefaults } from "@/src/customization/design-editor";
import { designDocumentSchema } from "@/src/features/design-editor/schema/design.schema";
import type { DesignDocumentSnapshot, DesignFrameNode } from "@/src/features/design-editor/types/design.types";

interface CreateDefaultDesignDocumentOptions {
    viewNodeId: string;
    viewName: string;
}

const ROOT_FRAME_SIZE = {
    width: 1440,
    height: 960,
};

function createRootFrame(viewNodeId: string, viewName: string): DesignFrameNode {
    return {
        id: `${viewNodeId}-root-frame`,
        type: "frame",
        name: `${viewName} Root`,
        parentId: null,
        children: [],
        x: 0,
        y: 0,
        width: ROOT_FRAME_SIZE.width,
        height: ROOT_FRAME_SIZE.height,
        sizing: {
            width: {
                mode: "fixed",
                min: null,
                max: null,
            },
            height: {
                mode: "fixed",
                min: null,
                max: null,
            },
        },
        rotation: 0,
        visible: true,
        locked: false,
        clipContent: true,
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        layoutMode: "absolute",
        autoLayout: {
            direction: "vertical",
            justifyContent: "start",
            alignItems: "start",
            gap: 16,
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            },
        },
        style: {
            fill: designEditorDefaults.fills.root,
            stroke: designEditorDefaults.strokes.root,
            strokeWidth: 1,
            borderRadius: 24,
            opacity: 1,
            shadow: designEditorDefaults.shadows.root,
        },
    };
}

export function createDefaultDesignDocument({
    viewNodeId,
    viewName,
}: CreateDefaultDesignDocumentOptions): DesignDocumentSnapshot {
    const rootFrame = createRootFrame(viewNodeId, viewName);

    return designDocumentSchema.parse({
        id: `design-${viewNodeId}`,
        viewNodeId,
        name: `${viewName} Design`,
        rootNodeId: rootFrame.id,
        nodes: {
            [rootFrame.id]: rootFrame,
        },
        version: 1,
        updatedAt: new Date().toISOString(),
    });
}