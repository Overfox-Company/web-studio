import type { ImportAstNode, ImportedAstDocument } from "@/src/features/design-editor/import/types/import.types";

function clampNumber(value: number, minimum = 0) {
    return Number.isFinite(value) ? Math.max(minimum, value) : minimum;
}

function normalizeNode(node: ImportAstNode): ImportAstNode {
    const normalizedChildren = node.children.map((child) => normalizeNode(child));

    return {
        ...node,
        x: Number.isFinite(node.x) ? node.x : 0,
        y: Number.isFinite(node.y) ? node.y : 0,
        width: clampNumber(node.width, 1),
        height: clampNumber(node.height, 1),
        rotation: Number.isFinite(node.rotation) ? node.rotation : 0,
        opacity: Math.min(1, Math.max(0, Number.isFinite(node.opacity) ? node.opacity : 1)),
        cornerRadius: clampNumber(node.cornerRadius, 0),
        children: normalizedChildren,
    };
}

function computeRootsBounds(roots: ImportAstNode[]) {
    if (roots.length === 0) {
        return {
            minX: 0,
            minY: 0,
        };
    }

    return {
        minX: Math.min(...roots.map((root) => root.x)),
        minY: Math.min(...roots.map((root) => root.y)),
    };
}

export function normalizeImportedAst(document: ImportedAstDocument): ImportedAstDocument {
    const normalizedRoots = document.roots.map((root) => normalizeNode(root));
    const bounds = computeRootsBounds(normalizedRoots);

    return {
        ...document,
        roots: normalizedRoots.map((root) => ({
            ...root,
            x: root.x - bounds.minX,
            y: root.y - bounds.minY,
        })),
    };
}