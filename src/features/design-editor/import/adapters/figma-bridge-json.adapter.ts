import type { DetectedClipboardFormat, ImportAdapter } from "@/src/features/design-editor/import/types/import.types";

export const FIGMA_BRIDGE_JSON_MIME = "application/vnd.figma-bridge.design+json";

export const figmaBridgeJsonAdapter: ImportAdapter = {
    id: "future-figma-bridge-json-import",
    canHandle: (_input: DetectedClipboardFormat): _input is never => false,
    importContent: async () => {
        throw new Error("Figma bridge JSON import is reserved for the future high-fidelity bridge route.");
    },
};