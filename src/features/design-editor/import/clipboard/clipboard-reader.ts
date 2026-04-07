import type { ClipboardPayload } from "@/src/features/design-editor/import/types/import.types";

const KNOWN_TEXT_MIME_TYPES = ["image/svg+xml", "text/plain", "text/html"] as const;

function readStringItem(item: DataTransferItem): Promise<string> {
    return new Promise((resolve) => {
        item.getAsString((value) => resolve(value));
    });
}

export async function readClipboardPayload(event: ClipboardEvent): Promise<ClipboardPayload | null> {
    const clipboardData = event.clipboardData;

    if (!clipboardData) {
        console.log("[DesignClipboard] readClipboard:no-clipboard-data");
        return null;
    }

    const clipboardTypes = Array.from(clipboardData.types);

    console.log("[DesignClipboard] readClipboard:start", {
        types: clipboardTypes,
        itemCount: clipboardData.items.length,
    });

    const strings: Record<string, string> = {};
    const files = Array.from(clipboardData.items)
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile())
        .filter((file): file is File => Boolean(file))
        .map((file) => ({
            type: file.type,
            file,
        }));

    const stringItems = Array.from(clipboardData.items).filter((item) => item.kind === "string");

    await Promise.all(
        stringItems.map(async (item) => {
            const content = await readStringItem(item);

            if (content) {
                strings[item.type] = content;
            }
        }),
    );

    const textMimeTypes = Array.from(new Set([...clipboardTypes, ...KNOWN_TEXT_MIME_TYPES]));

    for (const mimeType of textMimeTypes) {
        if (strings[mimeType]) {
            continue;
        }

        const content = clipboardData.getData(mimeType);

        if (content) {
            strings[mimeType] = content;
        }
    }

    console.log("[DesignClipboard] readClipboard:done", {
        stringTypes: Object.keys(strings),
        fileTypes: files.map((entry) => entry.type),
    });

    return {
        types: clipboardTypes,
        strings,
        files,
    };
}