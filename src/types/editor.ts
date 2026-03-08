import type { Edge, Node, XYPosition } from "@xyflow/react";

export const ARCHITECTURE_NODE_KINDS = [
    "page",
    "component",
    "database",
    "api",
    "serverAction",
    "externalApi",
    "stateStore",
    "group",
] as const;

export type ArchitectureNodeKind = (typeof ARCHITECTURE_NODE_KINDS)[number];

export const RENDER_MODES = ["ssr", "csr"] as const;
export type RenderMode = (typeof RENDER_MODES)[number];

export const DATA_TRIGGERS = ["event", "fetch", "mutation", "navigation", "sync"] as const;
export type DataTrigger = (typeof DATA_TRIGGERS)[number];

export type RelationType = "hasOne" | "hasMany" | "belongsTo";

export interface FieldDefinition {
    name: string;
    type: string;
    required: boolean;
    unique?: boolean;
}

export interface RelationDefinition {
    target: string;
    type: RelationType;
}

export interface BaseNodeData extends Record<string, unknown> {
    kind: ArchitectureNodeKind;
    label: string;
    description: string;
}

export interface PageNodeData extends BaseNodeData {
    kind: "page";
    route: string;
    renderMode: RenderMode;
    layout: string;
    connectedComponentIds: string[];
    builderTree: string;
}

export interface ComponentNodeData extends BaseNodeData {
    kind: "component";
    componentType: string;
    propsSchema: Record<string, string>;
    stateDependencies: string[];
}

export interface DatabaseNodeData extends BaseNodeData {
    kind: "database";
    modelName: string;
    fields: FieldDefinition[];
    indexes: string[];
    relations: RelationDefinition[];
}

export interface ApiNodeData extends BaseNodeData {
    kind: "api";
    method: string;
    route: string;
    inputSchema: string;
    outputSchema: string;
}

export interface ServerActionNodeData extends BaseNodeData {
    kind: "serverAction";
    actionName: string;
    inputData: string;
    mutationLogic: string;
    databaseDependencies: string[];
}

export interface ExternalApiNodeData extends BaseNodeData {
    kind: "externalApi";
    serviceName: string;
    baseUrl: string;
    authStrategy: string;
}

export interface StateStoreNodeData extends BaseNodeData {
    kind: "stateStore";
    storeName: string;
    stateShape: Record<string, string>;
    persistence: boolean;
}

export interface GroupNodeData extends BaseNodeData {
    kind: "group";
    purpose: string;
}

export type ArchitectureNodeData =
    | PageNodeData
    | ComponentNodeData
    | DatabaseNodeData
    | ApiNodeData
    | ServerActionNodeData
    | ExternalApiNodeData
    | StateStoreNodeData
    | GroupNodeData;

export type ArchitectureNode = Node<ArchitectureNodeData, "architectureNode">;

export interface DataFlowEdgeData extends Record<string, unknown> {
    schema: string;
    trigger: DataTrigger;
    notes?: string;
}

export type ArchitectureEdge = Edge<DataFlowEdgeData>;

export interface PaletteItem {
    kind: ArchitectureNodeKind;
    title: string;
    summary: string;
    accent: string;
}

export interface CanvasApi {
    fitView: () => void;
    screenToFlowPosition: (position: XYPosition) => XYPosition;
}