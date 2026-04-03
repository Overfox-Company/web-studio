import { figmaClipboardHtmlAdapter } from "@/src/features/design-editor/import/adapters/figma-clipboard-html.adapter";
import { htmlImportAdapter } from "@/src/features/design-editor/import/adapters/html-import.adapter";
import { pngImportAdapter } from "@/src/features/design-editor/import/adapters/png-import.adapter";
import { svgImportAdapter } from "@/src/features/design-editor/import/adapters/svg-import.adapter";
import { textImportAdapter } from "@/src/features/design-editor/import/adapters/text-import.adapter";
import type { DetectedClipboardFormat } from "@/src/features/design-editor/import/types/import.types";

export async function routeClipboardImport(input: DetectedClipboardFormat) {
    if (figmaClipboardHtmlAdapter.canHandle(input)) {
        return {
            adapterId: figmaClipboardHtmlAdapter.id,
            importedDocument: await figmaClipboardHtmlAdapter.importContent(input),
        };
    }

    if (svgImportAdapter.canHandle(input)) {
        return {
            adapterId: svgImportAdapter.id,
            importedDocument: await svgImportAdapter.importContent(input),
        };
    }

    if (htmlImportAdapter.canHandle(input)) {
        return {
            adapterId: htmlImportAdapter.id,
            importedDocument: await htmlImportAdapter.importContent(input),
        };
    }

    if (pngImportAdapter.canHandle(input)) {
        return {
            adapterId: pngImportAdapter.id,
            importedDocument: await pngImportAdapter.importContent(input),
        };
    }

    if (textImportAdapter.canHandle(input)) {
        return {
            adapterId: textImportAdapter.id,
            importedDocument: await textImportAdapter.importContent(input),
        };
    }

    return null;
}