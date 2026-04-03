import { nanoid } from "nanoid";

import { designEditorDefaults } from "@/src/customization/design-editor";
import type { DetectedClipboardFormat, ImportAdapter, ImportedAstDocument } from "@/src/features/design-editor/import/types/import.types";
import { svgImportAdapter } from "@/src/features/design-editor/import/adapters/svg-import.adapter";

function createTextFallback(content: string): ImportedAstDocument {
    return {
        roots: [
            {
                tempId: nanoid(),
                type: "text",
                name: "Pasted Text",
                children: [],
                x: 0,
                y: 0,
                width: 320,
                height: 48,
                rotation: 0,
                opacity: 1,
                fills: [],
                strokes: [],
                cornerRadius: 0,
                shadow: null,
                text: {
                    content,
                    fontFamily: designEditorDefaults.typography.fontFamily,
                    fontSize: 28,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    textAlign: designEditorDefaults.typography.textAlign,
                    color: designEditorDefaults.typography.color,
                },
                image: null,
                transform: null,
                layout: null,
                clipContent: false,
            },
        ],
        sourceFormat: "html",
        fidelity: "public",
        warnings: [],
    };
}

export const htmlImportAdapter: ImportAdapter<Extract<DetectedClipboardFormat, { kind: "html" }>> = {
    id: "public-html-import",
    canHandle: (input): input is Extract<DetectedClipboardFormat, { kind: "html" }> => input.kind === "html",
    importContent: async (input) => {
        const parsed = new DOMParser().parseFromString(input.content, "text/html");
        const svgElement = parsed.querySelector("svg");

        if (svgElement) {
            return svgImportAdapter.importContent({
                kind: "svg",
                sourceMime: "text/html",
                content: svgElement.outerHTML,
            });
        }

        const imageElement = parsed.querySelector("img[src]");
        const imageSource = imageElement?.getAttribute("src")?.trim() ?? "";

        if (imageSource.startsWith("data:image/svg+xml")) {
            return svgImportAdapter.importContent({
                kind: "svg",
                sourceMime: "text/plain",
                content: decodeURIComponent(imageSource.split(",", 2)[1] ?? ""),
            });
        }

        if (imageSource.startsWith("data:image/png")) {
            return {
                roots: [
                    {
                        tempId: nanoid(),
                        type: "image",
                        name: "Pasted Image",
                        children: [],
                        x: 0,
                        y: 0,
                        width: Number.parseFloat(imageElement?.getAttribute("width") ?? "320") || 320,
                        height: Number.parseFloat(imageElement?.getAttribute("height") ?? "240") || 240,
                        rotation: 0,
                        opacity: 1,
                        fills: [{ type: "image", value: imageSource, opacity: 1 }],
                        strokes: [],
                        cornerRadius: 0,
                        shadow: null,
                        text: null,
                        image: {
                            src: imageSource,
                            objectFit: "contain",
                        },
                        transform: null,
                        layout: null,
                        clipContent: false,
                    },
                ],
                sourceFormat: "html",
                fidelity: "public",
                warnings: [],
            };
        }

        const textContent = (parsed.body.innerText || parsed.body.textContent || "").trim();

        if (textContent) {
            return createTextFallback(textContent);
        }

        return {
            roots: [],
            sourceFormat: "html",
            fidelity: "public",
            warnings: ["HTML clipboard content did not contain an importable SVG, image, or text payload."],
        };
    },
};