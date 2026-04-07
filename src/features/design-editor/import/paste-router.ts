import { figmaClipboardHtmlAdapter } from "@/src/features/design-editor/import/adapters/figma-clipboard-html.adapter";
import { htmlImportAdapter } from "@/src/features/design-editor/import/adapters/html-import.adapter";
import { pngImportAdapter } from "@/src/features/design-editor/import/adapters/png-import.adapter";
import { svgImportAdapter } from "@/src/features/design-editor/import/adapters/svg-import.adapter";
import { textImportAdapter } from "@/src/features/design-editor/import/adapters/text-import.adapter";
import { webStudioDesignJsonAdapter } from "@/src/features/design-editor/import/adapters/webstudio-design-json.adapter";
import type { DetectedClipboardFormat } from "@/src/features/design-editor/import/types/import.types";

export async function routeClipboardImport(input: DetectedClipboardFormat) {
    console.log("[DesignClipboard] routeImport:start", {
        kind: input.kind,
        sourceMime: input.sourceMime,
    });

    if (webStudioDesignJsonAdapter.canHandle(input)) {
        console.log("[DesignClipboard] routeImport:using-webstudio-design-json-adapter");
        return {
            adapterId: webStudioDesignJsonAdapter.id,
            importedDocument: await webStudioDesignJsonAdapter.importContent(input),
        };
    }

    if (figmaClipboardHtmlAdapter.canHandle(input)) {
        console.log("[DesignClipboard] routeImport:using-figma-adapter");
        return {
            adapterId: figmaClipboardHtmlAdapter.id,
            importedDocument: await figmaClipboardHtmlAdapter.importContent(input),
        };
    }

    if (svgImportAdapter.canHandle(input)) {
        console.log("[DesignClipboard] routeImport:using-svg-adapter");
        return {
            adapterId: svgImportAdapter.id,
            importedDocument: await svgImportAdapter.importContent(input),
        };
    }

    if (htmlImportAdapter.canHandle(input)) {
        console.log("[DesignClipboard] routeImport:using-html-adapter");
        return {
            adapterId: htmlImportAdapter.id,
            importedDocument: await htmlImportAdapter.importContent(input),
        };
    }

    if (pngImportAdapter.canHandle(input)) {
        console.log("[DesignClipboard] routeImport:using-png-adapter");
        return {
            adapterId: pngImportAdapter.id,
            importedDocument: await pngImportAdapter.importContent(input),
        };
    }

    if (textImportAdapter.canHandle(input)) {
        console.log("[DesignClipboard] routeImport:using-text-adapter");
        return {
            adapterId: textImportAdapter.id,
            importedDocument: await textImportAdapter.importContent(input),
        };
    }

    console.log("[DesignClipboard] routeImport:no-adapter");

    return null;
}