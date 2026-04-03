import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";

export type DesignPreviewSnapshot = DesignDocumentSnapshot;

export interface DesignPreviewChannelMessage {
    type: "snapshot";
    snapshot: DesignPreviewSnapshot;
}