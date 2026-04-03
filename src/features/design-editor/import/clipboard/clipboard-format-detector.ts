import type { ClipboardPayload, DetectedClipboardFormat } from "@/src/features/design-editor/import/types/import.types";
import { containsFigmaClipboardPayload } from "@/src/features/design-editor/import/clipboard/figma-clipboard-html";

function containsSvgMarkup(value: string | undefined) {
    return typeof value === "string" && value.toLowerCase().includes("<svg");
}

export function detectClipboardFormat(payload: ClipboardPayload): DetectedClipboardFormat {
    const htmlContent = payload.strings["text/html"]?.trim();

    if (htmlContent && containsFigmaClipboardPayload(htmlContent)) {
        return {
            kind: "figma-clipboard-html",
            sourceMime: "text/html",
            content: htmlContent,
        };
    }

    const svgContent = payload.strings["image/svg+xml"]?.trim();

    if (svgContent) {
        return {
            kind: "svg",
            sourceMime: "image/svg+xml",
            content: svgContent,
        };
    }

    const plainText = payload.strings["text/plain"]?.trim();

    if (containsSvgMarkup(plainText)) {
        return {
            kind: "svg",
            sourceMime: "text/plain",
            content: plainText,
        };
    }

    if (htmlContent) {
        return {
            kind: containsSvgMarkup(htmlContent) ? "svg" : "html",
            sourceMime: "text/html",
            content: htmlContent,
        };
    }

    const pngFile = payload.files.find((entry) => entry.type === "image/png");

    if (pngFile) {
        return {
            kind: "png",
            sourceMime: "image/png",
            file: pngFile.file,
        };
    }

    if (plainText) {
        return {
            kind: "text",
            sourceMime: "text/plain",
            content: plainText,
        };
    }

    return {
        kind: "unsupported",
        sourceMime: null,
        availableTypes: payload.types,
    };
}