"use client";

import { useEffect } from "react";

import { useDroppable } from "@dnd-kit/core";
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    useReactFlow,
} from "@xyflow/react";

import { UiAlert, UiBox } from "@/src/components/ui-kit";
import { validateConnection } from "@/src/features/nodes/config/connection-rules";
import { ArchitectureNodeCard } from "@/src/features/nodes/components/architecture-node";
import { useEditorStore } from "@/src/store/editor-store";
import type { ArchitectureEdge, ArchitectureNode, CanvasApi } from "@/src/types/editor";

const nodeTypes = {
    architectureNode: ArchitectureNodeCard,
};

interface FlowCanvasProps {
    registerCanvasApi: (api: CanvasApi) => void;
}

export function FlowCanvas({ registerCanvasApi }: FlowCanvasProps) {
    const { screenToFlowPosition, fitView } = useReactFlow<ArchitectureNode, ArchitectureEdge>();
    const { setNodeRef, isOver } = useDroppable({ id: "canvas-dropzone" });

    const nodes = useEditorStore((state) => state.nodes);
    const edges = useEditorStore((state) => state.edges);
    const lastValidationError = useEditorStore((state) => state.lastValidationError);
    const onNodesChange = useEditorStore((state) => state.onNodesChange);
    const onEdgesChange = useEditorStore((state) => state.onEdgesChange);
    const onConnect = useEditorStore((state) => state.onConnect);
    const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId);
    const openPageEditor = useEditorStore((state) => state.openPageEditor);

    useEffect(() => {
        registerCanvasApi({
            fitView: () => fitView({ duration: 450, padding: 0.16 }),
            screenToFlowPosition,
        });
    }, [fitView, registerCanvasApi, screenToFlowPosition]);

    return (
        <UiBox sx={{ position: "relative", minWidth: 0, height: "100%" }}>
            {lastValidationError ? (
                <UiAlert
                    severity="warning"
                    sx={{
                        position: "absolute",
                        top: 18,
                        left: 18,
                        zIndex: 30,
                        borderRadius: 3,
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(30, 14, 18, 0.92)",
                        color: "#fff1f2",
                    }}
                >
                    {lastValidationError}
                </UiAlert>
            ) : null}

            <UiBox
                ref={setNodeRef}
                sx={{
                    height: "100%",
                    borderRadius: 0,
                    border: isOver ? "1px solid rgba(196,196,196,0.55)" : "1px solid rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    background: "#0e0e0e",
                    boxShadow: isOver ? "0 0 0 1px rgba(196,196,196,0.18) inset" : "none",
                }}
            >
                <ReactFlow<ArchitectureNode, ArchitectureEdge>
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                    onNodeDoubleClick={(_, node) => {
                        if (node.data.kind === "page") {
                            openPageEditor(node.id);
                        }
                    }}
                    onPaneClick={() => setSelectedNodeId(null)}
                    fitView
                    minZoom={0.3}
                    maxZoom={1.6}
                    defaultEdgeOptions={{
                        type: "smoothstep",
                        animated: true,
                        style: {
                            stroke: "rgba(166, 166, 166, 0.72)",
                            strokeWidth: 2,
                        },
                    }}
                    connectionLineStyle={{
                        stroke: "rgba(196,196,196,0.9)",
                        strokeWidth: 2,
                    }}
                    isValidConnection={(connection) => {
                        const sourceNode = nodes.find((node) => node.id === connection.source);
                        const targetNode = nodes.find((node) => node.id === connection.target);

                        return validateConnection(sourceNode, targetNode, edges).ok;
                    }}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="rgba(255,255,255,0.08)" gap={24} size={1.1} />
                    <MiniMap
                        pannable
                        zoomable
                        nodeColor={(node) => {
                            if (node.data.kind === "database") {
                                return "#4cc9f0";
                            }

                            if (node.data.kind === "page") {
                                return "#80ed99";
                            }

                            if (node.data.kind === "serverAction") {
                                return "#ff6b6b";
                            }

                            return "#94a3b8";
                        }}
                        style={{ background: "#131313", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}
                    />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </UiBox>
        </UiBox>
    );
}