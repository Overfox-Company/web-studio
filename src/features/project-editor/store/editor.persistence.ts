import { projectEditorStateSchema } from "@/src/features/project-editor/schema/project.schema";
import type { ProjectEditorState } from "@/src/features/project-editor/types/editor.types";
import { normalizeProjectState } from "@/src/features/project-editor/utils/normalize-project-state";

export interface EditorPersistenceAdapter {
    load(projectId: string): Promise<ProjectEditorState | null> | ProjectEditorState | null;
    save(projectId: string, data: ProjectEditorState): Promise<void> | void;
}

const STORAGE_KEY_PREFIX = "web-studio.project-editor.v1";

function getStorageKey(projectId: string) {
    return `${STORAGE_KEY_PREFIX}:${projectId}`;
}

export class LocalStorageEditorPersistenceAdapter implements EditorPersistenceAdapter {
    load(projectId: string): ProjectEditorState | null {
        if (typeof window === "undefined") {
            return null;
        }

        const raw = window.localStorage.getItem(getStorageKey(projectId));

        if (!raw) {
            return null;
        }

        try {
            return projectEditorStateSchema.parse(normalizeProjectState(projectEditorStateSchema.parse(JSON.parse(raw))));
        } catch {
            window.localStorage.removeItem(getStorageKey(projectId));
            return null;
        }
    }

    save(projectId: string, data: ProjectEditorState): void {
        if (typeof window === "undefined") {
            return;
        }

        const parsed = projectEditorStateSchema.parse(normalizeProjectState(data));
        window.localStorage.setItem(getStorageKey(projectId), JSON.stringify(parsed));
    }
}
