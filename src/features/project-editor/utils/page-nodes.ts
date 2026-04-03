import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import type { LegacyViewNode, PageNode, ProjectNode, ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

function normalizeSlugSegment(value: string) {
    return value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function slugifyProjectPageName(value: string) {
    return normalizeSlugSegment(value) || "page";
}

export function isPageNode(node: ProjectNode): node is PageNode {
    return node.kind === "page";
}

export function isLegacyViewNode(node: ProjectNode): node is LegacyViewNode {
    return node.kind === "view";
}

export function resolveProjectNodeKind(kind: ProjectNode["kind"]): ProjectNodeKind {
    return kind === "view" ? "page" : kind;
}

export function getPageNodeDocument(node: PageNode) {
    return node.data.designDocument;
}

export function migrateLegacyViewNode(node: LegacyViewNode, pageIndex: number): PageNode {
    const routeSlug = slugifyProjectPageName(node.data.route.replace(/^\/+/, ""));
    const fallbackSlug = slugifyProjectPageName(node.name);
    const slug = routeSlug === "page" ? fallbackSlug : routeSlug;

    return {
        ...node,
        kind: "page",
        data: {
            slug,
            index: pageIndex === 0 || node.data.route === "/",
            viewportMode: "desktop",
            designDocument: node.data.designDocument,
        },
    };
}

export function normalizePageNodes(nodes: ProjectNode[]): ProjectNode[] {
    let pageIndex = 0;

    return nodes.map((node) => {
        if (node.kind !== "view") {
            return node;
        }

        const migrated = migrateLegacyViewNode(node, pageIndex);
        pageIndex += 1;
        return migrated;
    });
}

export function getPageNodeName(node: PageNode) {
    return node.name.trim() || "Untitled Page";
}

export function getPageNodeDesignDocument(node: PageNode): DesignDocumentSnapshot | undefined {
    return node.data.designDocument;
}