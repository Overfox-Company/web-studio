import { nanoid } from "nanoid";

import { designEditorDefaults } from "@/src/customization/design-editor";
import type { ImportAstNode, ImportedAstDocument } from "@/src/features/design-editor/import/types/import.types";
import type { DesignDocumentSnapshot, DesignImportDiagnostics, DesignNode } from "@/src/features/design-editor/types/design.types";

interface BuildImportedNodesOptions {
    importedDocument: ImportedAstDocument;
    targetParentId: string;
    targetParentUsesAutoLayout: boolean;
    placementOffset: { x: number; y: number };
}

interface BuiltImportedNodes {
    nodes: Record<string, DesignNode>;
    rootNodeIds: string[];
}

function zeroPadding() {
    return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };
}

function defaultSizing() {
    return {
        width: {
            mode: "fixed" as const,
            min: null,
            max: null,
        },
        height: {
            mode: "fixed" as const,
            min: null,
            max: null,
        },
    };
}

function pickFill(node: ImportAstNode) {
    return node.fills[0]?.value
        ?? (node.type === "text" || node.type === "svg-asset"
            ? designEditorDefaults.fills.transparent
            : designEditorDefaults.fills.fallback);
}

function pickStroke(node: ImportAstNode) {
    return node.strokes[0]?.color ?? null;
}

function pickStrokeWidth(node: ImportAstNode) {
    return node.strokes[0]?.width ?? 0;
}

function extractDiagnostics(rawData: Record<string, unknown> | undefined): DesignImportDiagnostics | null | undefined {
    const diagnostics = rawData?.diagnostics;

    if (!diagnostics || typeof diagnostics !== "object") {
        return undefined;
    }

    const candidate = diagnostics as Record<string, unknown>;

    return {
        source: typeof candidate.source === "string" ? candidate.source : "unknown-import",
        warnings: Array.isArray(candidate.warnings) ? candidate.warnings.filter((warning): warning is string => typeof warning === "string") : [],
        metaJson: typeof candidate.metaJson === "string" ? candidate.metaJson : null,
        rawHtml: typeof candidate.rawHtml === "string" ? candidate.rawHtml : null,
        figmetaBase64: typeof candidate.figmetaBase64 === "string" ? candidate.figmetaBase64 : null,
        figmaBase64: typeof candidate.figmaBase64 === "string" ? candidate.figmaBase64 : null,
        decoder: typeof candidate.decoder === "string" ? candidate.decoder : null,
    };
}

function buildBaseNode(node: ImportAstNode, parentId: string | null, placementOffset: { x: number; y: number }) {
    return {
        id: nanoid(),
        name: node.name,
        parentId,
        children: [] as string[],
        x: node.x + placementOffset.x,
        y: node.y + placementOffset.y,
        width: node.width,
        height: node.height,
        sizing: defaultSizing(),
        rotation: node.rotation,
        visible: true,
        locked: false,
        style: {
            fill: pickFill(node),
            stroke: pickStroke(node),
            strokeWidth: pickStrokeWidth(node),
            borderRadius: node.cornerRadius,
            opacity: node.opacity,
            shadow: node.shadow,
            typography: node.text
                ? {
                    fontFamily: node.text.fontFamily,
                    fontSize: node.text.fontSize,
                    fontWeight: node.text.fontWeight,
                    lineHeight: node.text.lineHeight,
                    textAlign: node.text.textAlign,
                    color: node.text.color,
                }
                : undefined,
            image: node.image
                ? {
                    src: node.image.src,
                    objectFit: node.image.objectFit,
                }
                : undefined,
        },
    };
}

function buildNodeTree(
    node: ImportAstNode,
    parentId: string | null,
    nodes: Record<string, DesignNode>,
    placementOffset: { x: number; y: number },
): string {
    const baseNode = buildBaseNode(node, parentId, placementOffset);

    let designNode: DesignNode;

    switch (node.type) {
        case "frame":
            designNode = {
                ...baseNode,
                type: "frame",
                clipContent: node.layout?.clipContent ?? node.clipContent,
                padding: node.layout?.padding ?? zeroPadding(),
                layoutMode: node.layout?.mode === "auto" ? "auto" : "absolute",
                autoLayout: {
                    direction: node.layout?.direction ?? "vertical",
                    justifyContent: node.layout?.justifyContent ?? "start",
                    alignItems: node.layout?.alignItems ?? "start",
                    gap: node.layout?.gap ?? 16,
                    padding: node.layout?.padding ?? zeroPadding(),
                },
            };
            break;
        case "group":
            designNode = {
                ...baseNode,
                type: "group",
            };
            break;
        case "rectangle":
            designNode = {
                ...baseNode,
                type: "rectangle",
            };
            break;
        case "text":
            designNode = {
                ...baseNode,
                type: "text",
                text: node.text?.content ?? "Text",
            };
            break;
        case "image":
            designNode = {
                ...baseNode,
                type: "image",
                src: node.image?.src ?? "placeholder://image",
            };
            break;
        case "svg-asset":
            designNode = {
                ...baseNode,
                type: "svg-asset",
                svgMarkup: String(node.rawData?.svgMarkup ?? ""),
                viewBox: typeof node.rawData?.viewBox === "string" ? node.rawData.viewBox : null,
                diagnostics: extractDiagnostics(node.rawData),
            };
            break;
    }

    nodes[designNode.id] = designNode;

    const childIds = node.children.map((child) => buildNodeTree(child, designNode.id, nodes, { x: 0, y: 0 }));
    nodes[designNode.id] = {
        ...nodes[designNode.id],
        children: childIds,
    };

    return designNode.id;
}

export function computeImportedBounds(roots: ImportAstNode[]) {
    if (roots.length === 0) {
        return {
            width: 0,
            height: 0,
        };
    }

    const right = Math.max(...roots.map((root) => root.x + root.width));
    const bottom = Math.max(...roots.map((root) => root.y + root.height));

    return {
        width: right,
        height: bottom,
    };
}

export function buildImportedDesignNodes({
    importedDocument,
    targetParentId,
    targetParentUsesAutoLayout,
    placementOffset,
}: BuildImportedNodesOptions): BuiltImportedNodes {
    const nodes: Record<string, DesignNode> = {};
    const rootNodeIds = importedDocument.roots.map((root) => buildNodeTree(
        root,
        targetParentId,
        nodes,
        targetParentUsesAutoLayout
            ? {
                x: -root.x,
                y: -root.y,
            }
            : placementOffset,
    ));

    return {
        nodes,
        rootNodeIds,
    };
}

export function targetParentUsesAutoLayout(document: DesignDocumentSnapshot, targetParentId: string) {
    const targetParent = document.nodes[targetParentId];
    return Boolean(targetParent && targetParent.type === "frame" && targetParent.layoutMode === "auto");
}