import { nanoid } from "nanoid";

import type { DetectedClipboardFormat, ImportAdapter } from "@/src/features/design-editor/import/types/import.types";

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
    });
}

function measureImageSource(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.width || 320, height: image.height || 240 });
        image.onerror = () => resolve({ width: 320, height: 240 });
        image.src = src;
    });
}

export const pngImportAdapter: ImportAdapter<Extract<DetectedClipboardFormat, { kind: "png" }>> = {
    id: "public-png-import",
    canHandle: (input): input is Extract<DetectedClipboardFormat, { kind: "png" }> => input.kind === "png",
    importContent: async (input) => {
        const src = await readFileAsDataUrl(input.file);
        const size = await measureImageSource(src);

        return {
            roots: [
                {
                    tempId: nanoid(),
                    type: "image",
                    name: "Pasted Image",
                    children: [],
                    x: 0,
                    y: 0,
                    width: Math.max(1, size.width),
                    height: Math.max(1, size.height),
                    rotation: 0,
                    opacity: 1,
                    fills: [{ type: "image", value: src, opacity: 1 }],
                    strokes: [],
                    cornerRadius: 0,
                    shadow: null,
                    text: null,
                    image: {
                        src,
                        objectFit: "contain",
                    },
                    transform: null,
                    layout: null,
                    clipContent: false,
                },
            ],
            sourceFormat: "png",
            fidelity: "public",
            warnings: [],
        };
    },
};