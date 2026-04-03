"use client";

import { useEffect, useRef, useState } from "react";

import {
    LocalStorageComponentLibraryPersistenceAdapter,
    type ComponentLibraryPersistenceAdapter,
} from "@/src/features/component-library/store/component-library.persistence";
import { useComponentLibraryStore } from "@/src/features/component-library/store/component-library.store";
import { createEmptyComponentLibrarySnapshot } from "@/src/features/component-library/utils/create-component-defaults";

type ComponentLibrarySaveState = "saved" | "saving" | "error";

const defaultAdapter = new LocalStorageComponentLibraryPersistenceAdapter();

interface UseComponentLibraryPersistenceOptions {
    projectId: string;
    adapter?: ComponentLibraryPersistenceAdapter;
}

export function useComponentLibraryPersistence({
    projectId,
    adapter = defaultAdapter,
}: UseComponentLibraryPersistenceOptions) {
    const initializeProject = useComponentLibraryStore((state) => state.initializeProject);
    const hydrateSnapshot = useComponentLibraryStore((state) => state.hydrateSnapshot);
    const snapshot = useComponentLibraryStore((state) => state.snapshot);

    const [saveState, setSaveState] = useState<ComponentLibrarySaveState>("saved");
    const lastSavedRef = useRef<string | null>(null);

    useEffect(() => {
        let isActive = true;

        initializeProject(projectId);

        void Promise.resolve(adapter.load(projectId)).then((savedSnapshot) => {
            if (!isActive) {
                return;
            }

            const nextSnapshot = savedSnapshot ?? createEmptyComponentLibrarySnapshot(projectId);
            hydrateSnapshot(nextSnapshot);
            lastSavedRef.current = JSON.stringify(nextSnapshot);
            setSaveState("saved");
        });

        return () => {
            isActive = false;
        };
    }, [adapter, hydrateSnapshot, initializeProject, projectId]);

    useEffect(() => {
        if (snapshot.projectId !== projectId) {
            return;
        }

        const serialized = JSON.stringify(snapshot);

        if (serialized === lastSavedRef.current) {
            return;
        }

        void Promise.resolve()
            .then(() => {
                setSaveState("saving");

                return Promise.resolve(adapter.save(projectId, snapshot))
                    .then(() => {
                        lastSavedRef.current = serialized;
                        setSaveState("saved");
                    })
                    .catch(() => {
                        setSaveState("error");
                    });
            });
    }, [adapter, projectId, snapshot]);

    return {
        saveState,
    };
}
