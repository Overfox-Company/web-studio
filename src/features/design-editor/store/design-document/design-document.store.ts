import { create } from "zustand";

import type { DesignDocumentStoreState } from "./design-document.types";
import { commitNodeFrameInDocument } from "./operations/frame";
import { pushHistoryEntry, touchDocument, undoDocumentState } from "./operations/history";
import {
    groupNodesInDocument,
    insertNodeInDocument,
    insertSubtreeInDocument,
    removeNodeFromDocument,
    reparentNodesInDocument,
} from "./operations/hierarchy";
import { expandRootFrameHeightToFitContent } from "./operations/layout";
import { patchNodeInDocument } from "./operations/patch";

export const useDesignDocumentStore = create<DesignDocumentStoreState>((set) => ({
    document: null,
    pastDocuments: [],
    futureDocuments: [],

    hydrateDocument: (document) => {
        set({ document, pastDocuments: [], futureDocuments: [] });
    },

    clearDocument: () => {
        set({ document: null, pastDocuments: [], futureDocuments: [] });
    },

    patchNode: (nodeId, patch) => {
        set((state) => {
            if (!state.document) {
                return state;
            }

            const nextDocument = patchNodeInDocument(state.document, nodeId, patch);

            if (nextDocument === state.document) {
                return state;
            }

            return pushHistoryEntry(state, touchDocument(expandRootFrameHeightToFitContent(nextDocument)));
        });
    },

    insertNode: (node, options) => {
        set((state) => {
            if (!state.document) {
                return state;
            }

            const nextDocument = insertNodeInDocument(state.document, node, options);

            if (nextDocument === state.document) {
                return state;
            }

            return pushHistoryEntry(state, touchDocument(expandRootFrameHeightToFitContent(nextDocument)));
        });
    },

    insertSubtree: (payload) => {
        set((state) => {
            if (!state.document) {
                return state;
            }

            const nextDocument = insertSubtreeInDocument(state.document, payload);

            if (nextDocument === state.document) {
                return state;
            }

            return pushHistoryEntry(state, touchDocument(expandRootFrameHeightToFitContent(nextDocument)));
        });
    },

    removeNode: (nodeId) => {
        set((state) => {
            if (!state.document) {
                return state;
            }

            const nextDocument = removeNodeFromDocument(state.document, nodeId);

            if (nextDocument === state.document) {
                return state;
            }

            return pushHistoryEntry(state, touchDocument(expandRootFrameHeightToFitContent(nextDocument)));
        });
    },

    commitNodeFrame: (nodeId, frame) => {
        set((state) => {
            if (!state.document) {
                return state;
            }

            const nextDocument = commitNodeFrameInDocument(state.document, nodeId, frame);

            if (nextDocument === state.document) {
                return state;
            }

            return pushHistoryEntry(state, touchDocument(expandRootFrameHeightToFitContent(nextDocument)));
        });
    },

    reparentNodes: (payload) => {
        set((state) => {
            if (!state.document) {
                return state;
            }

            const nextDocument = reparentNodesInDocument(state.document, payload);

            if (nextDocument === state.document) {
                return state;
            }

            return pushHistoryEntry(state, touchDocument(expandRootFrameHeightToFitContent(nextDocument)));
        });
    },

    groupNodes: (nodeIds) => {
        let nextGroupId: string | null = null;

        set((state) => {
            if (!state.document) {
                return state;
            }

            const result = groupNodesInDocument(state.document, nodeIds);
            nextGroupId = result.groupId;

            if (result.document === state.document) {
                return state;
            }

            return pushHistoryEntry(state, touchDocument(expandRootFrameHeightToFitContent(result.document)));
        });

        return nextGroupId;
    },

    undo: () => {
        set((state) => undoDocumentState(state));
    },
}));