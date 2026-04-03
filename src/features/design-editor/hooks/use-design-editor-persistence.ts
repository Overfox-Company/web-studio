"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { createDefaultDesignDocument } from "@/src/features/design-editor/utils/create-design-document";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document.store";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import {
    LocalStorageEditorPersistenceAdapter,
    type EditorPersistenceAdapter,
} from "@/src/features/project-editor/store/editor.persistence";
import { useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";
import type { ProjectEditorState, ViewNode } from "@/src/features/project-editor/types/editor.types";

const defaultAdapter = new LocalStorageEditorPersistenceAdapter();

type DesignEditorLoadState = "loading" | "ready" | "not-found" | "error";
type DesignEditorSaveState = "saved" | "saving" | "error";

interface UseDesignEditorPersistenceOptions {
    projectId: string;
    viewId: string;
    adapter?: EditorPersistenceAdapter;
}

function loadProjectSnapshot(projectId: string, adapter: EditorPersistenceAdapter): ProjectEditorState | null {
    const currentStore = useProjectEditorStore.getState();
    const hasLiveProject = currentStore.project.projectId === projectId && (currentStore.ui.hasHydrated || currentStore.project.nodes.length > 0);

    if (hasLiveProject) {
        return currentStore.project;
    }

    const loaded = adapter.load(projectId);

    if (loaded instanceof Promise) {
        return null;
    }

    return loaded;
}

function findViewNode(project: ProjectEditorState, viewId: string): ViewNode | null {
    const match = project.nodes.find((node) => node.id === viewId);

    if (!match || match.kind !== "view") {
        return null;
    }

    return match;
}

function persistDesignDocument(
    projectId: string,
    viewId: string,
    document: DesignDocumentSnapshot,
    adapter: EditorPersistenceAdapter,
) {
    const sourceProject = loadProjectSnapshot(projectId, adapter);

    if (!sourceProject) {
        throw new Error("Unable to resolve project state for design persistence.");
    }

    const timestamp = new Date().toISOString();
    const nextProject: ProjectEditorState = {
        ...sourceProject,
        updatedAt: timestamp,
        nodes: sourceProject.nodes.map((node) => {
            if (node.id !== viewId || node.kind !== "view") {
                return node;
            }

            return {
                ...node,
                updatedAt: timestamp,
                data: {
                    ...node.data,
                    designDocument: {
                        ...document,
                        updatedAt: timestamp,
                    },
                },
            };
        }),
    };

    const saveResult = adapter.save(projectId, nextProject);

    if (saveResult instanceof Promise) {
        return saveResult.then(() => {
            useProjectEditorStore.getState().hydrateProject(nextProject);
        });
    }

    useProjectEditorStore.getState().hydrateProject(nextProject);
}

export function useDesignEditorPersistence({
    projectId,
    viewId,
    adapter = defaultAdapter,
}: UseDesignEditorPersistenceOptions) {
    const document = useDesignDocumentStore((state) => state.document);
    const hydrateDocument = useDesignDocumentStore((state) => state.hydrateDocument);
    const clearDocument = useDesignDocumentStore((state) => state.clearDocument);
    const resetInteraction = useDesignInteractionStore((state) => state.resetForDocument);

    const [saveState, setSaveState] = useState<DesignEditorSaveState>("saved");

    const lastSavedRef = useRef<string | null>(null);

    const resolvedSnapshot = useMemo(() => {
        try {
            const project = loadProjectSnapshot(projectId, adapter);

            if (!project) {
                return {
                    loadState: "not-found" as DesignEditorLoadState,
                    viewNode: null,
                    document: null,
                };
            }

            const nextViewNode = findViewNode(project, viewId);

            if (!nextViewNode) {
                return {
                    loadState: "not-found" as DesignEditorLoadState,
                    viewNode: null,
                    document: null,
                };
            }

            return {
                loadState: "ready" as DesignEditorLoadState,
                viewNode: nextViewNode,
                document: nextViewNode.data.designDocument ?? createDefaultDesignDocument({
                    viewNodeId: nextViewNode.id,
                    viewName: nextViewNode.name,
                }),
            };
        } catch {
            return {
                loadState: "error" as DesignEditorLoadState,
                viewNode: null,
                document: null,
            };
        }
    }, [adapter, projectId, viewId]);

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
    }, [clearDocument, hydrateDocument, resetInteraction, resolvedSnapshot]);

    useEffect(() => {
        if (resolvedSnapshot.loadState !== "ready" || !document || !resolvedSnapshot.viewNode) {
            return;
        }

        const serialized = JSON.stringify(document);

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

    return {
        loadState: resolvedSnapshot.loadState,
        saveState,
        viewNode: resolvedSnapshot.viewNode,
    };
}