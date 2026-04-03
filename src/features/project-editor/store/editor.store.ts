import { create } from "zustand";
import { nanoid } from "nanoid";

import { projectEditorStateSchema } from "@/src/features/project-editor/schema/project.schema";
import { projectEdgeSchema, projectNodeSchema } from "@/src/features/project-editor/schema/node.schema";
import type {
    EditorSaveState,
    ProjectEditorDragPreview,
    ProjectEditorState,
    ProjectEditorUiState,
    ProjectEdge,
    ProjectNodeKind,
} from "@/src/features/project-editor/types/editor.types";
import { canConnect } from "@/src/features/project-editor/utils/can-connect";
import { createNodeDefaults, touchNode } from "@/src/features/project-editor/utils/create-node-defaults";
import { normalizeProjectState } from "@/src/features/project-editor/utils/normalize-project-state";
import { createSocketHandleId } from "@/src/features/project-editor/utils/socket-types";

interface HoveredSocketState {
    nodeId: string;
    handleId: string;
}

interface ProjectEditorRuntimeStore {
    dragPreview: ProjectEditorDragPreview | null;
    hoveredSocket: HoveredSocketState | null;
    startDragPreview: (kind: ProjectNodeKind) => void;
    updateDragPreview: (position: { x: number; y: number } | null, isOverCanvas: boolean) => void;
    clearDragPreview: () => void;
    setHoveredSocket: (nodeId: string, handleId: string) => void;
    clearHoveredSocket: () => void;
}

interface ProjectEditorStore {
    project: ProjectEditorState;
    ui: ProjectEditorUiState;
    initializeProject: (projectId: string, name?: string) => void;
    hydrateProject: (project: ProjectEditorState) => void;
    setProjectName: (name: string) => void;
    addNode: (kind: ProjectNodeKind, position: { x: number; y: number }) => string;
    addEdge: (edge: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }) => string | null;
    deleteEdge: (edgeId: string) => void;
    moveNode: (nodeId: string, position: { x: number; y: number }) => void;
    updateNode: (
        nodeId: string,
        updates: {
            name?: string;
            description?: string;
            position?: { x: number; y: number };
            data?: Record<string, unknown>;
        },
    ) => void;
    deleteNode: (nodeId: string) => void;
    deleteSelectedNode: () => void;
    selectNode: (nodeId: string | null) => void;

    /**
     * Compat proxies para no romper llamadas existentes.
     * El estado real del drag preview vive en useProjectEditorRuntimeStore.
     */
    startDragPreview: (kind: ProjectNodeKind) => void;
    updateDragPreview: (position: { x: number; y: number } | null, isOverCanvas: boolean) => void;
    clearDragPreview: () => void;

    setSearchQuery: (searchQuery: string) => void;
    setHasHydrated: (hasHydrated: boolean) => void;
    setSaveState: (saveState: EditorSaveState) => void;
    resetProject: (projectId: string, name?: string) => void;
}

function createDragPreview(kind: ProjectNodeKind): ProjectEditorDragPreview {
    return {
        node: createNodeDefaults(kind, { x: 0, y: 0 }),
        isOverCanvas: false,
    };
}

function createEmptyProject(projectId = "demo-project", name = "Project Atlas"): ProjectEditorState {
    return projectEditorStateSchema.parse({
        projectId,
        name,
        nodes: [],
        edges: [],
        version: 2,
        updatedAt: new Date().toISOString(),
    });
}

function createProjectEdge(edge: {
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
    sourceSocketType: ProjectEdge["sourceSocketType"];
    targetSocketType: ProjectEdge["targetSocketType"];
}): ProjectEdge {
    const timestamp = new Date().toISOString();

    return projectEdgeSchema.parse({
        id: nanoid(),
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        sourceSocketType: edge.sourceSocketType,
        targetSocketType: edge.targetSocketType,
        createdAt: timestamp,
        updatedAt: timestamp,
    });
}

function createDefaultUiState(): ProjectEditorUiState {
    return {
        selectedNodeId: null,
        searchQuery: "",
        hasHydrated: false,
        saveState: "saved",
        dragPreview: null,
    };
}

function updateProjectTimestamp(project: ProjectEditorState): ProjectEditorState {
    return {
        ...project,
        updatedAt: new Date().toISOString(),
    };
}

export const useProjectEditorRuntimeStore = create<ProjectEditorRuntimeStore>((set) => ({
    dragPreview: null,
    hoveredSocket: null,

    startDragPreview: (kind) => {
        set({
            dragPreview: createDragPreview(kind),
        });
    },

    updateDragPreview: (position, isOverCanvas) => {
        set((state) => {
            const currentPreview = state.dragPreview;

            if (!currentPreview) {
                return state;
            }

            const nextPosition = position ?? currentPreview.node.position;
            const positionUnchanged =
                currentPreview.node.position.x === nextPosition.x &&
                currentPreview.node.position.y === nextPosition.y;

            if (currentPreview.isOverCanvas === isOverCanvas && positionUnchanged) {
                return state;
            }

            return {
                dragPreview: {
                    ...currentPreview,
                    isOverCanvas,
                    node: {
                        ...currentPreview.node,
                        position: nextPosition,
                    },
                },
            };
        });
    },

    clearDragPreview: () => {
        set((state) => {
            if (!state.dragPreview) {
                return state;
            }

            return {
                dragPreview: null,
            };
        });
    },

    setHoveredSocket: (nodeId, handleId) => {
        set((state) => {
            if (state.hoveredSocket?.nodeId === nodeId && state.hoveredSocket?.handleId === handleId) {
                return state;
            }

            return {
                hoveredSocket: {
                    nodeId,
                    handleId,
                },
            };
        });
    },

    clearHoveredSocket: () => {
        set((state) => {
            if (!state.hoveredSocket) {
                return state;
            }

            return {
                hoveredSocket: null,
            };
        });
    },
}));

export const useProjectEditorStore = create<ProjectEditorStore>((set, get) => ({
    project: createEmptyProject(),
    ui: createDefaultUiState(),

    initializeProject: (projectId, name = "Project Atlas") => {
        const current = get().project;

        if (current.projectId === projectId) {
            return;
        }

        useProjectEditorRuntimeStore.getState().clearDragPreview();
        useProjectEditorRuntimeStore.getState().clearHoveredSocket();

        set({
            project: createEmptyProject(projectId, name),
            ui: createDefaultUiState(),
        });
    },

    hydrateProject: (project) => {
        useProjectEditorRuntimeStore.getState().clearDragPreview();
        useProjectEditorRuntimeStore.getState().clearHoveredSocket();

        set((state) => ({
            project: projectEditorStateSchema.parse(normalizeProjectState(projectEditorStateSchema.parse(project))),
            ui: {
                ...state.ui,
                selectedNodeId: null,
                hasHydrated: true,
                saveState: "saved",
                dragPreview: null,
            },
        }));
    },

    setProjectName: (name) => {
        set((state) => {
            if (state.project.name === name) {
                return state;
            }

            return {
                project: updateProjectTimestamp({
                    ...state.project,
                    name,
                }),
                ui: {
                    ...state.ui,
                    saveState: "unsaved",
                },
            };
        });
    },

    addNode: (kind, position) => {
        const node = createNodeDefaults(kind, position);

        set((state) => ({
            project: updateProjectTimestamp({
                ...state.project,
                nodes: [...state.project.nodes, node],
            }),
            ui: {
                ...state.ui,
                selectedNodeId: node.id,
                saveState: "unsaved",
            },
        }));

        return node.id;
    },

    addEdge: (edge) => {
        const validation = canConnect({
            nodes: get().project.nodes,
            edges: get().project.edges,
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            sourceHandleId: edge.sourceHandle,
            targetHandleId: edge.targetHandle,
        });

        if (!validation.allowed || !validation.sourceSocket || !validation.targetSocket) {
            return validation.existingEdgeId ?? null;
        }

        const nextEdge = createProjectEdge({
            source: edge.source,
            target: edge.target,
            sourceHandle: createSocketHandleId(validation.sourceSocket),
            targetHandle: createSocketHandleId(validation.targetSocket),
            sourceSocketType: validation.sourceSocket.socketType,
            targetSocketType: validation.targetSocket.socketType,
        });

        set((state) => ({
            project: updateProjectTimestamp({
                ...state.project,
                edges: [...state.project.edges, nextEdge],
            }),
            ui: {
                ...state.ui,
                saveState: "unsaved",
            },
        }));

        return nextEdge.id;
    },

    deleteEdge: (edgeId) => {
        set((state) => {
            const hasEdge = state.project.edges.some((edge) => edge.id === edgeId);

            if (!hasEdge) {
                return state;
            }

            return {
                project: updateProjectTimestamp({
                    ...state.project,
                    edges: state.project.edges.filter((edge) => edge.id !== edgeId),
                }),
                ui: {
                    ...state.ui,
                    saveState: "unsaved",
                },
            };
        });
    },

    moveNode: (nodeId, position) => {
        set((state) => {
            const existingNode = state.project.nodes.find((node) => node.id === nodeId);

            if (!existingNode) {
                return state;
            }

            if (existingNode.position.x === position.x && existingNode.position.y === position.y) {
                return state;
            }

            return {
                project: updateProjectTimestamp({
                    ...state.project,
                    nodes: state.project.nodes.map((node) => {
                        if (node.id !== nodeId) {
                            return node;
                        }

                        return projectNodeSchema.parse(
                            touchNode({
                                ...node,
                                position,
                            }),
                        );
                    }),
                }),
                ui: {
                    ...state.ui,
                    saveState: "unsaved",
                },
            };
        });
    },

    updateNode: (nodeId, updates) => {
        set((state) => ({
            project: updateProjectTimestamp({
                ...state.project,
                nodes: state.project.nodes.map((node) => {
                    if (node.id !== nodeId) {
                        return node;
                    }

                    const nextNode = {
                        ...node,
                        ...updates,
                        data: {
                            ...node.data,
                            ...(updates.data ?? {}),
                        },
                    };

                    return projectNodeSchema.parse(touchNode(nextNode));
                }),
            }),
            ui: {
                ...state.ui,
                saveState: "unsaved",
            },
        }));
    },

    deleteNode: (nodeId) => {
        set((state) => ({
            project: updateProjectTimestamp({
                ...state.project,
                nodes: state.project.nodes.filter((node) => node.id !== nodeId),
                edges: state.project.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
            }),
            ui: {
                ...state.ui,
                selectedNodeId: state.ui.selectedNodeId === nodeId ? null : state.ui.selectedNodeId,
                saveState: "unsaved",
            },
        }));
    },

    deleteSelectedNode: () => {
        const selectedNodeId = get().ui.selectedNodeId;

        if (!selectedNodeId) {
            return;
        }

        get().deleteNode(selectedNodeId);
    },

    selectNode: (nodeId) => {
        set((state) => {
            if (state.ui.selectedNodeId === nodeId) {
                return state;
            }

            return {
                ui: {
                    ...state.ui,
                    selectedNodeId: nodeId,
                },
            };
        });
    },

    startDragPreview: (kind) => {
        useProjectEditorRuntimeStore.getState().startDragPreview(kind);
    },

    updateDragPreview: (position, isOverCanvas) => {
        useProjectEditorRuntimeStore.getState().updateDragPreview(position, isOverCanvas);
    },

    clearDragPreview: () => {
        useProjectEditorRuntimeStore.getState().clearDragPreview();
    },

    setSearchQuery: (searchQuery) => {
        set((state) => ({
            ui: {
                ...state.ui,
                searchQuery,
            },
        }));
    },

    setHasHydrated: (hasHydrated) => {
        set((state) => ({
            ui: {
                ...state.ui,
                hasHydrated,
            },
        }));
    },

    setSaveState: (saveState) => {
        set((state) => ({
            ui: {
                ...state.ui,
                saveState,
            },
        }));
    },

    resetProject: (projectId, name = "Project Atlas") => {
        useProjectEditorRuntimeStore.getState().clearDragPreview();
        useProjectEditorRuntimeStore.getState().clearHoveredSocket();

        set({
            project: createEmptyProject(projectId, name),
            ui: {
                ...createDefaultUiState(),
                hasHydrated: true,
                saveState: "unsaved",
            },
        });
    },
}));