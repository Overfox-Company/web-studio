import { readHTMLMessage } from "fig-kiwi";
import type { FigmaMeta } from "fig-kiwi/fightml";
import type {
    Blob as FigmaBlobPayload,
    Color,
    FontName,
    GUID,
    Matrix,
    Message,
    NodeChange,
    Number as FigmaNumber,
    Paint,
    StackAlign,
    StackCounterAlign,
    StackJustify,
    TextData,
} from "fig-kiwi/schema-defs";
import { nanoid } from "nanoid";

import { createDesignImportFallbackSvg, designEditorDefaults } from "@/src/customization/design-editor";
import { extractFigmaClipboardHtmlPayload } from "@/src/features/design-editor/import/clipboard/figma-clipboard-html";
import type {
    DetectedClipboardFormat,
    ImportAdapter,
    ImportAstFill,
    ImportAstNode,
    ImportAstShadow,
    ImportAstStroke,
    ImportedAstDocument,
} from "@/src/features/design-editor/import/types/import.types";

const RAW_FIGMA_DECODER_ID = "fig-kiwi.readHTMLMessage";
const IMPORTABLE_FRAME_TYPES = new Set(["FRAME", "COMPONENT", "INSTANCE", "SECTION", "COMPONENT_SET"]);
const RAW_VECTOR_TYPES = new Set(["VECTOR", "STAR", "LINE", "ELLIPSE", "REGULAR_POLYGON", "BOOLEAN_OPERATION", "SHAPE_WITH_TEXT"]);

function clampSize(value: number | undefined, fallback: number) {
    return Math.max(1, Number.isFinite(value) ? Number(value) : fallback);
}

function guidKey(guid: GUID | undefined) {
    return guid ? `${guid.sessionID}:${guid.localID}` : null;
}

function getNodeType(change: NodeChange) {
    return change.type ?? "NONE";
}

function getNodeName(change: NodeChange) {
    return change.name?.trim() || getNodeType(change) || "Node";
}

function serializeMeta(meta: FigmaMeta | null) {
    if (!meta) {
        return null;
    }

    try {
        return JSON.stringify(meta);
    } catch {
        return null;
    }
}

function colorToCss(color: Color | undefined, opacity = 1) {
    if (!color) {
        return null;
    }

    const red = color.r <= 1 ? Math.round(color.r * 255) : Math.round(color.r);
    const green = color.g <= 1 ? Math.round(color.g * 255) : Math.round(color.g);
    const blue = color.b <= 1 ? Math.round(color.b * 255) : Math.round(color.b);
    const alpha = Math.max(0, Math.min(1, color.a * opacity));

    return alpha >= 1 ? `rgb(${red}, ${green}, ${blue})` : `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function numberToLineHeight(value: FigmaNumber | undefined, fontSize: number) {
    if (!value) {
        return 1.2;
    }

    const lineHeightValue = value.value;

    if (!Number.isFinite(lineHeightValue) || lineHeightValue <= 0) {
        return 1.2;
    }

    return lineHeightValue > 3 ? lineHeightValue / Math.max(1, fontSize) : lineHeightValue;
}

function parseFontWeight(style: string | undefined) {
    if (!style) {
        return 500;
    }

    const numericWeight = style.match(/\b(100|200|300|400|500|600|700|800|900)\b/);

    if (numericWeight) {
        return Number.parseInt(numericWeight[1], 10);
    }

    if (/black|heavy/i.test(style)) {
        return 900;
    }

    if (/extra\s*bold|ultra\s*bold/i.test(style)) {
        return 800;
    }

    if (/bold|semi\s*bold|demi/i.test(style)) {
        return 700;
    }

    if (/medium/i.test(style)) {
        return 500;
    }

    if (/light/i.test(style)) {
        return 300;
    }

    return 400;
}

function fontFamily(fontName: FontName | undefined) {
    return fontName?.family || designEditorDefaults.typography.fontFamily;
}

function dataBytesToBase64(bytes: Uint8Array) {
    let binary = "";

    for (let index = 0; index < bytes.length; index += 1) {
        binary += String.fromCharCode(bytes[index]);
    }

    return btoa(binary);
}

function sniffImageMime(bytes: Uint8Array) {
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
        return "image/png";
    }

    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return "image/jpeg";
    }

    if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
        return "image/gif";
    }

    if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
        return "image/webp";
    }

    const utf8Text = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, 120));

    if (utf8Text.toLowerCase().includes("<svg")) {
        return "image/svg+xml";
    }

    return "application/octet-stream";
}

function blobToDataUri(blobIndex: number | undefined, blobs: FigmaBlobPayload[] | undefined, warnings: string[], nodeName: string) {
    if (blobIndex == null) {
        return null;
    }

    const blob = blobs?.[blobIndex];

    if (!blob?.bytes) {
        warnings.push(`Figma image blob ${blobIndex} for \"${nodeName}\" was not available and was preserved as raw content.`);
        return null;
    }

    const mimeType = sniffImageMime(blob.bytes);
    return `data:${mimeType};base64,${dataBytesToBase64(blob.bytes)}`;
}

function getFillPaints(change: NodeChange) {
    return [...(change.fillPaints ?? []), ...(change.backgroundPaints ?? [])].filter((paint) => paint.visible !== false);
}

function resolveImageSource(change: NodeChange, blobs: FigmaBlobPayload[] | undefined, warnings: string[]) {
    const nodeName = getNodeName(change);

    for (const paint of getFillPaints(change)) {
        if (paint.type !== "IMAGE") {
            continue;
        }

        const source = blobToDataUri(paint.image?.dataBlob, blobs, warnings, nodeName);

        if (source) {
            return source;
        }
    }

    return null;
}

function mapPaintToSolidFallback(paint: Paint, warnings: string[], nodeName: string) {
    if (!paint.stops || paint.stops.length === 0) {
        return null;
    }

    const color = colorToCss(paint.stops[0]?.color, paint.opacity ?? 1);

    if (color) {
        warnings.push(`Complex Figma paint on \"${nodeName}\" was approximated as a solid color.`);
    }

    return color;
}

function mapPaintsToFills(change: NodeChange, blobs: FigmaBlobPayload[] | undefined, warnings: string[]): ImportAstFill[] {
    const nodeName = getNodeName(change);
    const fills: ImportAstFill[] = [];

    for (const paint of getFillPaints(change)) {
        if (paint.type === "SOLID") {
            const cssColor = colorToCss(paint.color, paint.opacity ?? 1);

            if (cssColor) {
                fills.push({
                    type: "solid",
                    value: cssColor,
                    opacity: paint.opacity ?? 1,
                });
            }

            continue;
        }

        if (paint.type === "IMAGE") {
            const source = blobToDataUri(paint.image?.dataBlob, blobs, warnings, nodeName);

            if (source) {
                fills.push({
                    type: "image",
                    value: source,
                    opacity: paint.opacity ?? 1,
                });
            }

            continue;
        }

        const solidFallback = mapPaintToSolidFallback(paint, warnings, nodeName);

        if (solidFallback) {
            fills.push({
                type: "solid",
                value: solidFallback,
                opacity: paint.opacity ?? 1,
            });
        }
    }

    if (fills.length === 0 && change.backgroundColor) {
        const backgroundColor = colorToCss(change.backgroundColor);

        if (backgroundColor) {
            fills.push({
                type: "solid",
                value: backgroundColor,
                opacity: 1,
            });
        }
    }

    return fills;
}

function mapPaintsToStrokes(change: NodeChange): ImportAstStroke[] {
    return (change.strokePaints ?? [])
        .filter((paint) => paint.visible !== false)
        .map((paint) => {
            const color = paint.type === "SOLID" ? colorToCss(paint.color, paint.opacity ?? 1) : null;

            if (!color) {
                return null;
            }

            return {
                color,
                width: change.strokeWeight ?? 1,
                opacity: paint.opacity ?? 1,
            };
        })
        .filter((stroke): stroke is ImportAstStroke => Boolean(stroke));
}

function mapDropShadow(change: NodeChange): ImportAstShadow | null {
    for (const effect of change.effects ?? []) {
        if (effect.visible === false || effect.type !== "DROP_SHADOW") {
            continue;
        }

        const color = colorToCss(effect.color);

        if (!color) {
            continue;
        }

        return {
            x: effect.offset?.x ?? 0,
            y: effect.offset?.y ?? 0,
            blur: effect.radius ?? 0,
            spread: effect.spread ?? 0,
            color,
        };
    }

    return null;
}

function getCornerRadius(change: NodeChange) {
    const radii = [
        change.cornerRadius,
        change.rectangleTopLeftCornerRadius,
        change.rectangleTopRightCornerRadius,
        change.rectangleBottomLeftCornerRadius,
        change.rectangleBottomRightCornerRadius,
    ].filter((radius): radius is number => typeof radius === "number" && Number.isFinite(radius));

    return radii.length > 0 ? Math.max(...radii) : 0;
}

function matrixPosition(matrix: Matrix | undefined) {
    return {
        x: matrix?.m02 ?? 0,
        y: matrix?.m12 ?? 0,
    };
}

function matrixRotation(matrix: Matrix | undefined) {
    if (!matrix) {
        return 0;
    }

    return Math.atan2(matrix.m10, matrix.m00) * (180 / Math.PI);
}

function getNodeSize(change: NodeChange) {
    return {
        width: clampSize(change.size?.x ?? change.textData?.layoutSize?.x, 120),
        height: clampSize(change.size?.y ?? change.textData?.layoutSize?.y, 80),
    };
}

function textAlignFromNode(change: NodeChange) {
    switch (change.textAlignHorizontal) {
        case "CENTER":
            return "center" as const;
        case "RIGHT":
            return "right" as const;
        default:
            return "left" as const;
    }
}

function textFontName(change: NodeChange, textData: TextData | undefined) {
    return textData?.fontMetaData?.[0]?.key ?? change.fontName;
}

function textFontWeight(change: NodeChange, textData: TextData | undefined) {
    return textData?.fontMetaData?.[0]?.fontWeight ?? parseFontWeight(textFontName(change, textData)?.style);
}

function textLineHeight(change: NodeChange, textData: TextData | undefined, fontSize: number) {
    const lineHeight = textData?.fontMetaData?.[0]?.fontLineHeight;

    if (typeof lineHeight === "number" && Number.isFinite(lineHeight) && lineHeight > 0) {
        return lineHeight / Math.max(1, fontSize);
    }

    return numberToLineHeight(change.lineHeight, fontSize);
}

function textFillColor(fills: ImportAstFill[]) {
    return fills.find((fill) => fill.type === "solid")?.value ?? designEditorDefaults.typography.color;
}

function mapTextPayload(change: NodeChange, fills: ImportAstFill[]) {
    const textData = change.textData;
    const fontName = textFontName(change, textData);
    const fontSize = change.fontSize ?? 24;

    return {
        content: textData?.characters ?? getNodeName(change),
        fontFamily: fontFamily(fontName),
        fontSize,
        fontWeight: textFontWeight(change, textData),
        lineHeight: textLineHeight(change, textData, fontSize),
        textAlign: textAlignFromNode(change),
        color: textFillColor(fills),
    };
}

function mapJustify(value: StackJustify | undefined, warnings: string[], nodeName: string) {
    switch (value) {
        case "CENTER":
            return "center" as const;
        case "MAX":
            return "end" as const;
        case "SPACE_EVENLY":
            warnings.push(`Auto layout justify \"SPACE_EVENLY\" on \"${nodeName}\" was degraded to space-between.`);
            return "space-between" as const;
        default:
            return "start" as const;
    }
}

function mapAlign(value: StackCounterAlign | StackAlign | undefined) {
    switch (value) {
        case "CENTER":
            return "center" as const;
        case "MAX":
            return "end" as const;
        case "STRETCH":
        case "BASELINE":
            return "stretch" as const;
        default:
            return "start" as const;
    }
}

function mapLayout(change: NodeChange, warnings: string[]) {
    if (change.stackMode !== "HORIZONTAL" && change.stackMode !== "VERTICAL") {
        return {
            mode: "absolute" as const,
            clipContent: false,
        };
    }

    const uniformPadding = Math.max(0, change.stackPadding ?? 0);
    const verticalPadding = Math.max(0, change.stackVerticalPadding ?? uniformPadding);
    const horizontalPadding = Math.max(0, change.stackHorizontalPadding ?? uniformPadding);

    return {
        mode: "auto" as const,
        clipContent: false,
        direction: change.stackMode === "HORIZONTAL" ? "horizontal" as const : "vertical" as const,
        justifyContent: mapJustify(change.stackJustify, warnings, getNodeName(change)),
        alignItems: mapAlign(change.stackCounterAlign ?? change.stackAlign),
        gap: Math.max(0, change.stackSpacing ?? 0),
        padding: {
            top: verticalPadding,
            right: horizontalPadding,
            bottom: verticalPadding,
            left: horizontalPadding,
        },
    };
}

function sortByParentPosition(left: NodeChange, right: NodeChange) {
    const leftPosition = left.parentIndex?.position ?? "";
    const rightPosition = right.parentIndex?.position ?? "";
    return leftPosition.localeCompare(rightPosition);
}

function createRawNodeFallback(
    change: NodeChange,
    warnings: string[],
    diagnostics: ReturnType<typeof createDiagnosticsPayload>,
    subtitle: string,
): ImportAstNode {
    const nodeName = getNodeName(change);
    const size = getNodeSize(change);
    const position = matrixPosition(change.transform);

    return {
        tempId: nanoid(),
        type: "svg-asset",
        name: nodeName,
        children: [],
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        rotation: matrixRotation(change.transform),
        opacity: change.opacity ?? 1,
        fills: [],
        strokes: [],
        cornerRadius: getCornerRadius(change),
        shadow: null,
        text: null,
        image: null,
        transform: null,
        layout: null,
        clipContent: false,
        rawData: {
            svgMarkup: createDesignImportFallbackSvg(nodeName, subtitle, size.width, size.height),
            viewBox: `0 0 ${Math.max(1, Math.round(size.width))} ${Math.max(1, Math.round(size.height))}`,
            diagnostics: {
                ...diagnostics,
                warnings,
            },
        },
    };
}

function createDiagnosticsPayload(options: {
    metaJson: string | null;
    payload: ReturnType<typeof extractFigmaClipboardHtmlPayload>;
    warnings: string[];
    decoderId: string | null;
}) {
    return {
        source: "figma-clipboard-html",
        warnings: options.warnings,
        metaJson: options.metaJson,
        rawHtml: options.payload?.rawHtml ?? null,
        figmetaBase64: options.payload?.figmetaBase64 ?? null,
        figmaBase64: options.payload?.figmaBase64 ?? null,
        decoder: options.decoderId,
    };
}

function createDiagnosticFallbackDocument(options: {
    payload: ReturnType<typeof extractFigmaClipboardHtmlPayload>;
    metaJson: string | null;
    warnings: string[];
    decoderId: string | null;
    title: string;
    subtitle: string;
}): ImportedAstDocument {
    const svgMarkup = createDesignImportFallbackSvg(options.title, options.subtitle, 360, 220);

    return {
        roots: [
            {
                tempId: nanoid(),
                type: "svg-asset",
                name: options.title,
                children: [],
                x: 0,
                y: 0,
                width: 360,
                height: 220,
                rotation: 0,
                opacity: 1,
                fills: [],
                strokes: [],
                cornerRadius: 0,
                shadow: null,
                text: null,
                image: null,
                transform: null,
                layout: null,
                clipContent: false,
                rawData: {
                    svgMarkup,
                    viewBox: "0 0 360 220",
                    diagnostics: createDiagnosticsPayload({
                        metaJson: options.metaJson,
                        payload: options.payload,
                        warnings: options.warnings,
                        decoderId: options.decoderId,
                    }),
                },
            },
        ],
        sourceFormat: "figma-clipboard-html",
        fidelity: "public",
        warnings: options.warnings,
    };
}

function shouldSkipNode(change: NodeChange) {
    return !change.guid || change.phase === "REMOVED" || getNodeType(change) === "DOCUMENT" || getNodeType(change) === "CANVAS" || getNodeType(change) === "NONE";
}

function mapNodeTypeToImport(change: NodeChange, imageSource: string | null) {
    const nodeType = getNodeType(change);

    if (nodeType === "TEXT") {
        return "text" as const;
    }

    if (nodeType === "GROUP") {
        return "group" as const;
    }

    if (IMPORTABLE_FRAME_TYPES.has(nodeType)) {
        return "frame" as const;
    }

    if (nodeType === "MEDIA") {
        return imageSource ? "image" as const : "svg-asset" as const;
    }

    if (nodeType === "RECTANGLE" || nodeType === "ROUNDED_RECTANGLE") {
        return imageSource ? "image" as const : "rectangle" as const;
    }

    return "svg-asset" as const;
}

function buildTree(changeMap: Map<string, NodeChange>) {
    const roots: NodeChange[] = [];
    const children = new Map<string, NodeChange[]>();

    for (const change of changeMap.values()) {
        const parentKey = guidKey(change.parentIndex?.guid);

        if (!parentKey || !changeMap.has(parentKey)) {
            roots.push(change);
            continue;
        }

        const currentChildren = children.get(parentKey) ?? [];
        currentChildren.push(change);
        children.set(parentKey, currentChildren);
    }

    for (const childList of children.values()) {
        childList.sort(sortByParentPosition);
    }

    roots.sort(sortByParentPosition);
    return { roots, children };
}

function mapNodeChangeToImportAst(
    change: NodeChange,
    childMap: Map<string, NodeChange[]>,
    blobs: FigmaBlobPayload[] | undefined,
    diagnostics: ReturnType<typeof createDiagnosticsPayload>,
    warnings: string[],
): ImportAstNode {
    const imageSource = resolveImageSource(change, blobs, warnings);
    const fills = mapPaintsToFills(change, blobs, warnings);
    const importType = mapNodeTypeToImport(change, imageSource);
    const position = matrixPosition(change.transform);
    const size = getNodeSize(change);
    const nodeKey = guidKey(change.guid);

    if (RAW_VECTOR_TYPES.has(getNodeType(change))) {
        warnings.push(`Complex Figma vector \"${getNodeName(change)}\" was preserved as a raw renderable asset.`);
        return createRawNodeFallback(change, warnings, diagnostics, `Figma ${getNodeType(change).toLowerCase()} preserved as raw asset`);
    }

    if ((getNodeType(change) === "MEDIA" || getNodeType(change) === "RECTANGLE") && !imageSource && getFillPaints(change).some((paint) => paint.type === "IMAGE")) {
        return createRawNodeFallback(change, warnings, diagnostics, "Image blob missing, preserved as raw asset");
    }

    if (getNodeType(change) === "VECTOR" || change.vectorData || change.fillGeometry || change.strokeGeometry) {
        return createRawNodeFallback(change, warnings, diagnostics, "Vector geometry preserved as raw asset");
    }

    return {
        tempId: nanoid(),
        type: importType,
        name: getNodeName(change),
        children: importType === "frame" || importType === "group"
            ? (childMap.get(nodeKey ?? "") ?? []).map((child) => mapNodeChangeToImportAst(child, childMap, blobs, diagnostics, warnings))
            : [],
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        rotation: matrixRotation(change.transform),
        opacity: change.opacity ?? 1,
        fills,
        strokes: mapPaintsToStrokes(change),
        cornerRadius: getCornerRadius(change),
        shadow: mapDropShadow(change),
        text: importType === "text" ? mapTextPayload(change, fills) : null,
        image: importType === "image"
            ? {
                src: imageSource ?? "placeholder://image",
                objectFit: "contain",
            }
            : null,
        transform: null,
        layout: importType === "frame" ? mapLayout(change, warnings) : null,
        clipContent: false,
        rawData: importType === "svg-asset"
            ? {
                svgMarkup: createDesignImportFallbackSvg(getNodeName(change), `Figma ${getNodeType(change).toLowerCase()} preserved as raw asset`, size.width, size.height),
                viewBox: `0 0 ${Math.max(1, Math.round(size.width))} ${Math.max(1, Math.round(size.height))}`,
                diagnostics: {
                    ...diagnostics,
                    warnings,
                },
            }
            : undefined,
    };
}

function mapMessageToImportedDocument(message: Message, payload: ReturnType<typeof extractFigmaClipboardHtmlPayload>, meta: FigmaMeta | null): ImportedAstDocument | null {
    const warnings: string[] = [];
    const metaJson = serializeMeta(meta);
    const diagnostics = createDiagnosticsPayload({
        metaJson,
        payload,
        warnings,
        decoderId: RAW_FIGMA_DECODER_ID,
    });
    const changeMap = new Map<string, NodeChange>();

    for (const change of message.nodeChanges ?? []) {
        if (shouldSkipNode(change)) {
            continue;
        }

        const key = guidKey(change.guid);

        if (key) {
            changeMap.set(key, change);
        }
    }

    if (changeMap.size === 0) {
        return null;
    }

    const tree = buildTree(changeMap);

    return {
        roots: tree.roots.map((root) => mapNodeChangeToImportAst(root, tree.children, message.blobs, diagnostics, warnings)),
        sourceFormat: "figma-clipboard-html",
        fidelity: "public",
        warnings,
    };
}

export const figmaClipboardHtmlAdapter: ImportAdapter<Extract<DetectedClipboardFormat, { kind: "figma-clipboard-html" }>> = {
    id: "figma-clipboard-html-adapter",
    canHandle: (input): input is Extract<DetectedClipboardFormat, { kind: "figma-clipboard-html" }> => input.kind === "figma-clipboard-html",
    importContent: async (input) => {
        const payload = extractFigmaClipboardHtmlPayload(input.content);

        if (!payload) {
            return createDiagnosticFallbackDocument({
                payload: null,
                metaJson: null,
                warnings: ["Figma clipboard HTML markers were detected, but the payload blocks could not be extracted."],
                decoderId: RAW_FIGMA_DECODER_ID,
                title: "Figma Paste",
                subtitle: "Clipboard payload could not be extracted",
            });
        }

        try {
            const { message, meta } = readHTMLMessage(input.content);
            const mappedDocument = mapMessageToImportedDocument(message, payload, meta);

            if (mappedDocument) {
                return mappedDocument;
            }

            return createDiagnosticFallbackDocument({
                payload,
                metaJson: serializeMeta(meta),
                warnings: ["fig-kiwi decoded the Figma clipboard payload, but no importable node changes were found."],
                decoderId: RAW_FIGMA_DECODER_ID,
                title: "Figma Paste",
                subtitle: "No importable node changes were found",
            });
        } catch {
            return createDiagnosticFallbackDocument({
                payload,
                metaJson: null,
                warnings: ["fig-kiwi could not decode the Figma clipboard HTML payload."],
                decoderId: RAW_FIGMA_DECODER_ID,
                title: "Figma Paste",
                subtitle: "Decode failed, payload preserved for diagnostics",
            });
        }
    },
};