import type { DesignDocumentSnapshot, DesignNode } from "@/src/features/design-editor/types/design.types";
import type { LibraryComponent } from "@/src/features/component-library/types/component.types";
import { isContainerNode } from "@/src/features/design-editor/utils/design-tree";
import { getCompileNodeClassName } from "@/src/features/project-compile/CssCompiler";
import type { ResolvedExportPage, StaticExportFile } from "@/src/features/project-compile/types/compile.types";

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderChildren(
    document: DesignDocumentSnapshot,
    node: DesignNode,
    imageSrcByNodeId: Record<string, string>,
    libraryComponentsById: Record<string, LibraryComponent>,
): string {
    if (!isContainerNode(node)) {
        return "";
    }

    return node.children
        .map((childId) => renderNode(document, childId, imageSrcByNodeId, libraryComponentsById))
        .join("");
}

function renderNode(
    document: DesignDocumentSnapshot,
    nodeId: string,
    imageSrcByNodeId: Record<string, string>,
    libraryComponentsById: Record<string, LibraryComponent>,
): string {
    const node = document.nodes[nodeId];

    if (!node || !node.visible) {
        return "";
    }

    const className = getCompileNodeClassName(node.id);

    switch (node.type) {
        case "text":
            return `<p class="${className}">${escapeHtml(node.text).replace(/\n/g, "<br />")}</p>`;
        case "image": {
            const src = imageSrcByNodeId[node.id] ?? "";
            return `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(node.name || "Image")}" />`;
        }
        case "svg-asset":
            return `<div class="${className} ws-svg-asset" aria-label="${escapeHtml(node.name || "Vector")}">${node.svgMarkup}</div>`;
        case "component-instance": {
            const component = libraryComponentsById[node.variantId];
            const nestedMarkup = component
                ? renderNode(component.document, component.document.rootNodeId, imageSrcByNodeId, libraryComponentsById)
                : `<div>Missing component</div>`;

            return `<div class="${className} ws-component-instance">${nestedMarkup}</div>`;
        }
        case "rectangle":
            return `<div class="${className}"></div>`;
        case "group":
        case "frame": {
            const children = renderChildren(document, node, imageSrcByNodeId, libraryComponentsById);
            const tag = nodeId === document.rootNodeId ? "main" : "div";
            const shellClass = nodeId === document.rootNodeId ? " ws-page-shell" : "";
            return `<${tag} class="${className}${shellClass}">${children}</${tag}>`;
        }
    }
}

function buildHtmlDocument(title: string, bodyMarkup: string) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="./assets/styles.css" />
  </head>
  <body>
    ${bodyMarkup}
  </body>
</html>
`;
}

export function compileProjectHtml(
    pages: ResolvedExportPage[],
    imageSrcByNodeId: Record<string, string>,
    libraryComponentsById: Record<string, LibraryComponent> = {},
): StaticExportFile[] {
    return pages.map((page) => ({
        path: page.fileName,
        content: buildHtmlDocument(page.title, renderNode(page.document, page.document.rootNodeId, imageSrcByNodeId, libraryComponentsById)),
    }));
}