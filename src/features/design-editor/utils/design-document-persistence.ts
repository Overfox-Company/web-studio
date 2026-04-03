import { createDefaultDesignDocument } from "@/src/features/design-editor/utils/create-design-document";
import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import {
    LocalStorageEditorPersistenceAdapter,
    type EditorPersistenceAdapter,
} from "@/src/features/project-editor/store/editor.persistence";
import { useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";
import type { PageNode, PageViewportMode, ProjectEditorState } from "@/src/features/project-editor/types/editor.types";

export const defaultDesignPersistenceAdapter = new LocalStorageEditorPersistenceAdapter();

export interface ResolvedDesignDocumentSnapshot {
    project: ProjectEditorState;
    viewNode: PageNode;
    document: DesignDocumentSnapshot;
}

export function loadProjectSnapshot(projectId: string, adapter: EditorPersistenceAdapter): ProjectEditorState | null {
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

export function findViewNode(project: ProjectEditorState, viewId: string): PageNode | null {
    const match = project.nodes.find((node) => node.id === viewId);

    if (!match || match.kind !== "page") {
        return null;
    }

    return match;
}

export function resolveDesignDocumentSnapshot(
    projectId: string,
    viewId: string,
    adapter: EditorPersistenceAdapter,
): ResolvedDesignDocumentSnapshot | null {
    const project = loadProjectSnapshot(projectId, adapter);

    if (!project) {
        return null;
    }

    const viewNode = findViewNode(project, viewId);

    if (!viewNode) {
        return null;
    }

    return {
        project,
        viewNode,
        document: viewNode.data.designDocument ?? createDefaultDesignDocument({
            viewNodeId: viewNode.id,
            viewName: viewNode.name,
        }),
    };
}

export function persistDesignDocument(
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
            if (node.id !== viewId || node.kind !== "page") {
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

export function persistPageViewportMode(
    projectId: string,
    viewId: string,
    viewportMode: PageViewportMode,
    adapter: EditorPersistenceAdapter,
) {
    const sourceProject = loadProjectSnapshot(projectId, adapter);

    if (!sourceProject) {
        throw new Error("Unable to resolve project state for viewport persistence.");
    }

    const timestamp = new Date().toISOString();
    const nextProject: ProjectEditorState = {
        ...sourceProject,
        updatedAt: timestamp,
        nodes: sourceProject.nodes.map((node) => {
            if (node.id !== viewId || node.kind !== "page") {
                return node;
            }

            return {
                ...node,
                updatedAt: timestamp,
                data: {
                    ...node.data,
                    viewportMode,
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