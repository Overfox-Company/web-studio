"use client";

import { useCallback } from "react";

import {
    Background,
    ConnectionMode,
    Controls,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    type Connection,
    type Node,
} from "@xyflow/react";
import { Box } from "@mui/material";

import { Shell, EditorPanel } from "@/src/features/project-editor/components/ui/primitives";
import { ActionNode } from "@/src/features/project-editor/nodes/action/ActionNode";
import { ApiNode } from "@/src/features/project-editor/nodes/api/ApiNode";
import { DatabaseNode } from "@/src/features/project-editor/nodes/database/DatabaseNode";
import { ViewNode } from "@/src/features/project-editor/nodes/view/ViewNode";
import type { ProjectEdge, ProjectFlowEdge, ProjectFlowNode, ProjectNode } from "@/src/features/project-editor/types/editor.types";
import { canConnectFlow } from "@/src/features/project-editor/utils/can-connect";
import { buildProjectFlowEdges, createProjectFlowEdge } from "@/src/features/project-editor/utils/flow-edges";

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

const INITIAL_EDGES: ProjectFlowEdge[] = buildProjectFlowEdges([
    {
        id: "edge-dashboard-users",
        source: "view-dashboard",
        sourceHandle: "output:submit",
        target: "api-users",
        targetHandle: "input:request",
        sourceSocketType: "trigger",
        targetSocketType: "trigger",
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
    },
    {
        id: "edge-dashboard-users-payload",
        source: "view-dashboard",
        sourceHandle: "output:formData",
        target: "api-users",
        targetHandle: "input:requestInput",
        sourceSocketType: "payload",
        targetSocketType: "payload",
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
    },
    {
        id: "edge-users-action-trigger",
        source: "api-users",
        sourceHandle: "output:run",
        target: "action-sync-profile",
        targetHandle: "input:run",
        sourceSocketType: "trigger",
        targetSocketType: "trigger",
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
    },
    {
        id: "edge-users-action-payload",
        source: "api-users",
        sourceHandle: "output:validatedInput",
        target: "action-sync-profile",
        targetHandle: "input:input",
        sourceSocketType: "payload",
        targetSocketType: "payload",
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
    },
    {
        id: "edge-action-db-query",
        source: "action-sync-profile",
        sourceHandle: "output:dataRequest",
        target: "db-users",
        targetHandle: "input:request",
        sourceSocketType: "query",
        targetSocketType: "query",
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
    },
    {
        id: "edge-db-action-entity",
        source: "db-users",
        sourceHandle: "output:entityData",
        target: "action-sync-profile",
        targetHandle: "input:sourceEntity",
        sourceSocketType: "entity",
        targetSocketType: "entity",
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
    },
    {
        id: "edge-action-view-result",
        source: "action-sync-profile",
        sourceHandle: "output:output",
        target: "view-settings",
        targetHandle: "input:viewModel",
        sourceSocketType: "result",
        targetSocketType: "result",
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
    },
    {
        id: "edge-settings-api-trigger",
        source: "view-settings",
        sourceHandle: "output:refresh",
        target: "api-settings",
        targetHandle: "input:request",
        sourceSocketType: "trigger",
        targetSocketType: "trigger",
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
    },
    {
        id: "edge-settings-api-payload",
        source: "view-settings",
        sourceHandle: "output:filters",
        target: "api-settings",
        targetHandle: "input:requestInput",
        sourceSocketType: "payload",
        targetSocketType: "payload",
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
    },
    {
        id: "edge-api-view-result",
        source: "api-settings",
        sourceHandle: "output:response",
        target: "view-settings",
        targetHandle: "input:responseData",
        sourceSocketType: "result",
        targetSocketType: "result",
        createdAt: MOCK_TIMESTAMP,
        updatedAt: MOCK_TIMESTAMP,
    },
]);

function CanvasLabScene() {
    const [nodes, , onNodesChange] = useNodesState<ProjectFlowNode>(INITIAL_NODES as ProjectFlowNode[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<ProjectFlowEdge>(INITIAL_EDGES);

    const mapFlowEdgesToProjectEdges = useCallback((items: ProjectFlowEdge[]): ProjectEdge[] => {
        return items.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle ?? undefined,
            targetHandle: edge.targetHandle ?? undefined,
            sourceSocketType: edge.data?.sourceSocketType,
            targetSocketType: edge.data?.targetSocketType,
            createdAt: MOCK_TIMESTAMP,
            updatedAt: MOCK_TIMESTAMP,
        }));
    }, []);

    const handleConnect = useCallback(
        (connection: Connection) => {
            const currentProjectEdges = mapFlowEdgesToProjectEdges(edges);
            const currentNodes = nodes.map((node) => node.data.node as ProjectNode);
            const validation = canConnectFlow(connection, currentNodes, currentProjectEdges);

            if (!validation.allowed || !connection.source || !connection.target || !validation.sourceSocket || !validation.targetSocket) {
                return;
            }

            const sourceSocket = validation.sourceSocket;
            const targetSocket = validation.targetSocket;

            setEdges((currentEdges) => [
                ...currentEdges,
                createProjectFlowEdge({
                    id: `${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
                    source: connection.source,
                    target: connection.target,
                    sourceHandle: connection.sourceHandle ?? undefined,
                    targetHandle: connection.targetHandle ?? undefined,
                    sourceSocketType: sourceSocket.socketType,
                    targetSocketType: targetSocket.socketType,
                    createdAt: MOCK_TIMESTAMP,
                    updatedAt: MOCK_TIMESTAMP,
                }),
            ]);
        },
        [edges, mapFlowEdgesToProjectEdges, nodes, setEdges],
    );

    const validateFlowConnection = useCallback(
        (connection: Connection | ProjectFlowEdge) => {
            return canConnectFlow(
                {
                    source: connection.source,
                    target: connection.target,
                    sourceHandle: connection.sourceHandle ?? null,
                    targetHandle: connection.targetHandle ?? null,
                },
                nodes.map((node) => node.data.node as ProjectNode),
                mapFlowEdgesToProjectEdges(edges),
            ).allowed;
        },
        [edges, mapFlowEdgesToProjectEdges, nodes],
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
                    isValidConnection={validateFlowConnection}
                    fitView
                    fitViewOptions={{ padding: 0.18 }}
                    minZoom={0.45}
                    maxZoom={1.8}
                    connectionMode={ConnectionMode.Strict}
                    nodesConnectable
                    nodesDraggable
                    elementsSelectable
                    panOnDrag={[1, 2]}
                    zoomOnDoubleClick={false}
                    connectionLineStyle={{
                        stroke: "rgba(71, 85, 105, 0.76)",
                        strokeWidth: 1.8,
                    }}
                    defaultEdgeOptions={{
                        type: "smoothstep",
                        className: "project-flow-edge",
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