import { create } from "zustand";

import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import type { BaseComponentType, ComponentLibrarySnapshot } from "@/src/features/component-library/types/component.types";
import {
    createComponentLibrary,
    createLibraryComponent,
    createEmptyComponentLibrarySnapshot,
} from "@/src/features/component-library/utils/create-component-defaults";

interface ComponentLibraryStore {
    snapshot: ComponentLibrarySnapshot;
    initializeProject: (projectId: string) => void;
    hydrateSnapshot: (snapshot: ComponentLibrarySnapshot) => void;
    createLibrary: (name?: string) => string;
    updateLibrary: (libraryId: string, patch: { name?: string; description?: string }) => void;
    createComponent: (libraryId: string, baseType: BaseComponentType, name?: string) => string | null;
    updateComponentMeta: (componentId: string, patch: { name?: string }) => void;
    updateComponentDocument: (componentId: string, document: DesignDocumentSnapshot) => void;
}

function now() {
    return new Date().toISOString();
}

function touchSnapshot(snapshot: ComponentLibrarySnapshot): ComponentLibrarySnapshot {
    return {
        ...snapshot,
        updatedAt: now(),
    };
}

function serializeComponentDocument(document: DesignDocumentSnapshot) {
    return JSON.stringify({
        ...document,
        updatedAt: "",
    });
}

export const useComponentLibraryStore = create<ComponentLibraryStore>((set, get) => ({
    snapshot: createEmptyComponentLibrarySnapshot("demo-project"),

    initializeProject: (projectId) => {
        const current = get().snapshot;

        if (current.projectId === projectId) {
            return;
        }

        set({
            snapshot: createEmptyComponentLibrarySnapshot(projectId),
        });
    },

    hydrateSnapshot: (snapshot) => {
        set({ snapshot });
    },

    createLibrary: (name = "UI Library") => {
        const library = createComponentLibrary(name);

        set((state) => ({
            snapshot: touchSnapshot({
                ...state.snapshot,
                librariesById: {
                    ...state.snapshot.librariesById,
                    [library.id]: library,
                },
            }),
        }));

        return library.id;
    },

    updateLibrary: (libraryId, patch) => {
        set((state) => {
            const current = state.snapshot.librariesById[libraryId];

            if (!current) {
                return state;
            }

            if (
                (patch.name === undefined || patch.name === current.name)
                && (patch.description === undefined || patch.description === current.description)
            ) {
                return state;
            }

            return {
                snapshot: touchSnapshot({
                    ...state.snapshot,
                    librariesById: {
                        ...state.snapshot.librariesById,
                        [libraryId]: {
                            ...current,
                            ...patch,
                            updatedAt: now(),
                        },
                    },
                }),
            };
        });
    },

    createComponent: (libraryId, baseType, name) => {
        const library = get().snapshot.librariesById[libraryId];

        if (!library) {
            return null;
        }

        const component = createLibraryComponent(libraryId, baseType, name);

        set((state) => ({
            snapshot: touchSnapshot({
                ...state.snapshot,
                librariesById: {
                    ...state.snapshot.librariesById,
                    [libraryId]: {
                        ...library,
                        componentIds: [...library.componentIds, component.id],
                        updatedAt: now(),
                    },
                },
                componentsById: {
                    ...state.snapshot.componentsById,
                    [component.id]: component,
                },
            }),
        }));

        return component.id;
    },

    updateComponentMeta: (componentId, patch) => {
        set((state) => {
            const current = state.snapshot.componentsById[componentId];

            if (!current) {
                return state;
            }

            if (patch.name === undefined || patch.name === current.name) {
                return state;
            }

            return {
                snapshot: touchSnapshot({
                    ...state.snapshot,
                    componentsById: {
                        ...state.snapshot.componentsById,
                        [componentId]: {
                            ...current,
                            ...patch,
                            updatedAt: now(),
                        },
                    },
                }),
            };
        });
    },

    updateComponentDocument: (componentId, document) => {
        set((state) => {
            const current = state.snapshot.componentsById[componentId];

            if (!current) {
                return state;
            }

            if (serializeComponentDocument(current.document) === serializeComponentDocument(document)) {
                return state;
            }

            return {
                snapshot: touchSnapshot({
                    ...state.snapshot,
                    componentsById: {
                        ...state.snapshot.componentsById,
                        [componentId]: {
                            ...current,
                            document: {
                                ...document,
                                updatedAt: now(),
                            },
                            updatedAt: now(),
                        },
                    },
                }),
            };
        });
    },
}));
