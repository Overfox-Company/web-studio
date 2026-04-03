import type { DetectedClipboardFormat, ImportAdapter } from "@/src/features/design-editor/import/types/import.types";

export const WEBSTUDIO_DESIGN_JSON_MIME = "application/vnd.webstudio.design+json";

export const webStudioDesignJsonAdapter: ImportAdapter = {
    id: "future-webstudio-design-json-import",
    canHandle: (_input: DetectedClipboardFormat): _input is never => false,
    importContent: async () => {
        throw new Error("Web Studio design JSON import is reserved for the future high-fidelity bridge route.");
    },
};