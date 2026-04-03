import type { Edge, Node, XYPosition } from "@xyflow/react";

import type { SocketType } from "@/src/features/project-editor/utils/socket-types";

export const PROJECT_NODE_KINDS = ["view", "api", "database", "action"] as const;

export type ProjectNodeKind = (typeof PROJECT_NODE_KINDS)[number];

export const VIEW_RENDER_MODES = ["SSR", "CSR"] as const;
export type ViewRenderMode = (typeof VIEW_RENDER_MODES)[number];

export const API_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type ApiMethod = (typeof API_METHODS)[number];

export const DATABASE_PROVIDERS = ["postgres", "mysql", "mongodb", "sqlite"] as const;
export type DatabaseProvider = (typeof DATABASE_PROVIDERS)[number];

export const ACTION_TRIGGERS = ["user", "system", "cron"] as const;
export type ActionTrigger = (typeof ACTION_TRIGGERS)[number];

export interface ViewNodeData {
    route: string;
    renderMode: ViewRenderMode;
    layout: string;
}

export interface ApiNodeData {
    endpoint: string;
    method: ApiMethod;
    authRequired: boolean;
}

export interface DatabaseNodeData {
    provider: DatabaseProvider;
    entityName: string;
    modelRef: string;
}

export interface ActionNodeData {
    trigger: ActionTrigger;
    target: string;
}

interface ProjectNodeBase<TKind extends ProjectNodeKind, TData> {
    id: string;
    kind: TKind;
    name: string;
    description: string;
    position: XYPosition;
    data: TData;
    createdAt: string;
    updatedAt: string;
}

export type ViewNode = ProjectNodeBase<"view", ViewNodeData>;
export type ApiNode = ProjectNodeBase<"api", ApiNodeData>;
export type DatabaseNode = ProjectNodeBase<"database", DatabaseNodeData>;
export type ActionNode = ProjectNodeBase<"action", ActionNodeData>;

export type ProjectNode = ViewNode | ApiNode | DatabaseNode | ActionNode;

export interface ProjectEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    sourceSocketType?: SocketType;
    targetSocketType?: SocketType;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectFlowNodeData extends Record<string, unknown> {
    node: ProjectNode;
    isPreview?: boolean;
}

export interface ProjectFlowEdgeData extends Record<string, unknown> {
    sourceSocketType?: SocketType;
    targetSocketType?: SocketType;
}

export type ProjectFlowNode = Node<ProjectFlowNodeData, ProjectNodeKind>;
export type ProjectFlowEdge = Edge<ProjectFlowEdgeData>;

export interface ProjectEditorState {
    projectId: string;
    name: string;
    nodes: ProjectNode[];
    edges: ProjectEdge[];
    version: number;
    updatedAt: string;
}

export type EditorSaveState = "saved" | "unsaved" | "saving" | "error";

export interface ProjectEditorDragPreview {
    node: ProjectNode;
    isOverCanvas: boolean;
}

export interface ProjectEditorUiState {
    selectedNodeId: string | null;
    searchQuery: string;
    hasHydrated: boolean;
    saveState: EditorSaveState;
    dragPreview: ProjectEditorDragPreview | null;
}

export interface ExportedProjectSpec {
    project: {
        id: string;
        name: string;
        version: number;
        updatedAt: string;
    };
    architecture: {
        nodes: ProjectNode[];
        relations: ProjectEdge[];
    };
    design: {
        colors: string[];
        fonts: string[];
        components: string[];
    };
    data: {
        databases: DatabaseNode[];
        apis: ApiNode[];
        actions: ActionNode[];
        views: ViewNode[];
    };
}
