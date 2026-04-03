"use client";

import { useEffect, useRef } from "react";

import {
    LocalStorageEditorPersistenceAdapter,
    type EditorPersistenceAdapter,
} from "@/src/features/project-editor/store/editor.persistence";
import { useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";

const defaultAdapter = new LocalStorageEditorPersistenceAdapter();

interface UseEditorPersistenceOptions {
    projectId: string;
    projectName: string;
    adapter?: EditorPersistenceAdapter;
}

export function useEditorPersistence({
    projectId,
    projectName,
    adapter = defaultAdapter,
}: UseEditorPersistenceOptions) {
    const initializeProject = useProjectEditorStore((state) => state.initializeProject);
    const hydrateProject = useProjectEditorStore((state) => state.hydrateProject);
    const setHasHydrated = useProjectEditorStore((state) => state.setHasHydrated);
    const setSaveState = useProjectEditorStore((state) => state.setSaveState);
    const project = useProjectEditorStore((state) => state.project);
    const hasHydrated = useProjectEditorStore((state) => state.ui.hasHydrated);

    const lastSavedRef = useRef<string | null>(null);

    useEffect(() => {
        let isActive = true;

        initializeProject(projectId, projectName);

        void Promise.resolve(adapter.load(projectId)).then((savedProject) => {
            if (!isActive) {
                return;
            }

            if (savedProject) {
                hydrateProject(savedProject);
                lastSavedRef.current = JSON.stringify(savedProject);
                return;
            }

            setHasHydrated(true);
            setSaveState("saved");
        });

        return () => {
            isActive = false;
        };
    }, [adapter, hydrateProject, initializeProject, projectId, projectName, setHasHydrated, setSaveState]);

    useEffect(() => {
        if (!hasHydrated || project.projectId !== projectId) {
            return;
        }

        const serialized = JSON.stringify(project);

        if (serialized === lastSavedRef.current) {
            return;
        }

        setSaveState("saving");

        void Promise.resolve(adapter.save(projectId, project))
            .then(() => {
                lastSavedRef.current = serialized;
                setSaveState("saved");
            })
            .catch(() => {
                setSaveState("error");
            });
    }, [adapter, hasHydrated, project, projectId, setSaveState]);
}
