"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    createDesignPreviewChannel,
    createDesignPreviewSnapshotMessage,
} from "@/src/features/design-editor/preview/preview-channel";
import { serializeDesignDocumentForPreview } from "@/src/features/design-editor/preview/serialize-design-document-for-preview";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document.store";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import {
    defaultDesignPersistenceAdapter,
    persistDesignDocument,
    persistPageViewportMode,
    resolveDesignDocumentSnapshot,
} from "@/src/features/design-editor/utils/design-document-persistence";
import {
    type EditorPersistenceAdapter,
} from "@/src/features/project-editor/store/editor.persistence";
import type { PageViewportMode } from "@/src/features/project-editor/types/editor.types";

type DesignEditorLoadState = "loading" | "ready" | "not-found" | "error";
type DesignEditorSaveState = "saved" | "saving" | "error";

interface UseDesignEditorPersistenceOptions {
    projectId: string;
    viewId: string;
    adapter?: EditorPersistenceAdapter;
}

export function useDesignEditorPersistence({
    projectId,
    viewId,
    adapter = defaultDesignPersistenceAdapter,
}: UseDesignEditorPersistenceOptions) {
    const document = useDesignDocumentStore((state) => state.document);
    const hydrateDocument = useDesignDocumentStore((state) => state.hydrateDocument);
    const clearDocument = useDesignDocumentStore((state) => state.clearDocument);
    const resetInteraction = useDesignInteractionStore((state) => state.resetForDocument);

    const [saveState, setSaveState] = useState<DesignEditorSaveState>("saved");
    const [viewportModeOverride, setViewportModeOverride] = useState<PageViewportMode | null>(null);

    const lastSavedRef = useRef<string | null>(null);
    const lastBroadcastRef = useRef<string | null>(null);
    const previewChannelRef = useRef<BroadcastChannel | null>(null);

    const resolvedSnapshot = useMemo(() => {
        try {
            const snapshot = resolveDesignDocumentSnapshot(projectId, viewId, adapter);

            if (!snapshot) {
                return {
                    loadState: "not-found" as DesignEditorLoadState,
                    viewNode: null,
                    document: null,
                };
            }

            return {
                loadState: "ready" as DesignEditorLoadState,
                viewNode: snapshot.viewNode,
                document: snapshot.document,
            };
        } catch {
            return {
                loadState: "error" as DesignEditorLoadState,
                viewNode: null,
                document: null,
            };
        }
    }, [adapter, projectId, viewId]);

    const viewportMode = viewportModeOverride ?? resolvedSnapshot.viewNode?.data.viewportMode ?? "desktop";

    useEffect(() => {
        const channel = createDesignPreviewChannel(viewId);
        previewChannelRef.current = channel;

        return () => {
            if (previewChannelRef.current === channel) {
                previewChannelRef.current = null;
            }

            channel?.close();
        };
    }, [viewId]);

    useEffect(() => {
        clearDocument();
        resetInteraction();

        Promise.resolve().then(() => {
            setSaveState("saved");
        });

        if (resolvedSnapshot.loadState !== "ready" || !resolvedSnapshot.document) {
            lastSavedRef.current = null;
            return;
        }

        hydrateDocument(resolvedSnapshot.document);
        lastSavedRef.current = JSON.stringify(resolvedSnapshot.document);
        lastBroadcastRef.current = JSON.stringify(serializeDesignDocumentForPreview(resolvedSnapshot.document));
    }, [clearDocument, hydrateDocument, resetInteraction, resolvedSnapshot]);

    useEffect(() => {
        if (resolvedSnapshot.loadState !== "ready" || !document || !resolvedSnapshot.viewNode) {
            return;
        }

        const serialized = JSON.stringify(document);
        const previewSnapshot = serializeDesignDocumentForPreview(document);
        const previewSerialized = JSON.stringify(previewSnapshot);

        if (previewSerialized !== lastBroadcastRef.current) {
            previewChannelRef.current?.postMessage(createDesignPreviewSnapshotMessage(previewSnapshot));
            lastBroadcastRef.current = previewSerialized;
        }

        if (serialized === lastSavedRef.current) {
            return;
        }

        let cancelled = false;

        void Promise.resolve()
            .then(() => {
                if (cancelled) {
                    return;
                }

                setSaveState("saving");

                return Promise.resolve(persistDesignDocument(projectId, viewId, document, adapter))
                    .then(() => {
                        if (cancelled) {
                            return;
                        }

                        lastSavedRef.current = serialized;
                        setSaveState("saved");
                    })
                    .catch(() => {
                        if (!cancelled) {
                            setSaveState("error");
                        }
                    });
            });

        return () => {
            cancelled = true;
        };
    }, [adapter, document, projectId, resolvedSnapshot.loadState, resolvedSnapshot.viewNode, viewId]);

    const updateViewportMode = useCallback((nextViewportMode: PageViewportMode) => {
        if (resolvedSnapshot.loadState !== "ready" || !resolvedSnapshot.viewNode || nextViewportMode === viewportMode) {
            return;
        }

        setViewportModeOverride(nextViewportMode);
        setSaveState("saving");

        void Promise.resolve(persistPageViewportMode(projectId, viewId, nextViewportMode, adapter))
            .then(() => {
                setSaveState("saved");
            })
            .catch(() => {
                setViewportModeOverride(null);
                setSaveState("error");
            });
    }, [adapter, projectId, resolvedSnapshot.loadState, resolvedSnapshot.viewNode, viewId, viewportMode]);

    return {
        loadState: resolvedSnapshot.loadState,
        saveState,
        viewNode: resolvedSnapshot.viewNode,
        viewportMode,
        setViewportMode: updateViewportMode,
    };
}