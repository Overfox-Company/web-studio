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
        return null;
    }

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

    for (const mimeType of KNOWN_TEXT_MIME_TYPES) {
        if (strings[mimeType]) {
            continue;
        }

        const content = clipboardData.getData(mimeType);

        if (content) {
            strings[mimeType] = content;
        }
    }

    return {
        types: Array.from(clipboardData.types),
        strings,
        files,
    };
}