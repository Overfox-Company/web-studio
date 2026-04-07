import type {
    ImportedAstDocument,
    ImportAstNode,
    ImportAstFill,
    ImportAstStroke,
} from "@/src/features/design-editor/import/types/import.types";
import type { DesignDocumentSnapshot, DesignNode } from "@/src/features/design-editor/types/design.types";

export const WEBSTUDIO_DESIGN_JSON_MIME = "application/vnd.webstudio.design+json";
export const WEBSTUDIO_DESIGN_JSON_TEXT_PREFIX = "webstudio-design-json://";

const WEBSTUDIO_DESIGN_JSON_SESSION_PREFIX = "webstudio.design.clipboard.";

let lastClipboardEntry: { token: string; content: string } | null = null;

interface WebStudioClipboardPayload {
    version: 1;
    document: ImportedAstDocument;
}

function createClipboardToken() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionStorage() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

export function storeWebStudioClipboardPayload(content: string) {
    const token = createClipboardToken();

    lastClipboardEntry = { token, content };

    const storage = getSessionStorage();

    if (storage) {
        storage.setItem(`${WEBSTUDIO_DESIGN_JSON_SESSION_PREFIX}${token}`, content);
    }

    console.log("[DesignClipboard] cachePayload:stored", {
        token,
        payloadLength: content.length,
    });

    return `${WEBSTUDIO_DESIGN_JSON_TEXT_PREFIX}${token}`;
}

export function resolveWebStudioClipboardPayloadFromMarker(marker: string): string | null {
    if (!marker.startsWith(WEBSTUDIO_DESIGN_JSON_TEXT_PREFIX)) {
        return null;
    }

    const token = marker.slice(WEBSTUDIO_DESIGN_JSON_TEXT_PREFIX.length);

    if (lastClipboardEntry?.token === token) {
        console.log("[DesignClipboard] cachePayload:resolved-from-memory", { token });
        return lastClipboardEntry.content;
    }

    const storage = getSessionStorage();
    const storedValue = storage?.getItem(`${WEBSTUDIO_DESIGN_JSON_SESSION_PREFIX}${token}`) ?? null;

    if (storedValue) {
        console.log("[DesignClipboard] cachePayload:resolved-from-session", { token });
        return storedValue;
    }

    console.log("[DesignClipboard] cachePayload:missing", { token });
    return null;
}

export function resolveLatestWebStudioClipboardPayload(): string | null {
    if (lastClipboardEntry?.content) {
        console.log("[DesignClipboard] cachePayload:resolved-latest-from-memory", {
            token: lastClipboardEntry.token,
        });
        return lastClipboardEntry.content;
    }

    const storage = getSessionStorage();

    if (!storage) {
        console.log("[DesignClipboard] cachePayload:no-session-storage");
        return null;
    }

    const latestClipboardKey = Object.keys(storage)
        .filter((key) => key.startsWith(WEBSTUDIO_DESIGN_JSON_SESSION_PREFIX))
        .sort()
        .at(-1);

    if (!latestClipboardKey) {
        console.log("[DesignClipboard] cachePayload:no-latest-entry");
        return null;
    }

    const latestContent = storage.getItem(latestClipboardKey);

    if (latestContent) {
        console.log("[DesignClipboard] cachePayload:resolved-latest-from-session", {
            key: latestClipboardKey,
        });
        return latestContent;
    }

    console.log("[DesignClipboard] cachePayload:latest-entry-empty", {
        key: latestClipboardKey,
    });
    return null;
}

function createFills(node: DesignNode): ImportAstFill[] {
    if (node.type === "image" && node.src && !node.src.startsWith("placeholder://")) {
        return [{ type: "image", value: node.src, opacity: node.style.opacity }];
    }

    return [{ type: "solid", value: node.style.fill, opacity: node.style.opacity }];
}

function createStrokes(node: DesignNode): ImportAstStroke[] {
    if (!node.style.stroke) {
        return [];
    }

    return [{
        color: node.style.stroke,
        width: node.style.strokeWidth,
        opacity: 1,
    }];
}

function serializeNode(document: DesignDocumentSnapshot, nodeId: string, offset: { x: number; y: number }): ImportAstNode | null {
    const node = document.nodes[nodeId];

    if (!node || node.type === "component-instance") {
        return null;
    }

    return {
        tempId: node.id,
        type: node.type,
        name: node.name,
        children: node.children
            .map((childId) => serializeNode(document, childId, { x: 0, y: 0 }))
            .filter((child): child is ImportAstNode => Boolean(child)),
        x: node.x - offset.x,
        y: node.y - offset.y,
        width: node.width,
        height: node.height,
        rotation: node.rotation,
        opacity: node.style.opacity,
        fills: createFills(node),
        strokes: createStrokes(node),
        cornerRadius: node.style.borderRadius,
        shadow: node.style.shadow,
        text: node.type === "text"
            ? {
                content: node.text,
                fontFamily: node.style.typography?.fontFamily ?? "IBM Plex Sans",
                fontSize: node.style.typography?.fontSize ?? 16,
                fontWeight: node.style.typography?.fontWeight ?? 400,
                lineHeight: node.style.typography?.lineHeight ?? 1.5,
                textAlign: node.style.typography?.textAlign ?? "left",
                color: node.style.typography?.color ?? "#ffffff",
            }
            : null,
        image: node.type === "image"
            ? {
                src: node.src,
                objectFit: node.style.image?.objectFit ?? "cover",
            }
            : null,
        transform: null,
        layout: node.type === "frame"
            ? {
                mode: node.layoutMode,
                clipContent: node.clipContent,
                direction: node.autoLayout.direction,
                justifyContent: node.autoLayout.justifyContent,
                alignItems: node.autoLayout.alignItems,
                gap: node.autoLayout.gap,
                padding: node.layoutMode === "auto" ? node.autoLayout.padding : node.padding,
            }
            : null,
        clipContent: node.type === "frame" ? node.clipContent : false,
        rawData: {
            sizing: node.sizing,
            svgMarkup: node.type === "svg-asset" ? node.svgMarkup : undefined,
            viewBox: node.type === "svg-asset" ? node.viewBox : undefined,
            diagnostics: node.type === "svg-asset" ? node.diagnostics : undefined,
        },
    };
}

export function serializeSelectionToWebStudioClipboard(document: DesignDocumentSnapshot, nodeIds: string[]): string | null {
    const uniqueNodeIds = Array.from(new Set(nodeIds)).filter((nodeId) => Boolean(document.nodes[nodeId]));

    console.log("[DesignClipboard] serializeSelection:start", {
        requestedNodeIds: nodeIds,
        uniqueNodeIds,
    });

    if (uniqueNodeIds.length === 0) {
        console.log("[DesignClipboard] serializeSelection:empty");
        return null;
    }

    const filteredRootIds = uniqueNodeIds.filter((nodeId) => {
        let parentId = document.nodes[nodeId]?.parentId ?? null;

        while (parentId) {
            if (uniqueNodeIds.includes(parentId)) {
                return false;
            }

            parentId = document.nodes[parentId]?.parentId ?? null;
        }

        return true;
    });

    const minX = Math.min(...filteredRootIds.map((nodeId) => document.nodes[nodeId].x));
    const minY = Math.min(...filteredRootIds.map((nodeId) => document.nodes[nodeId].y));
    const roots = filteredRootIds
        .map((nodeId) => serializeNode(document, nodeId, { x: minX, y: minY }))
        .filter((node): node is ImportAstNode => Boolean(node));

    if (roots.length === 0) {
        console.log("[DesignClipboard] serializeSelection:no-roots");
        return null;
    }

    const payload: WebStudioClipboardPayload = {
        version: 1,
        document: {
            roots,
            sourceFormat: "webstudio-design-json",
            fidelity: "bridge",
            warnings: [],
        },
    };

    console.log("[DesignClipboard] serializeSelection:done", {
        filteredRootIds,
        rootCount: roots.length,
        sourceFormat: payload.document.sourceFormat,
    });

    return JSON.stringify(payload);
}

export function parseWebStudioClipboardPayload(content: string): ImportedAstDocument | null {
    try {
        console.log("[DesignClipboard] parsePayload:start", {
            payloadLength: content.length,
        });

        const parsed = JSON.parse(content) as WebStudioClipboardPayload;

        if (parsed.version !== 1 || !parsed.document || !Array.isArray(parsed.document.roots)) {
            console.log("[DesignClipboard] parsePayload:invalid-shape", parsed);
            return null;
        }

        console.log("[DesignClipboard] parsePayload:done", {
            rootCount: parsed.document.roots.length,
            sourceFormat: parsed.document.sourceFormat,
        });

        return parsed.document;
    } catch {
        console.log("[DesignClipboard] parsePayload:json-error");
        return null;
    }
}