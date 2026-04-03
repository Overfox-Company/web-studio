import { componentLibrarySnapshotSchema } from "@/src/features/component-library/schema/component.schema";
import type { ComponentLibrarySnapshot } from "@/src/features/component-library/types/component.types";

export interface ComponentLibraryPersistenceAdapter {
    load(projectId: string): Promise<ComponentLibrarySnapshot | null> | ComponentLibrarySnapshot | null;
    save(projectId: string, data: ComponentLibrarySnapshot): Promise<void> | void;
}

const STORAGE_KEY_PREFIX = "web-studio.component-library.v2";

function getStorageKey(projectId: string) {
    return `${STORAGE_KEY_PREFIX}:${projectId}`;
}

export class LocalStorageComponentLibraryPersistenceAdapter implements ComponentLibraryPersistenceAdapter {
    load(projectId: string): ComponentLibrarySnapshot | null {
        if (typeof window === "undefined") {
            return null;
        }

        const raw = window.localStorage.getItem(getStorageKey(projectId));

        if (!raw) {
            return null;
        }

        try {
            return componentLibrarySnapshotSchema.parse(JSON.parse(raw));
        } catch {
            window.localStorage.removeItem(getStorageKey(projectId));
            return null;
        }
    }

    save(projectId: string, data: ComponentLibrarySnapshot): void {
        if (typeof window === "undefined") {
            return;
        }

        const parsed = componentLibrarySnapshotSchema.parse(data);
        window.localStorage.setItem(getStorageKey(projectId), JSON.stringify(parsed));
    }
}
