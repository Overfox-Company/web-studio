"use client";

import { useEffect, useMemo, useState } from "react";

import { Box, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { DesignDocumentRenderer } from "@/src/features/design-editor/components/DesignDocumentRenderer";
import { createDesignPreviewChannel } from "@/src/features/design-editor/preview/preview-channel";
import { serializeDesignDocumentForPreview } from "@/src/features/design-editor/preview/serialize-design-document-for-preview";
import type { DesignPreviewChannelMessage, DesignPreviewSnapshot } from "@/src/features/design-editor/preview/preview.types";
import { getNodeAbsoluteFrame } from "@/src/features/design-editor/utils/design-tree";
import {
    defaultDesignPersistenceAdapter,
    resolveDesignDocumentSnapshot,
} from "@/src/features/design-editor/utils/design-document-persistence";

interface DesignPreviewPageProps {
    projectId: string;
    viewId: string;
}

type PreviewLoadState = "loading" | "ready" | "not-found" | "error";

function loadInitialSnapshot(projectId: string, viewId: string): DesignPreviewSnapshot | null {
    const resolvedSnapshot = resolveDesignDocumentSnapshot(projectId, viewId, defaultDesignPersistenceAdapter);

    if (!resolvedSnapshot) {
        return null;
    }

    return serializeDesignDocumentForPreview(resolvedSnapshot.document);
}

export function DesignPreviewPage({ projectId, viewId }: DesignPreviewPageProps) {
    const initialState = useMemo(() => {
        try {
            const initialSnapshot = loadInitialSnapshot(projectId, viewId);

            if (!initialSnapshot) {
                return {
                    loadState: "not-found" as PreviewLoadState,
                    snapshot: null,
                };
            }

            return {
                loadState: "ready" as PreviewLoadState,
                snapshot: initialSnapshot,
            };
        } catch {
            return {
                loadState: "error" as PreviewLoadState,
                snapshot: null,
            };
        }
    }, [projectId, viewId]);

    const [liveSnapshot, setLiveSnapshot] = useState<DesignPreviewSnapshot | null>(null);

    useEffect(() => {
        const channel = createDesignPreviewChannel(viewId);

        if (!channel) {
            return;
        }

        function handleMessage(event: MessageEvent<DesignPreviewChannelMessage>) {
            const message = event.data;

            if (message?.type !== "snapshot") {
                return;
            }

            setLiveSnapshot(message.snapshot);
        }

        channel.addEventListener("message", handleMessage);

        return () => {
            channel.removeEventListener("message", handleMessage);
            channel.close();
        };
    }, [viewId]);

    const snapshot = liveSnapshot ?? initialState.snapshot;
    const loadState = snapshot ? "ready" : initialState.loadState;

    const rootNode = useMemo(() => {
        if (!snapshot) {
            return null;
        }

        return snapshot.nodes[snapshot.rootNodeId] ?? null;
    }, [snapshot]);

    const previewExtent = useMemo(() => {
        if (!snapshot || !rootNode) {
            return null;
        }

        const visibleNodeIds = Object.values(snapshot.nodes)
            .filter((node) => node.visible)
            .map((node) => node.id);
        const maxRight = visibleNodeIds.reduce((currentMax, nodeId) => {
            const frame = getNodeAbsoluteFrame(snapshot, nodeId);
            return Math.max(currentMax, frame.x + frame.width);
        }, rootNode.width);
        const maxBottom = visibleNodeIds.reduce((currentMax, nodeId) => {
            const frame = getNodeAbsoluteFrame(snapshot, nodeId);
            return Math.max(currentMax, frame.y + frame.height);
        }, rootNode.height);

        return {
            width: Math.max(rootNode.width, maxRight),
            height: Math.max(rootNode.height, maxBottom),
        };
    }, [rootNode, snapshot]);

    if (loadState !== "ready" || !snapshot || !rootNode) {
        return (
            <Box sx={designEditorStyles.preview.emptyShell}>
                <Stack spacing={1} sx={designEditorStyles.preview.emptyCard}>
                    <Typography sx={designEditorStyles.preview.emptyEyebrow}>
                        Preview
                    </Typography>
                    <Typography sx={designEditorStyles.preview.emptyTitle}>
                        {loadState === "loading" ? "Cargando preview..." : "No se pudo abrir la preview."}
                    </Typography>
                    <Typography sx={designEditorStyles.preview.emptyBody}>
                        {loadState === "loading"
                            ? "Preparando el documento visual de la vista seleccionada."
                            : "No se encontró un documento válido para esta vista o no pudo cargarse desde persistencia."}
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={designEditorStyles.preview.root}>
            <Box sx={designEditorStyles.preview.canvasArea}>
                <Box sx={designEditorStyles.preview.scene(previewExtent?.width ?? rootNode.width, previewExtent?.height ?? rootNode.height)}>
                    <DesignDocumentRenderer document={snapshot} mode="preview" />
                </Box>
            </Box>
        </Box>
    );
}