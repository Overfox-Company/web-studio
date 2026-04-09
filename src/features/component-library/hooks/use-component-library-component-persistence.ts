"use client";

import { useEffect, useRef } from "react";

import { useComponentLibraryStore } from "@/src/features/component-library/store/component-library.store";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";

interface UseComponentLibraryComponentPersistenceOptions {
    componentId: string | null;
}

function serializeDocumentForSync(document: NonNullable<ReturnType<typeof useDesignDocumentStore.getState>["document"]>) {
    return JSON.stringify({
        ...document,
        updatedAt: "",
    });
}

export function useComponentLibraryComponentPersistence({ componentId }: UseComponentLibraryComponentPersistenceOptions) {
    const componentDocument = useComponentLibraryStore((state) => (componentId ? state.snapshot.componentsById[componentId]?.document ?? null : null));
    const updateComponentDocument = useComponentLibraryStore((state) => state.updateComponentDocument);

    const document = useDesignDocumentStore((state) => state.document);
    const hydrateDocument = useDesignDocumentStore((state) => state.hydrateDocument);
    const clearDocument = useDesignDocumentStore((state) => state.clearDocument);
    const resetInteraction = useDesignInteractionStore((state) => state.resetForDocument);
    const lastHydratedSignatureRef = useRef<string | null>(null);
    const lastPersistedSignatureRef = useRef<string | null>(null);

    useEffect(() => {
        const currentDocument = useDesignDocumentStore.getState().document;

        if (!componentId || !componentDocument) {
            lastHydratedSignatureRef.current = null;
            lastPersistedSignatureRef.current = null;

            if (currentDocument) {
                clearDocument();
                resetInteraction();
            }

            return;
        }

        const sourceSignature = `${componentId}:${serializeDocumentForSync(componentDocument)}`;
        const currentSignature = currentDocument ? `${componentId}:${serializeDocumentForSync(currentDocument)}` : null;

        if (currentSignature === sourceSignature || lastHydratedSignatureRef.current === sourceSignature) {
            lastHydratedSignatureRef.current = sourceSignature;
            lastPersistedSignatureRef.current = sourceSignature;
            return;
        }

        resetInteraction();
        hydrateDocument(componentDocument);
        lastHydratedSignatureRef.current = sourceSignature;
        lastPersistedSignatureRef.current = sourceSignature;
    }, [clearDocument, componentDocument, componentId, hydrateDocument, resetInteraction]);

    useEffect(() => {
        if (!componentId || !componentDocument || !document) {
            return;
        }

        const serializedCurrent = `${componentId}:${serializeDocumentForSync(document)}`;
        const serializedSource = `${componentId}:${serializeDocumentForSync(componentDocument)}`;

        if (serializedCurrent === serializedSource || serializedCurrent === lastPersistedSignatureRef.current) {
            return;
        }

        lastPersistedSignatureRef.current = serializedCurrent;
        updateComponentDocument(componentId, document);
    }, [componentDocument, componentId, document, updateComponentDocument]);

    return {
        document: componentDocument,
    };
}