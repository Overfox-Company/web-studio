import { create } from "zustand";

import type {
    ComponentEditorSelection,
    ComponentLibrarySnapshot,
} from "@/src/features/component-library/types/component.types";

interface ComponentEditorStore extends ComponentEditorSelection {
    setSelection: (selection: Partial<ComponentEditorSelection>) => void;
    ensureValidSelection: (snapshot: ComponentLibrarySnapshot) => void;
}

export const useComponentEditorStore = create<ComponentEditorStore>((set, get) => ({
    libraryId: null,
    componentId: null,

    setSelection: (selection) => {
        set((state) => {
            const nextState = {
                ...state,
                ...selection,
            };

            if (nextState.libraryId === state.libraryId && nextState.componentId === state.componentId) {
                return state;
            }

            return nextState;
        });
    },

    ensureValidSelection: (snapshot) => {
        const state = get();
        const libraries = Object.values(snapshot.librariesById);
        const libraryId = state.libraryId && snapshot.librariesById[state.libraryId]
            ? state.libraryId
            : libraries[0]?.id ?? null;
        const library = libraryId ? snapshot.librariesById[libraryId] : null;
        const componentId = state.componentId && snapshot.componentsById[state.componentId]
            ? state.componentId
            : library?.componentIds[0] ?? null;

        if (libraryId === state.libraryId && componentId === state.componentId) {
            return;
        }

        set({
            libraryId,
            componentId,
        });
    },
}));
