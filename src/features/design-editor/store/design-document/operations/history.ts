import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";

import type { DesignDocumentStoreState } from "../design-document.types";

export const HISTORY_LIMIT = 100;

export function touchDocument(document: DesignDocumentSnapshot): DesignDocumentSnapshot {
    return {
        ...document,
        updatedAt: new Date().toISOString(),
    };
}

export function pushHistoryEntry(state: DesignDocumentStoreState, nextDocument: DesignDocumentSnapshot) {
    if (!state.document || nextDocument === state.document) {
        return state;
    }

    const nextPastDocuments = [...state.pastDocuments, state.document];

    if (nextPastDocuments.length > HISTORY_LIMIT) {
        nextPastDocuments.shift();
    }

    return {
        document: nextDocument,
        pastDocuments: nextPastDocuments,
        futureDocuments: [],
    };
}

export function undoDocumentState(state: DesignDocumentStoreState) {
    const previousDocument = state.pastDocuments.at(-1);

    if (!previousDocument || !state.document) {
        return state;
    }

    const nextFutureDocuments = [state.document, ...state.futureDocuments].slice(0, HISTORY_LIMIT);

    return {
        document: previousDocument,
        pastDocuments: state.pastDocuments.slice(0, -1),
        futureDocuments: nextFutureDocuments,
    };
}