import { nanoid } from "nanoid";

import { designEditorDefaults } from "@/src/customization/design-editor";
import type {
    DesignComponentInstanceNode,
    DesignAutoLayout,
    DesignFrameNode,
    DesignGroupNode,
    DesignImageNode,
    DesignNodeSizing,
    DesignNode,
    DesignRectangleNode,
    DesignTextNode,
} from "@/src/features/design-editor/types/design.types";
import type { DesignFrame } from "@/src/features/design-editor/types/interaction.types";

interface CreateDesignNodeOptions {
    type: Extract<DesignNode["type"], "frame" | "rectangle" | "text" | "image">;
    parentId: string;
    frame: DesignFrame;
}

function createDefaultAutoLayout(): DesignAutoLayout {
    return {
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
    };
}

function createDefaultSizing(): DesignNodeSizing {
    return {
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
    };
}

function createBaseNode(parentId: string, frame: DesignFrame) {
    return {
        id: nanoid(),
        parentId,
        children: [] as string[],
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
        sizing: createDefaultSizing(),
        rotation: frame.rotation,
        visible: true,
        locked: false,
    };
}

export function createDesignFrameNode(parentId: string, frame: DesignFrame): DesignFrameNode {
    return {
        ...createBaseNode(parentId, frame),
        type: "frame",
        name: "Frame",
        clipContent: true,
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        layoutMode: "absolute",
        autoLayout: createDefaultAutoLayout(),
        style: {
            fill: designEditorDefaults.fills.frame,
            stroke: designEditorDefaults.strokes.frame,
            strokeWidth: 1,
            borderRadius: 20,
            opacity: 1,
            shadow: designEditorDefaults.shadows.frame,
        },
    };
}

function createRectangleNode(parentId: string, frame: DesignFrame): DesignRectangleNode {
    return {
        ...createBaseNode(parentId, frame),
        type: "rectangle",
        name: "Rectangle",
        style: {
            fill: designEditorDefaults.fills.rectangle,
            stroke: designEditorDefaults.strokes.rectangle,
            strokeWidth: 1,
            borderRadius: 16,
            opacity: 1,
            shadow: null,
        },
    };
}

function createTextNode(parentId: string, frame: DesignFrame): DesignTextNode {
    return {
        ...createBaseNode(parentId, frame),
        type: "text",
        name: "Text",
        text: "Text",
        style: {
            fill: designEditorDefaults.fills.transparent,
            stroke: null,
            strokeWidth: 0,
            borderRadius: 0,
            opacity: 1,
            shadow: null,
            typography: {
                fontFamily: designEditorDefaults.typography.fontFamily,
                fontSize: 32,
                fontWeight: 600,
                lineHeight: 1.2,
                textAlign: designEditorDefaults.typography.textAlign,
                color: designEditorDefaults.typography.color,
            },
        },
    };
}

function createImageNode(parentId: string, frame: DesignFrame): DesignImageNode {
    return {
        ...createBaseNode(parentId, frame),
        type: "image",
        name: "Image",
        src: designEditorDefaults.imageSource,
        style: {
            fill: designEditorDefaults.fills.image,
            stroke: designEditorDefaults.strokes.image,
            strokeWidth: 1,
            borderRadius: 24,
            opacity: 1,
            shadow: designEditorDefaults.shadows.image,
            image: {
                src: designEditorDefaults.imageSource,
                objectFit: "cover",
            },
        },
    };
}

export function createDesignGroupNode(parentId: string, frame: DesignFrame): DesignGroupNode {
    return {
        ...createBaseNode(parentId, frame),
        type: "group",
        name: "Group",
        style: {
            fill: designEditorDefaults.fills.transparent,
            stroke: null,
            strokeWidth: 0,
            borderRadius: 0,
            opacity: 1,
            shadow: null,
        },
    };
}

export function createComponentInstanceNode(params: {
    parentId: string;
    frame: DesignFrame;
    componentSetId: string;
    variantId: string;
    name: string;
}): DesignComponentInstanceNode {
    return {
        ...createBaseNode(params.parentId, params.frame),
        type: "component-instance",
        name: params.name,
        componentSetId: params.componentSetId,
        variantId: params.variantId,
        style: {
            fill: designEditorDefaults.fills.transparent,
            stroke: designEditorDefaults.strokes.frame,
            strokeWidth: 1,
            borderRadius: 20,
            opacity: 1,
            shadow: null,
        },
    };
}

export function createDesignNode({ type, parentId, frame }: CreateDesignNodeOptions): DesignNode {
    switch (type) {
        case "frame":
            return createDesignFrameNode(parentId, frame);
        case "rectangle":
            return createRectangleNode(parentId, frame);
        case "text":
            return createTextNode(parentId, frame);
        case "image":
            return createImageNode(parentId, frame);
    }
}