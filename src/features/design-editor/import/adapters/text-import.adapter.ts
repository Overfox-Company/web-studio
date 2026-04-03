import { nanoid } from "nanoid";

import { designEditorDefaults } from "@/src/customization/design-editor";
import type { DetectedClipboardFormat, ImportAdapter } from "@/src/features/design-editor/import/types/import.types";

function measureTextBlock(content: string, fontSize: number, lineHeight: number) {
    const lines = content.split(/\r?\n/);

    if (typeof document === "undefined") {
        return {
            width: Math.max(160, Math.max(...lines.map((line) => line.length), 1) * fontSize * 0.58),
            height: Math.max(48, lines.length * fontSize * lineHeight),
        };
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        return {
            width: Math.max(160, Math.max(...lines.map((line) => line.length), 1) * fontSize * 0.58),
            height: Math.max(48, lines.length * fontSize * lineHeight),
        };
    }

    context.font = `${fontSize}px IBM Plex Sans`;
    const width = Math.ceil(Math.max(...lines.map((line) => context.measureText(line || " ").width), 160));

    return {
        width,
        height: Math.max(48, Math.ceil(lines.length * fontSize * lineHeight)),
    };
}

export const textImportAdapter: ImportAdapter<Extract<DetectedClipboardFormat, { kind: "text" }>> = {
    id: "public-text-import",
    canHandle: (input): input is Extract<DetectedClipboardFormat, { kind: "text" }> => input.kind === "text",
    importContent: async (input) => {
        const content = input.content.trim();
        const fontSize = 28;
        const lineHeight = 1.3;
        const size = measureTextBlock(content, fontSize, lineHeight);

        return {
            roots: [
                {
                    tempId: nanoid(),
                    type: "text",
                    name: "Pasted Text",
                    children: [],
                    x: 0,
                    y: 0,
                    width: size.width,
                    height: size.height,
                    rotation: 0,
                    opacity: 1,
                    fills: [],
                    strokes: [],
                    cornerRadius: 0,
                    shadow: null,
                    text: {
                        content,
                        fontFamily: designEditorDefaults.typography.fontFamily,
                        fontSize,
                        fontWeight: 500,
                        lineHeight,
                        textAlign: designEditorDefaults.typography.textAlign,
                        color: designEditorDefaults.typography.color,
                    },
                    image: null,
                    transform: null,
                    layout: null,
                    clipContent: false,
                },
            ],
            sourceFormat: "text",
            fidelity: "public",
            warnings: [],
        };
    },
};