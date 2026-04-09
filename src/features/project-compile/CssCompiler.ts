import type { DesignDocumentSnapshot, DesignNode, DesignTextAlign } from "@/src/features/design-editor/types/design.types";
import type { LibraryComponent } from "@/src/features/component-library/types/component.types";
import {
    getNodeLocalFrame,
    isAutoLayoutFrame,
    isContainerNode,
    isFrameNode,
} from "@/src/features/design-editor/utils/design-tree";
import type { ResolvedExportPage } from "@/src/features/project-compile/types/compile.types";

function sanitizeClassName(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "node";
}

function toClassName(nodeId: string) {
    return `ws-node-${sanitizeClassName(nodeId)}`;
}

function pushDeclaration(target: string[], property: string, value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") {
        return;
    }

    target.push(`  ${property}: ${value};`);
}

function px(value: number) {
    return `${Math.round(value * 100) / 100}px`;
}

function mapJustifyContent(value: "start" | "center" | "end" | "space-between") {
    switch (value) {
        case "center":
            return "center";
        case "end":
            return "flex-end";
        case "space-between":
            return "space-between";
        default:
            return "flex-start";
    }
}

function mapAlignItems(value: "start" | "center" | "end" | "stretch") {
    switch (value) {
        case "center":
            return "center";
        case "end":
            return "flex-end";
        case "stretch":
            return "stretch";
        default:
            return "flex-start";
    }
}

function mapTextAlign(value: DesignTextAlign | undefined) {
    return value ?? "left";
}

function compileNodeRule(document: DesignDocumentSnapshot, node: DesignNode, isRoot: boolean) {
    const className = toClassName(node.id);
    const declarations: string[] = [];
    const parentNode = node.parentId ? document.nodes[node.parentId] : null;
    const parentUsesAutoLayout = Boolean(parentNode && isAutoLayoutFrame(parentNode));
    const frame = getNodeLocalFrame(document, node.id);

    if (!node.visible) {
        pushDeclaration(declarations, "display", "none");
    }

    if (isRoot) {
        pushDeclaration(declarations, "position", "relative");
        pushDeclaration(declarations, "width", px(frame.width));
        pushDeclaration(declarations, "min-height", px(frame.height));
    } else if (parentUsesAutoLayout) {
        pushDeclaration(declarations, "position", "relative");
        pushDeclaration(declarations, "width", px(frame.width));
        pushDeclaration(declarations, "height", px(frame.height));
        pushDeclaration(declarations, "flex-shrink", 0);
    } else {
        pushDeclaration(declarations, "position", "absolute");
        pushDeclaration(declarations, "left", px(frame.x));
        pushDeclaration(declarations, "top", px(frame.y));
        pushDeclaration(declarations, "width", px(frame.width));
        pushDeclaration(declarations, "height", px(frame.height));
    }

    if (node.rotation) {
        pushDeclaration(declarations, "transform", `rotate(${node.rotation}deg)`);
        pushDeclaration(declarations, "transform-origin", "center center");
    }

    pushDeclaration(declarations, "opacity", node.style.opacity === 1 ? null : String(node.style.opacity));
    pushDeclaration(declarations, "border-radius", node.style.borderRadius > 0 ? px(node.style.borderRadius) : null);

    if (node.style.fill && node.type !== "text") {
        pushDeclaration(declarations, "background", node.style.fill === "transparent" ? null : node.style.fill);
    }

    if (node.style.stroke) {
        pushDeclaration(declarations, "border", `${node.style.strokeWidth}px solid ${node.style.stroke}`);
    }

    if (node.style.shadow) {
        const shadow = node.style.shadow;
        pushDeclaration(declarations, "box-shadow", `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`);
    }

    if (isFrameNode(node)) {
        pushDeclaration(declarations, "overflow", node.clipContent ? "hidden" : null);

        if (node.layoutMode === "auto") {
            pushDeclaration(declarations, "display", "flex");
            pushDeclaration(declarations, "flex-direction", node.autoLayout.direction === "horizontal" ? "row" : "column");
            pushDeclaration(declarations, "justify-content", mapJustifyContent(node.autoLayout.justifyContent));
            pushDeclaration(declarations, "align-items", mapAlignItems(node.autoLayout.alignItems));
            pushDeclaration(declarations, "gap", px(node.autoLayout.gap));
            pushDeclaration(
                declarations,
                "padding",
                `${px(node.autoLayout.padding.top)} ${px(node.autoLayout.padding.right)} ${px(node.autoLayout.padding.bottom)} ${px(node.autoLayout.padding.left)}`,
            );
        }
    }

    if (node.type === "group") {
        pushDeclaration(declarations, "overflow", "visible");
    }

    if (node.type === "text") {
        pushDeclaration(declarations, "margin", 0);
        pushDeclaration(declarations, "white-space", "pre-wrap");
        pushDeclaration(declarations, "color", node.style.typography?.color ?? "#111827");
        pushDeclaration(declarations, "font-family", node.style.typography?.fontFamily);
        pushDeclaration(declarations, "font-size", node.style.typography?.fontSize ? px(node.style.typography.fontSize) : null);
        pushDeclaration(declarations, "font-weight", node.style.typography?.fontWeight);
        pushDeclaration(declarations, "line-height", node.style.typography?.lineHeight);
        pushDeclaration(declarations, "text-align", mapTextAlign(node.style.typography?.textAlign));
    }

    if (node.type === "image") {
        pushDeclaration(declarations, "display", "block");
        pushDeclaration(declarations, "object-fit", node.style.image?.objectFit ?? "contain");
    }

    if (node.type === "svg-asset") {
        pushDeclaration(declarations, "display", "block");
    }

    if (node.type === "component-instance") {
        pushDeclaration(declarations, "overflow", "visible");
    }

    return `.${className} {\n${declarations.join("\n")}\n}`;
}

function walkNodeRules(
    document: DesignDocumentSnapshot,
    nodeId: string,
    rules: string[],
    libraryComponentsById: Record<string, LibraryComponent>,
    visitedVariantIds: Set<string>,
) {
    const node = document.nodes[nodeId];

    if (!node) {
        return;
    }

    rules.push(compileNodeRule(document, node, nodeId === document.rootNodeId));

    if (node.type === "component-instance") {
        const component = libraryComponentsById[node.variantId];

        if (component && !visitedVariantIds.has(component.id)) {
            visitedVariantIds.add(component.id);
            walkNodeRules(component.document, component.document.rootNodeId, rules, libraryComponentsById, visitedVariantIds);
        }
    }

    if (isContainerNode(node)) {
        for (const childId of node.children) {
            walkNodeRules(document, childId, rules, libraryComponentsById, visitedVariantIds);
        }
    }
}

export function getCompileNodeClassName(nodeId: string) {
    return toClassName(nodeId);
}

export function compileProjectCss(pages: ResolvedExportPage[], libraryComponentsById: Record<string, LibraryComponent> = {}) {
    const rules = [
        "* { box-sizing: border-box; }",
        "html, body { margin: 0; padding: 0; }",
        "body { min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; font-family: \"IBM Plex Sans\", sans-serif; color: #111827; background: #ffffff; }",
        ".ws-page-shell { min-height: 100vh; margin-inline: auto; }",
        ".ws-svg-asset > svg { width: 100%; height: 100%; display: block; }",
    ];

    for (const page of pages) {
        walkNodeRules(page.document, page.document.rootNodeId, rules, libraryComponentsById, new Set());
    }

    return `${rules.join("\n\n")}\n`;
}