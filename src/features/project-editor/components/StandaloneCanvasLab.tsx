"use client";

import { useCallback } from "react";

import {
    addEdge,
    Background,
    Controls,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    type Connection,
    type Edge,
    type Node,
} from "@xyflow/react";
import { Box } from "@mui/material";

import { Shell, EditorPanel } from "@/src/features/project-editor/components/ui/primitives";
import { ActionNode } from "@/src/features/project-editor/nodes/action/ActionNode";
import { ApiNode } from "@/src/features/project-editor/nodes/api/ApiNode";
import { DatabaseNode } from "@/src/features/project-editor/nodes/database/DatabaseNode";
import { ViewNode } from "@/src/features/project-editor/nodes/view/ViewNode";
import type { ProjectFlowNode, ProjectNode } from "@/src/features/project-editor/types/editor.types";

const nodeTypes = {
    view: ViewNode,
    api: ApiNode,
    database: DatabaseNode,
    action: ActionNode,
};

const MOCK_TIMESTAMP = "2026-04-02T00:00:00.000Z";

function createMockDomainNode(node: ProjectNode): ProjectFlowNode {
    return {
        id: node.id,
        type: node.kind,
        position: node.position,
        data: { node },
    };
}

const INITIAL_NODES: Node[] = [
    createMockDomainNode({
        id: "view-dashboard",
        kind: "view",
        name: "Dashboard View",
        description: "Main operational surface for authenticated users.",
        position: { x: 80, y: 120 },
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
        data: {
            route: "/dashboard",
            renderMode: "SSR",
            layout: "main-shell",
        },
    }),
    createMockDomainNode({
        id: "api-users",
        kind: "api",
        name: "Users API",
        description: "Boundary for querying and mutating user records.",
        position: { x: 470, y: 70 },
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
        data: {
            endpoint: "/api/users",
            method: "GET",
            authRequired: true,
        },
    }),
    createMockDomainNode({
        id: "db-users",
        kind: "database",
        name: "User Store",
        description: "Primary table set used by the account domain.",
        position: { x: 900, y: 70 },
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
        data: {
            provider: "postgres",
            entityName: "User",
            modelRef: "public.users",
        },
    }),
    createMockDomainNode({
        id: "action-sync-profile",
        kind: "action",
        name: "Sync Profile",
        description: "Applies profile changes after successful mutation.",
        position: { x: 470, y: 310 },
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
        data: {
            trigger: "user",
            target: "users.update-profile",
        },
    }),
    createMockDomainNode({
        id: "view-settings",
        kind: "view",
        name: "Settings View",
        description: "Secondary settings screen wired to the same domain flow.",
        position: { x: 80, y: 360 },
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
        data: {
            route: "/settings",
            renderMode: "CSR",
            layout: "settings-shell",
        },
    }),
    createMockDomainNode({
        id: "api-settings",
        kind: "api",
        name: "Settings API",
        description: "Configuration endpoint for user preferences.",
        position: { x: 900, y: 320 },
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
        data: {
            endpoint: "/api/settings",
            method: "PATCH",
            authRequired: true,
        },
    }),
];

const INITIAL_EDGES: Edge[] = [
    {
        id: "edge-dashboard-users",
        source: "view-dashboard",
        sourceHandle: "source-right",
        target: "api-users",
        targetHandle: "target-left",
        type: "smoothstep",
    },
    {
        id: "edge-users-db",
        source: "api-users",
        sourceHandle: "source-right",
        target: "db-users",
        targetHandle: "target-left",
        type: "smoothstep",
    },
    {
        id: "edge-dashboard-action",
        source: "view-dashboard",
        sourceHandle: "source-right",
        target: "action-sync-profile",
        targetHandle: "target-left",
        type: "smoothstep",
    },
    {
        id: "edge-settings-action",
        source: "view-settings",
        sourceHandle: "source-right",
        target: "action-sync-profile",
        targetHandle: "target-left",
        type: "smoothstep",
    },
    {
        id: "edge-action-settings-api",
        source: "action-sync-profile",
        sourceHandle: "source-right",
        target: "api-settings",
        targetHandle: "target-left",
        type: "smoothstep",
    },
];

function CanvasLabScene() {
    const [nodes, , onNodesChange] = useNodesState<ProjectFlowNode>(INITIAL_NODES as ProjectFlowNode[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

    const handleConnect = useCallback(
        (connection: Connection) => {
            setEdges((currentEdges) => addEdge({ ...connection, type: "smoothstep" }, currentEdges));
        },
        [setEdges],
    );

    return (
        <EditorPanel sx={{ height: "100%", p: 1.25 }}>
            <Box
                sx={{
                    position: "relative",
                    height: "100%",
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: "1px solid rgba(148, 163, 184, 0.18)",
                    background:
                        "radial-gradient(circle at top left, rgba(79, 124, 255, 0.06), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                }}
            >
                <ReactFlow<ProjectFlowNode>
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={handleConnect}
                    fitView
                    fitViewOptions={{ padding: 0.18 }}
                    minZoom={0.45}
                    maxZoom={1.8}
                    nodesConnectable
                    nodesDraggable
                    elementsSelectable
                    panOnDrag={[1, 2]}
                    zoomOnDoubleClick={false}
                    defaultEdgeOptions={{
                        type: "smoothstep",
                        style: {
                            stroke: "#94a3b8",
                            strokeWidth: 1.6,
                        },
                    }}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="rgba(148, 163, 184, 0.18)" gap={18} size={1.1} />
                    <Controls showInteractive={false} position="bottom-right" />
                </ReactFlow>
            </Box>
        </EditorPanel>
    );
}

export function StandaloneCanvasLab() {
    return (
        <Shell>
            <Box sx={{ minHeight: "100vh", p: { xs: 2, lg: 3 } }}>
                <Box sx={{ height: "calc(100vh - 48px)" }}>
                    <ReactFlowProvider>
                        <CanvasLabScene />
                    </ReactFlowProvider>
                </Box>
            </Box>
        </Shell>
    );
}