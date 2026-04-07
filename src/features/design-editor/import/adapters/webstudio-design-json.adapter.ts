import { parseWebStudioClipboardPayload } from "@/src/features/design-editor/import/adapters/webstudio-design-json.shared";
import type { DetectedClipboardFormat, ImportAdapter } from "@/src/features/design-editor/import/types/import.types";

export const webStudioDesignJsonAdapter: ImportAdapter<Extract<DetectedClipboardFormat, { kind: "webstudio-design-json" }>> = {
    id: "webstudio-design-json-import",
    canHandle: (input): input is Extract<DetectedClipboardFormat, { kind: "webstudio-design-json" }> => input.kind === "webstudio-design-json",
    importContent: async (input) => {
        console.log("[DesignClipboard] adapter:webstudio-design-json:start", {
            payloadLength: input.content.length,
        });

        const parsed = parseWebStudioClipboardPayload(input.content);

        if (!parsed) {
            console.log("[DesignClipboard] adapter:webstudio-design-json:invalid-payload");
            throw new Error("Clipboard Web Studio design JSON payload is invalid.");
        }

        console.log("[DesignClipboard] adapter:webstudio-design-json:done", {
            rootCount: parsed.roots.length,
            warnings: parsed.warnings,
        });

        return parsed;
    },
};