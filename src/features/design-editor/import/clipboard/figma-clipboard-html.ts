const FIGMETA_COMMENT_PATTERN = /<!--\s*\(figmeta\)([\s\S]*?)\(\/figmeta\)\s*-->/i;
const FIGMA_COMMENT_PATTERN = /<!--\s*\(figma\)([\s\S]*?)\(\/figma\)\s*-->/i;

export interface ExtractedFigmaClipboardHtmlPayload {
    rawHtml: string;
    figmetaBase64: string | null;
    figmaBase64: string | null;
}

function extractCommentBlock(html: string, pattern: RegExp) {
    return html.match(pattern)?.[1]?.trim() ?? null;
}

function normalizeEncodedPayload(value: string | null) {
    if (!value) {
        return null;
    }

    return value
        .replace(FIGMETA_COMMENT_PATTERN, "$1")
        .replace(FIGMA_COMMENT_PATTERN, "$1")
        .replace(/\s+/g, "")
        .trim() || null;
}

function extractAttributePayload(html: string, attributeName: string) {
    if (typeof DOMParser === "undefined") {
        return null;
    }

    const parsed = new DOMParser().parseFromString(html, "text/html");
    const attributeNode = parsed.querySelector(`[${attributeName}]`);

    return attributeNode?.getAttribute(attributeName)?.trim() ?? null;
}

export function containsFigmaClipboardPayload(html: string) {
    return Boolean(
        extractCommentBlock(html, FIGMETA_COMMENT_PATTERN) ||
        extractCommentBlock(html, FIGMA_COMMENT_PATTERN) ||
        /data-metadata\s*=|data-buffer\s*=/i.test(html),
    );
}

export function extractFigmaClipboardHtmlPayload(html: string): ExtractedFigmaClipboardHtmlPayload | null {
    const figmetaBase64 = normalizeEncodedPayload(
        extractCommentBlock(html, FIGMETA_COMMENT_PATTERN) ?? extractAttributePayload(html, "data-metadata"),
    );
    const figmaBase64 = normalizeEncodedPayload(
        extractCommentBlock(html, FIGMA_COMMENT_PATTERN) ?? extractAttributePayload(html, "data-buffer"),
    );

    if (!figmetaBase64 && !figmaBase64) {
        return null;
    }

    return {
        rawHtml: html,
        figmetaBase64,
        figmaBase64,
    };
}