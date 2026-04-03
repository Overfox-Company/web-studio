import { nanoid } from "nanoid";

import type {
    DesignAutoLayout,
    DesignFrameNode,
    DesignGroupNode,
    DesignImageNode,
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

function createBaseNode(parentId: string, frame: DesignFrame) {
    return {
        id: nanoid(),
        parentId,
        children: [] as string[],
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
        rotation: frame.rotation,
        visible: true,
        locked: false,
    };
}

function createFrameNode(parentId: string, frame: DesignFrame): DesignFrameNode {
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
            fill: "#ffffff",
            stroke: "rgba(148, 163, 184, 0.32)",
            strokeWidth: 1,
            borderRadius: 20,
            opacity: 1,
            shadow: {
                x: 0,
                y: 18,
                blur: 40,
                spread: -18,
                color: "rgba(15, 23, 42, 0.16)",
            },
        },
    };
}

function createRectangleNode(parentId: string, frame: DesignFrame): DesignRectangleNode {
    return {
        ...createBaseNode(parentId, frame),
        type: "rectangle",
        name: "Rectangle",
        style: {
            fill: "#7dd3fc",
            stroke: "rgba(15, 23, 42, 0.18)",
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
            fill: "transparent",
            stroke: null,
            strokeWidth: 0,
            borderRadius: 0,
            opacity: 1,
            shadow: null,
            typography: {
                fontFamily: "var(--font-ibm-plex-sans)",
                fontSize: 32,
                fontWeight: 600,
                lineHeight: 1.2,
                textAlign: "left",
                color: "#0f172a",
            },
        },
    };
}

function createImageNode(parentId: string, frame: DesignFrame): DesignImageNode {
    return {
        ...createBaseNode(parentId, frame),
        type: "image",
        name: "Image",
        src: "placeholder://image",
        style: {
            fill: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
            stroke: "rgba(255, 255, 255, 0.16)",
            strokeWidth: 1,
            borderRadius: 24,
            opacity: 1,
            shadow: {
                x: 0,
                y: 18,
                blur: 36,
                spread: -18,
                color: "rgba(15, 23, 42, 0.35)",
            },
            image: {
                src: "placeholder://image",
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
            fill: "transparent",
            stroke: null,
            strokeWidth: 0,
            borderRadius: 0,
            opacity: 1,
            shadow: null,
        },
    };
}

export function createDesignNode({ type, parentId, frame }: CreateDesignNodeOptions): DesignNode {
    switch (type) {
        case "frame":
            return createFrameNode(parentId, frame);
        case "rectangle":
            return createRectangleNode(parentId, frame);
        case "text":
            return createTextNode(parentId, frame);
        case "image":
            return createImageNode(parentId, frame);
    }
}