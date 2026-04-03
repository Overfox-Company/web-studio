"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useDroppable } from "@dnd-kit/core";
import {
    Background,
    ConnectionMode,
    Controls,
    ReactFlow,
    useEdgesState,
    useNodesState,
    type Connection,
    useReactFlow,
    type Node,
    type XYPosition,
} from "@xyflow/react";
import { Box } from "@mui/material";

import { projectEditorStyles } from "@/src/customization/project-editor";
import { EmptyState } from "@/src/features/project-editor/components/EmptyState";
import { EditorPanel } from "@/src/features/project-editor/components/ui/primitives";
import { ActionNode } from "@/src/features/project-editor/nodes/action/ActionNode";
import { ApiNode } from "@/src/features/project-editor/nodes/api/ApiNode";
import { DatabaseNode } from "@/src/features/project-editor/nodes/database/DatabaseNode";
import { ViewNode } from "@/src/features/project-editor/nodes/view/ViewNode";
import { useProjectEditorRuntimeStore, useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";
import type {
    ProjectEditorDragPreview,
    ProjectFlowEdge,
    ProjectFlowNode,
    ProjectNode,
} from "@/src/features/project-editor/types/editor.types";
import { canConnectFlow } from "@/src/features/project-editor/utils/can-connect";
import { buildProjectFlowEdges } from "@/src/features/project-editor/utils/flow-edges";

const nodeTypes = {
    page: ViewNode,
    api: ApiNode,
    database: DatabaseNode,
    action: ActionNode,
};

export interface CanvasApi {
    fitView: () => void;
    screenToFlowPosition: (position: XYPosition) => XYPosition;
    containsClientPoint: (position: XYPosition | null) => boolean;
}

interface CanvasAreaProps {
    registerCanvasApi: (api: CanvasApi) => void;
}

type PreviewDomainNode = ProjectFlowNode["data"]["node"];

function createFlowNode(
    node: PreviewDomainNode,
    position: XYPosition,
    selected: boolean,
    isPreview = false,
): ProjectFlowNode {
    const flowType = node.kind === "view" ? "page" : node.kind;

    return {
        id: node.id,
        type: flowType,
        position,
        data: isPreview ? { node, isPreview: true } : { node },
        selected,
        draggable: !isPreview,
        deletable: !isPreview,
        selectable: !isPreview,
        focusable: !isPreview,
        style: isPreview ? projectEditorStyles.canvas.previewNode : undefined,
    };
}

function buildFlowNodes(
    nodes: ProjectNode[],
    selectedNodeId: string | null,
    dragPreview: ProjectEditorDragPreview | null,
): ProjectFlowNode[] {
    const nextNodes = nodes.map((node) => createFlowNode(node, node.position, selectedNodeId === node.id));

    if (dragPreview?.isOverCanvas) {
        nextNodes.push(createFlowNode(dragPreview.node, dragPreview.node.position, false, true));
    }

    return nextNodes;
}

export function CanvasArea({ registerCanvasApi }: CanvasAreaProps) {
    const { fitView, screenToFlowPosition } = useReactFlow<ProjectFlowNode>();
    const { setNodeRef, isOver } = useDroppable({ id: "project-editor-canvas" });
    const canvasSurfaceRef = useRef<HTMLDivElement | null>(null);

    const initialProject = useProjectEditorStore.getState().project;
    const initialSelectedNodeId = useProjectEditorStore.getState().ui.selectedNodeId;
    const initialDragPreview = useProjectEditorRuntimeStore.getState().dragPreview;

    const moveNode = useProjectEditorStore((state) => state.moveNode);
    const addEdge = useProjectEditorStore((state) => state.addEdge);
    const selectNode = useProjectEditorStore((state) => state.selectNode);

    const projectRef = useRef(initialProject);
    const selectedNodeIdRef = useRef(initialSelectedNodeId);
    const dragPreviewRef = useRef(initialDragPreview);
    const isNodeDragInProgressRef = useRef(false);

    const [isPaletteDragActive, setIsPaletteDragActive] = useState(Boolean(initialDragPreview));
    const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<ProjectFlowNode>(
        buildFlowNodes(initialProject.nodes, initialSelectedNodeId, initialDragPreview),
    );
    const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<ProjectFlowEdge>(
        buildProjectFlowEdges(initialProject.edges),
    );

    const syncNodesFromStore = useCallback((
        nextProject = projectRef.current,
        nextSelectedNodeId = selectedNodeIdRef.current,
        nextDragPreview = dragPreviewRef.current,
    ) => {
        if (isNodeDragInProgressRef.current) {
            return;
        }

        setFlowNodes(buildFlowNodes(nextProject.nodes, nextSelectedNodeId, nextDragPreview));
    }, [setFlowNodes]);

    const syncEdgesFromStore = useCallback((nextProject = projectRef.current) => {
        if (isNodeDragInProgressRef.current) {
            return;
        }

        setFlowEdges(buildProjectFlowEdges(nextProject.edges));
    }, [setFlowEdges]);

    useEffect(() => {
        registerCanvasApi({
            fitView: () => fitView({ duration: 320, padding: 0.18 }),
            screenToFlowPosition,
            containsClientPoint: (position) => {
                if (!position || !canvasSurfaceRef.current) {
                    return false;
                }

                const bounds = canvasSurfaceRef.current.getBoundingClientRect();

                return (
                    position.x >= bounds.left &&
                    position.x <= bounds.right &&
                    position.y >= bounds.top &&
                    position.y <= bounds.bottom
                );
            },
        });
    }, [fitView, registerCanvasApi, screenToFlowPosition]);

    useEffect(() => {
        const unsubscribeProject = useProjectEditorStore.subscribe((state, previousState) => {
            const projectChanged = state.project !== previousState.project;
            const selectedNodeChanged = state.ui.selectedNodeId !== previousState.ui.selectedNodeId;

            if (!projectChanged && !selectedNodeChanged) {
                return;
            }

            projectRef.current = state.project;
            selectedNodeIdRef.current = state.ui.selectedNodeId;

            if (projectChanged || selectedNodeChanged) {
                syncNodesFromStore(state.project, state.ui.selectedNodeId, dragPreviewRef.current);
            }

            if (projectChanged && state.project.edges !== previousState.project.edges) {
                syncEdgesFromStore(state.project);
            }
        });

        const unsubscribeRuntime = useProjectEditorRuntimeStore.subscribe((state, previousState) => {
            if (state.dragPreview === previousState.dragPreview) {
                return;
            }

            dragPreviewRef.current = state.dragPreview;
            setIsPaletteDragActive(Boolean(state.dragPreview));
            syncNodesFromStore(projectRef.current, selectedNodeIdRef.current, state.dragPreview);
        });

        return () => {
            unsubscribeProject();
            unsubscribeRuntime();
        };
    }, [syncEdgesFromStore, syncNodesFromStore]);

    const hasPreviewNode = flowNodes.some((node) => Boolean(node.data.isPreview));
    const hasPersistedNodes = flowNodes.some((node) => !node.data.isPreview);

    function handleNodeDragStop(_: React.MouseEvent, node: Node) {
        isNodeDragInProgressRef.current = false;
        moveNode(node.id, node.position);
        selectNode(node.id);
    }

    function handleNodeDragStart() {
        isNodeDragInProgressRef.current = true;
    }

    function handleConnect(connection: Connection) {
        const validation = canConnectFlow(connection, projectRef.current.nodes, projectRef.current.edges);

        if (!validation.allowed || !connection.source || !connection.target) {
            return;
        }

        addEdge({
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
        });
    }

    function validateFlowConnection(connection: Connection | ProjectFlowEdge) {
        return canConnectFlow(
            {
                source: connection.source,
                target: connection.target,
                sourceHandle: connection.sourceHandle ?? null,
                targetHandle: connection.targetHandle ?? null,
            },
            projectRef.current.nodes,
            projectRef.current.edges,
        ).allowed;
    }

    return (
        <EditorPanel sx={projectEditorStyles.canvas.panel}>
            <Box
                ref={(element: HTMLDivElement | null) => {
                    canvasSurfaceRef.current = element;
                    setNodeRef(element);
                }}
                sx={projectEditorStyles.canvas.surface(hasPreviewNode || isOver)}
            >
                {!hasPersistedNodes && !hasPreviewNode ? <EmptyState /> : null}

                <ReactFlow<ProjectFlowNode>
                    nodes={flowNodes}
                    edges={flowEdges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={handleConnect}
                    isValidConnection={validateFlowConnection}
                    onNodeDragStart={handleNodeDragStart}
                    onNodeDragStop={handleNodeDragStop}
                    onNodeClick={(_, node) => selectNode(node.id)}
                    onPaneClick={() => selectNode(null)}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.45}
                    maxZoom={1.8}
                    connectionMode={ConnectionMode.Strict}
                    nodesConnectable={!isPaletteDragActive}
                    nodesDraggable={!isPaletteDragActive}
                    elementsSelectable={!isPaletteDragActive}
                    selectionOnDrag={false}
                    deleteKeyCode={null}
                    panOnDrag={isPaletteDragActive ? false : [0, 1]}
                    connectionLineStyle={projectEditorStyles.canvas.connectionLine}
                    defaultEdgeOptions={{
                        type: "smoothstep",
                        className: "project-flow-edge",
                    }}
                    zoomOnDoubleClick={false}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background
                        color={projectEditorStyles.canvas.backgroundColor}
                        gap={projectEditorStyles.canvas.backgroundGap}
                        size={projectEditorStyles.canvas.backgroundSize}
                    />
                    <Controls showInteractive={true} position="bottom-right" />
                </ReactFlow>
            </Box>
        </EditorPanel>
    );
}