import { nanoid } from "nanoid";

import { designEditorDefaults } from "@/src/customization/design-editor";
import type {
    DetectedClipboardFormat,
    ImportAdapter,
    ImportAstNode,
    ImportAstShadow,
} from "@/src/features/design-editor/import/types/import.types";

function createEmptyImportNode(type: ImportAstNode["type"], name: string): ImportAstNode {
    return {
        tempId: nanoid(),
        type,
        name,
        children: [],
        x: 0,
        y: 0,
        width: 1,
        height: 1,
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
    };
}

function parseNumber(value: string | null | undefined, fallback = 0) {
    if (!value) {
        return fallback;
    }

    const parsed = Number.parseFloat(value.replace(/px$/i, "").trim());

    return Number.isFinite(parsed) ? parsed : fallback;
}

function getStyleValue(element: Element, property: string) {
    const attributeValue = element.getAttribute(property);

    if (attributeValue) {
        return attributeValue;
    }

    const styleValue = (element as HTMLElement).style?.getPropertyValue?.(property);

    return styleValue || null;
}

function clampSize(value: number) {
    return Math.max(1, value);
}

function estimateTextWidth(content: string, fontSize: number) {
    if (typeof document === "undefined") {
        return Math.max(120, Math.round(content.length * fontSize * 0.58));
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        return Math.max(120, Math.round(content.length * fontSize * 0.58));
    }

    context.font = `${fontSize}px IBM Plex Sans`;
    return Math.max(120, Math.ceil(context.measureText(content).width));
}

function parseDropShadow(value: string | null): ImportAstShadow | null {
    if (!value || !value.includes("drop-shadow(")) {
        return null;
    }

    const match = value.match(/drop-shadow\(([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+(.+?)\)/i);

    if (!match) {
        return null;
    }

    return {
        x: Number.parseFloat(match[1]),
        y: Number.parseFloat(match[2]),
        blur: Number.parseFloat(match[3]),
        spread: 0,
        color: match[4].trim(),
    };
}

function parseTransform(value: string | null) {
    if (!value) {
        return {
            translateX: 0,
            translateY: 0,
            rotation: 0,
            supported: true,
        };
    }

    let translateX = 0;
    let translateY = 0;
    let rotation = 0;
    let supported = true;
    const tokens = value.match(/[a-zA-Z]+\([^\)]+\)/g) ?? [];

    for (const token of tokens) {
        if (token.startsWith("translate(")) {
            const values = token.slice(10, -1).split(/[\s,]+/).filter(Boolean).map((item) => Number.parseFloat(item));
            translateX += values[0] ?? 0;
            translateY += values[1] ?? 0;
            continue;
        }

        if (token.startsWith("rotate(")) {
            const values = token.slice(7, -1).split(/[\s,]+/).filter(Boolean).map((item) => Number.parseFloat(item));

            if (values.length <= 1) {
                rotation += values[0] ?? 0;
                continue;
            }
        }

        supported = false;
    }

    return {
        translateX,
        translateY,
        rotation,
        supported,
    };
}

function measureSvgMarkup(markup: string) {
    if (typeof document === "undefined") {
        return {
            x: 0,
            y: 0,
            width: 240,
            height: 180,
        };
    }

    const sandbox = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    sandbox.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    sandbox.setAttribute("width", "0");
    sandbox.setAttribute("height", "0");
    sandbox.style.position = "absolute";
    sandbox.style.left = "-99999px";
    sandbox.style.top = "-99999px";
    sandbox.style.visibility = "hidden";
    sandbox.innerHTML = markup;
    document.body.appendChild(sandbox);

    const target = sandbox.lastElementChild as SVGGraphicsElement | SVGSVGElement | null;

    try {
        if (target && "getBBox" in target) {
            const box = (target as SVGGraphicsElement).getBBox();

            return {
                x: Number.isFinite(box.x) ? box.x : 0,
                y: Number.isFinite(box.y) ? box.y : 0,
                width: clampSize(box.width || parseNumber(target.getAttribute("width"), 240)),
                height: clampSize(box.height || parseNumber(target.getAttribute("height"), 180)),
            };
        }
    } catch {
        // Ignore measurement failures and fall back to attrs below.
    } finally {
        sandbox.remove();
    }

    return {
        x: 0,
        y: 0,
        width: 240,
        height: 180,
    };
}

function hasComplexSvgFeatures(svgElement: SVGSVGElement) {
    return Boolean(
        svgElement.querySelector("defs, clipPath, mask, filter, pattern, foreignObject, use") ||
        svgElement.querySelector("[clip-path], [mask], [filter], [style*='url(#']"),
    );
}

function createSvgAssetImportNode(markup: string, name: string, x = 0, y = 0): ImportAstNode {
    const measured = measureSvgMarkup(markup);
    const node = createEmptyImportNode("svg-asset", name);
    const hasSvgRoot = markup.trim().startsWith("<svg");
    const viewBox = `${measured.x} ${measured.y} ${Math.max(1, measured.width)} ${Math.max(1, measured.height)}`;
    const svgMarkup = hasSvgRoot
        ? markup
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${markup}</svg>`;

    node.x = x;
    node.y = y;
    node.width = clampSize(measured.width);
    node.height = clampSize(measured.height);
    node.rawData = {
        svgMarkup,
        viewBox,
    };

    return node;
}

function createRectangleNode(element: SVGRectElement, transform: ReturnType<typeof parseTransform>): ImportAstNode {
    const node = createEmptyImportNode("rectangle", "Rectangle");

    node.x = parseNumber(element.getAttribute("x")) + transform.translateX;
    node.y = parseNumber(element.getAttribute("y")) + transform.translateY;
    node.width = clampSize(parseNumber(element.getAttribute("width"), 120));
    node.height = clampSize(parseNumber(element.getAttribute("height"), 80));
    node.rotation = transform.rotation;
    node.opacity = parseNumber(getStyleValue(element, "opacity"), 1);
    node.cornerRadius = Math.max(parseNumber(element.getAttribute("rx")), parseNumber(element.getAttribute("ry")));

    const fill = getStyleValue(element, "fill");
    const stroke = getStyleValue(element, "stroke");
    const strokeWidth = parseNumber(getStyleValue(element, "stroke-width"), 0);

    if (fill && fill !== "none") {
        node.fills.push({
            type: "solid",
            value: fill,
            opacity: parseNumber(getStyleValue(element, "fill-opacity"), 1),
        });
    }

    if (stroke && stroke !== "none" && strokeWidth > 0) {
        node.strokes.push({
            color: stroke,
            width: strokeWidth,
            opacity: parseNumber(getStyleValue(element, "stroke-opacity"), 1),
        });
    }

    node.shadow = parseDropShadow(getStyleValue(element, "filter"));
    return node;
}

function createTextNode(element: SVGTextElement, transform: ReturnType<typeof parseTransform>): ImportAstNode {
    const content = (element.textContent ?? "").trim() || "Text";
    const fontSize = parseNumber(getStyleValue(element, "font-size"), 24);
    const node = createEmptyImportNode("text", "Text");
    const measured = measureSvgMarkup(element.outerHTML);
    const anchor = getStyleValue(element, "text-anchor") ?? "start";

    node.x = (parseNumber(element.getAttribute("x")) || measured.x) + transform.translateX;
    node.y = (parseNumber(element.getAttribute("y")) || measured.y) + transform.translateY - fontSize;
    node.width = clampSize(measured.width || estimateTextWidth(content, fontSize));
    node.height = clampSize(measured.height || Math.ceil(fontSize * 1.2));
    node.rotation = transform.rotation;
    node.opacity = parseNumber(getStyleValue(element, "opacity"), 1);
    node.text = {
        content,
        fontFamily: getStyleValue(element, "font-family") ?? designEditorDefaults.typography.fontFamily,
        fontSize,
        fontWeight: parseNumber(getStyleValue(element, "font-weight"), 500),
        lineHeight: (() => {
            const lineHeight = getStyleValue(element, "line-height");

            if (!lineHeight) {
                return 1.2;
            }

            if (lineHeight.endsWith("px")) {
                return parseNumber(lineHeight, fontSize * 1.2) / fontSize;
            }

            return parseNumber(lineHeight, 1.2);
        })(),
        textAlign: anchor === "middle" ? "center" : anchor === "end" ? "right" : "left",
        color: getStyleValue(element, "fill") ?? designEditorDefaults.typography.color,
    };
    return node;
}

function createImageNode(element: SVGImageElement, transform: ReturnType<typeof parseTransform>): ImportAstNode {
    const href = element.getAttribute("href") ?? element.getAttributeNS("http://www.w3.org/1999/xlink", "href") ?? "";
    const node = createEmptyImportNode("image", "Image");

    node.x = parseNumber(element.getAttribute("x")) + transform.translateX;
    node.y = parseNumber(element.getAttribute("y")) + transform.translateY;
    node.width = clampSize(parseNumber(element.getAttribute("width"), 240));
    node.height = clampSize(parseNumber(element.getAttribute("height"), 180));
    node.rotation = transform.rotation;
    node.opacity = parseNumber(getStyleValue(element, "opacity"), 1);
    node.image = {
        src: href,
        objectFit: "contain",
    };
    node.fills.push({
        type: "image",
        value: href,
        opacity: 1,
    });
    return node;
}

function localizeChildren(children: ImportAstNode[]) {
    if (children.length === 0) {
        return {
            x: 0,
            y: 0,
            width: 1,
            height: 1,
        };
    }

    const minX = Math.min(...children.map((child) => child.x));
    const minY = Math.min(...children.map((child) => child.y));
    const maxX = Math.max(...children.map((child) => child.x + child.width));
    const maxY = Math.max(...children.map((child) => child.y + child.height));

    for (const child of children) {
        child.x -= minX;
        child.y -= minY;
    }

    return {
        x: minX,
        y: minY,
        width: clampSize(maxX - minX),
        height: clampSize(maxY - minY),
    };
}

function parseSvgNode(element: Element): ImportAstNode | null {
    const tagName = element.tagName.toLowerCase();
    const transform = parseTransform(element.getAttribute("transform"));

    if (!transform.supported) {
        return createSvgAssetImportNode(element.outerHTML, tagName);
    }

    if (tagName === "g") {
        const node = createEmptyImportNode("group", "Group");
        node.transform = element.getAttribute("transform");
        node.opacity = parseNumber(getStyleValue(element, "opacity"), 1);
        node.children = Array.from(element.children)
            .map((child) => parseSvgNode(child))
            .filter((child): child is ImportAstNode => Boolean(child));

        if (node.children.length === 0) {
            return createSvgAssetImportNode(element.outerHTML, "Group");
        }

        const localizedBounds = localizeChildren(node.children);
        node.x = localizedBounds.x + transform.translateX;
        node.y = localizedBounds.y + transform.translateY;
        node.width = localizedBounds.width;
        node.height = localizedBounds.height;
        node.rotation = transform.rotation;
        return node;
    }

    if (tagName === "rect") {
        return createRectangleNode(element as SVGRectElement, transform);
    }

    if (tagName === "text") {
        return createTextNode(element as SVGTextElement, transform);
    }

    if (tagName === "image") {
        return createImageNode(element as SVGImageElement, transform);
    }

    if (["path", "circle", "ellipse", "line", "polygon", "polyline", "clipPath"].includes(tagName)) {
        return createSvgAssetImportNode(element.outerHTML, tagName, transform.translateX, transform.translateY);
    }

    return null;
}

function extractSvgMarkup(content: string, sourceMime: "image/svg+xml" | "text/plain" | "text/html") {
    if (sourceMime !== "text/html") {
        return content;
    }

    const documentFragment = new DOMParser().parseFromString(content, "text/html");
    const svgElement = documentFragment.querySelector("svg");

    return svgElement?.outerHTML ?? content;
}

export const svgImportAdapter: ImportAdapter<Extract<DetectedClipboardFormat, { kind: "svg" }>> = {
    id: "public-svg-import",
    canHandle: (input): input is Extract<DetectedClipboardFormat, { kind: "svg" }> => input.kind === "svg",
    importContent: async (input) => {
        const markup = extractSvgMarkup(input.content, input.sourceMime);
        const parsed = new DOMParser().parseFromString(markup, "image/svg+xml");
        const svgElement = parsed.querySelector("svg");

        if (!svgElement) {
            return {
                roots: [createSvgAssetImportNode(markup, "Imported SVG")],
                sourceFormat: "svg",
                fidelity: "public",
                warnings: ["SVG markup could not be parsed into editable nodes, preserved as raw SVG."],
            };
        }

        if (hasComplexSvgFeatures(svgElement)) {
            return {
                roots: [createSvgAssetImportNode(svgElement.outerHTML, "Imported SVG")],
                sourceFormat: "svg",
                fidelity: "public",
                warnings: ["Complex SVG features were preserved as a raw SVG asset for fidelity."],
            };
        }

        const rootNode = createEmptyImportNode("frame", "Imported SVG");
        const width = parseNumber(svgElement.getAttribute("width"));
        const height = parseNumber(svgElement.getAttribute("height"));
        const viewBox = svgElement.getAttribute("viewBox")?.split(/[\s,]+/).map((item) => Number.parseFloat(item)) ?? [];
        rootNode.width = clampSize(width || viewBox[2] || 240);
        rootNode.height = clampSize(height || viewBox[3] || 180);
        rootNode.clipContent = (svgElement.getAttribute("overflow") ?? "visible") !== "visible";
        rootNode.layout = {
            mode: "absolute",
            clipContent: rootNode.clipContent,
        };
        rootNode.children = Array.from(svgElement.children)
            .map((child) => parseSvgNode(child))
            .filter((child): child is ImportAstNode => Boolean(child));

        return {
            roots: [rootNode],
            sourceFormat: "svg",
            fidelity: "public",
            warnings: [],
        };
    },
};