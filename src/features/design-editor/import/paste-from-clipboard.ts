import { detectClipboardFormat } from "@/src/features/design-editor/import/clipboard/clipboard-format-detector";
import { readClipboardPayload } from "@/src/features/design-editor/import/clipboard/clipboard-reader";
import { commitImportedContent } from "@/src/features/design-editor/import/final-paste-commit";
import { normalizeImportedAst } from "@/src/features/design-editor/import/normalizers/import-normalizer";
import { routeClipboardImport } from "@/src/features/design-editor/import/paste-router";
import type { ImportResult } from "@/src/features/design-editor/import/types/import.types";
import type { DesignDocumentSnapshot, DesignNode } from "@/src/features/design-editor/types/design.types";

interface PasteFromClipboardOptions {
    event: ClipboardEvent;
    document: DesignDocumentSnapshot;
    targetParentId: string;
    anchorPoint: { x: number; y: number };
    insertSubtree: (payload: { nodes: Record<string, DesignNode>; rootNodeIds: string[]; targetParentId: string; insertIndex?: number | null }) => void;
}

export async function pasteFromClipboard({
    event,
    document,
    targetParentId,
    anchorPoint,
    insertSubtree,
}: PasteFromClipboardOptions): Promise<ImportResult> {
    console.log("[DesignClipboard] paste:start", {
        targetParentId,
        anchorPoint,
    });

    const payload = await readClipboardPayload(event);

    if (!payload) {
        console.log("[DesignClipboard] paste:no-payload");
        return {
            status: "unsupported",
            rootNodeIds: [],
            warnings: [],
            message: "Clipboard data is not available in this browser event.",
        };
    }

    const detectedFormat = detectClipboardFormat(payload);

    console.log("[DesignClipboard] paste:detected-format", detectedFormat);

    if (detectedFormat.kind === "unsupported") {
        console.log("[DesignClipboard] paste:unsupported-format", {
            availableTypes: payload.types,
        });
        return {
            status: "unsupported",
            rootNodeIds: [],
            warnings: [],
            message: "Clipboard content is not supported yet. Paste Figma clipboard HTML, SVG, PNG, or plain text.",
        };
    }

    const routedImport = await routeClipboardImport(detectedFormat);

    if (!routedImport) {
        console.log("[DesignClipboard] paste:no-routed-import");
        return {
            status: "unsupported",
            rootNodeIds: [],
            warnings: [],
            message: "No import adapter is available for this clipboard format.",
        };
    }

    try {
        const importedAst = routedImport.importedDocument;
        const normalizedAst = normalizeImportedAst(importedAst);

        console.log("[DesignClipboard] paste:normalized", {
            adapterId: routedImport.adapterId,
            rootCount: normalizedAst.roots.length,
            warnings: normalizedAst.warnings,
        });

        if (normalizedAst.roots.length === 0) {
            console.log("[DesignClipboard] paste:no-normalized-roots");
            return {
                status: "unsupported",
                rootNodeIds: [],
                warnings: normalizedAst.warnings,
                message: "The clipboard content could not be converted into design nodes.",
            };
        }

        const rootNodeIds = commitImportedContent({
            document,
            importedDocument: normalizedAst,
            targetParentId,
            anchorPoint,
            insertSubtree,
        });

        console.log("[DesignClipboard] paste:success", {
            rootNodeIds,
            warnings: normalizedAst.warnings,
        });

        return {
            status: "success",
            rootNodeIds,
            warnings: normalizedAst.warnings,
        };
    } catch (error) {
        console.error("[DesignClipboard] paste:error", error);
        return {
            status: "error",
            rootNodeIds: [],
            warnings: [],
            message: "The clipboard content could not be imported.",
        };
    }
}