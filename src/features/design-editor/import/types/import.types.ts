export const IMPORT_AST_NODE_TYPES = ["frame", "group", "rectangle", "text", "image", "svg-asset"] as const;
export type ImportAstNodeType = (typeof IMPORT_AST_NODE_TYPES)[number];

export type PublicClipboardFormat = "svg" | "html" | "png" | "text";
export type ClipboardImportFormat = PublicClipboardFormat | "figma-clipboard-html" | "webstudio-design-json";
export type ImportFidelity = "public" | "bridge";

export interface ImportAstPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface ImportAstLayout {
    mode: "absolute" | "auto";
    clipContent: boolean;
    direction?: "horizontal" | "vertical";
    justifyContent?: "start" | "center" | "end" | "space-between";
    alignItems?: "start" | "center" | "end" | "stretch";
    gap?: number;
    padding?: ImportAstPadding;
}

export interface ImportAstFill {
    type: "solid" | "image";
    value: string;
    opacity: number;
}

export interface ImportAstStroke {
    color: string;
    width: number;
    opacity: number;
}

export interface ImportAstShadow {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
}

export interface ImportAstTextPayload {
    content: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    textAlign: "left" | "center" | "right";
    color: string;
}

export interface ImportAstImagePayload {
    src: string;
    objectFit: "cover" | "contain" | "fill";
}

export interface ImportAstNode {
    tempId: string;
    type: ImportAstNodeType;
    name: string;
    children: ImportAstNode[];
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    fills: ImportAstFill[];
    strokes: ImportAstStroke[];
    cornerRadius: number;
    shadow: ImportAstShadow | null;
    text: ImportAstTextPayload | null;
    image: ImportAstImagePayload | null;
    transform: string | null;
    layout: ImportAstLayout | null;
    clipContent: boolean;
    rawData?: Record<string, unknown>;
}

export interface ImportedAstDocument {
    roots: ImportAstNode[];
    sourceFormat: ClipboardImportFormat;
    fidelity: ImportFidelity;
    warnings: string[];
}

export interface ClipboardFileEntry {
    type: string;
    file: File;
}

export interface ClipboardPayload {
    types: string[];
    strings: Record<string, string>;
    files: ClipboardFileEntry[];
}

export type DetectedClipboardFormat =
    | {
        kind: "webstudio-design-json";
        sourceMime: "application/vnd.webstudio.design+json" | "text/plain";
        content: string;
    }
    | {
        kind: "figma-clipboard-html";
        sourceMime: "text/html";
        content: string;
    }
    | {
        kind: "svg";
        sourceMime: "image/svg+xml" | "text/plain" | "text/html";
        content: string;
    }
    | {
        kind: "html";
        sourceMime: "text/html";
        content: string;
    }
    | {
        kind: "png";
        sourceMime: "image/png";
        file: File;
    }
    | {
        kind: "text";
        sourceMime: "text/plain";
        content: string;
    }
    | {
        kind: "unsupported";
        sourceMime: null;
        availableTypes: string[];
    };

export interface ImportAdapter<TInput extends DetectedClipboardFormat = DetectedClipboardFormat> {
    id: string;
    canHandle: (input: DetectedClipboardFormat) => input is TInput;
    importContent: (input: TInput) => Promise<ImportedAstDocument>;
}

export interface ImportResult {
    status: "success" | "unsupported" | "error";
    rootNodeIds: string[];
    warnings: string[];
    message?: string;
}