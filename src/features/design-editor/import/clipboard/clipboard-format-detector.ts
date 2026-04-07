import type { ClipboardPayload, DetectedClipboardFormat } from "@/src/features/design-editor/import/types/import.types";
import { containsFigmaClipboardPayload } from "@/src/features/design-editor/import/clipboard/figma-clipboard-html";
import {
    resolveLatestWebStudioClipboardPayload,
    resolveWebStudioClipboardPayloadFromMarker,
    WEBSTUDIO_DESIGN_JSON_MIME,
    WEBSTUDIO_DESIGN_JSON_TEXT_PREFIX,
} from "@/src/features/design-editor/import/adapters/webstudio-design-json.shared";

function containsSvgMarkup(value: string | undefined) {
    return typeof value === "string" && value.toLowerCase().includes("<svg");
}

export function detectClipboardFormat(payload: ClipboardPayload): DetectedClipboardFormat {
    const webStudioDesignContent = payload.strings[WEBSTUDIO_DESIGN_JSON_MIME]?.trim();

    if (webStudioDesignContent) {
        console.log("[DesignClipboard] detectFormat:webstudio-design-json", {
            availableTypes: payload.types,
        });
        return {
            kind: "webstudio-design-json",
            sourceMime: WEBSTUDIO_DESIGN_JSON_MIME,
            content: webStudioDesignContent,
        };
    }

    if (payload.types.includes(WEBSTUDIO_DESIGN_JSON_MIME)) {
        const cachedPayload = resolveLatestWebStudioClipboardPayload();

        if (cachedPayload) {
            console.log("[DesignClipboard] detectFormat:webstudio-design-json-latest-cache-fallback", {
                availableTypes: payload.types,
            });

            return {
                kind: "webstudio-design-json",
                sourceMime: WEBSTUDIO_DESIGN_JSON_MIME,
                content: cachedPayload,
            };
        }
    }

    const htmlContent = payload.strings["text/html"]?.trim();

    if (htmlContent && containsFigmaClipboardPayload(htmlContent)) {
        console.log("[DesignClipboard] detectFormat:figma-clipboard-html");
        return {
            kind: "figma-clipboard-html",
            sourceMime: "text/html",
            content: htmlContent,
        };
    }

    const svgContent = payload.strings["image/svg+xml"]?.trim();

    if (svgContent) {
        console.log("[DesignClipboard] detectFormat:svg-image-mime");
        return {
            kind: "svg",
            sourceMime: "image/svg+xml",
            content: svgContent,
        };
    }

    const plainText = payload.strings["text/plain"]?.trim();

    if (plainText?.startsWith(WEBSTUDIO_DESIGN_JSON_TEXT_PREFIX)) {
        const cachedPayload = resolveWebStudioClipboardPayloadFromMarker(plainText);

        if (cachedPayload) {
            console.log("[DesignClipboard] detectFormat:webstudio-design-json-text-fallback", {
                availableTypes: payload.types,
            });

            return {
                kind: "webstudio-design-json",
                sourceMime: "text/plain",
                content: cachedPayload,
            };
        }
    }

    if (containsSvgMarkup(plainText)) {
        console.log("[DesignClipboard] detectFormat:svg-plain-text");
        return {
            kind: "svg",
            sourceMime: "text/plain",
            content: plainText,
        };
    }

    if (htmlContent) {
        console.log("[DesignClipboard] detectFormat:html", {
            interpretedAs: containsSvgMarkup(htmlContent) ? "svg" : "html",
        });
        return {
            kind: containsSvgMarkup(htmlContent) ? "svg" : "html",
            sourceMime: "text/html",
            content: htmlContent,
        };
    }

    const pngFile = payload.files.find((entry) => entry.type === "image/png");

    if (pngFile) {
        console.log("[DesignClipboard] detectFormat:png-file");
        return {
            kind: "png",
            sourceMime: "image/png",
            file: pngFile.file,
        };
    }

    if (plainText) {
        console.log("[DesignClipboard] detectFormat:text");
        return {
            kind: "text",
            sourceMime: "text/plain",
            content: plainText,
        };
    }

    console.log("[DesignClipboard] detectFormat:unsupported", {
        availableTypes: payload.types,
    });

    return {
        kind: "unsupported",
        sourceMime: null,
        availableTypes: payload.types,
    };
}