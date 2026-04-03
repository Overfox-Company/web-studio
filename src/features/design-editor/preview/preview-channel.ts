import type { DesignPreviewChannelMessage } from "@/src/features/design-editor/preview/preview.types";

export function getDesignPreviewChannelName(viewId: string) {
    return `webstudio-preview-${viewId}`;
}

export function createDesignPreviewChannel(viewId: string) {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
        return null;
    }

    return new BroadcastChannel(getDesignPreviewChannelName(viewId));
}

export function createDesignPreviewSnapshotMessage(snapshot: DesignPreviewChannelMessage["snapshot"]): DesignPreviewChannelMessage {
    return {
        type: "snapshot",
        snapshot,
    };
}