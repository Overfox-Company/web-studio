import type { DesignNodeType } from "@/src/features/design-editor/types/design.types";

export const DESIGN_TOOLS = ["select", "frame", "rectangle", "text", "image", "hand"] as const;
export type DesignTool = (typeof DESIGN_TOOLS)[number];

export const DESIGN_RESIZE_HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
export type DesignResizeHandle = (typeof DESIGN_RESIZE_HANDLES)[number];

export interface DesignPoint {
    x: number;
    y: number;
}

export interface DesignFrame {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

export interface DesignViewport {
    x: number;
    y: number;
    zoom: number;
}

export interface DesignAlignmentGuide {
    id: string;
    axis: "horizontal" | "vertical";
    position: number;
    start: number;
    end: number;
    source: "container" | "sibling";
}

export type DesignCandidateInsertionMode = "inside" | "auto-layout";

export interface MoveInteractionSession {
    kind: "move";
    nodeId: string;
    pointerStart: DesignPoint;
    initialFrame: DesignFrame;
    previewFrame: DesignFrame;
    initialAbsoluteFrame: DesignFrame;
    previewAbsoluteFrame: DesignFrame;
}

export interface ResizeInteractionSession {
    kind: "resize";
    nodeId: string;
    handle: DesignResizeHandle;
    pointerStart: DesignPoint;
    initialFrame: DesignFrame;
    previewFrame: DesignFrame;
}

export interface CreateInteractionSession {
    kind: "create";
    nodeType: Extract<DesignNodeType, "frame" | "rectangle" | "text" | "image">;
    parentId: string;
    pointerStart: DesignPoint;
    originPoint: DesignPoint;
    previewFrame: DesignFrame;
}

export interface PanInteractionSession {
    kind: "pan";
    pointerStart: DesignPoint;
    initialViewport: DesignViewport;
    previewViewport: DesignViewport;
}

export type DesignInteractionSession =
    | MoveInteractionSession
    | ResizeInteractionSession
    | CreateInteractionSession
    | PanInteractionSession;