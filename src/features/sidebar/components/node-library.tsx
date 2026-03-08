"use client";

import { useDraggable } from "@dnd-kit/core";

import { UiBox, UiDividerLine, UiPaletteCard, UiStack, UiTypography } from "@/src/components/ui-kit";
import { NODE_DEFINITIONS } from "@/src/features/nodes/config/node-definitions";
import { useEditorStore } from "@/src/store/editor-store";
import type { ArchitectureNodeKind } from "@/src/types/editor";

function DraggablePaletteCard({ kind, activeKind }: { kind: ArchitectureNodeKind; activeKind: ArchitectureNodeKind | null }) {
    const definition = NODE_DEFINITIONS[kind];
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `palette-${kind}`,
        data: {
            kind,
        },
    });

    return (
        <UiPaletteCard
            ref={setNodeRef}
            title={definition.title}
            summary={definition.summary}
            accent={definition.accent}
            active={activeKind === kind}
            dragging={isDragging}
            {...listeners}
            {...attributes}
            sx={{
                transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            }}
        />
    );
}

export function NodeLibrary({ activeKind }: { activeKind: ArchitectureNodeKind | null }) {
    const addNode = useEditorStore((state) => state.addNode);
    const nodes = useEditorStore((state) => state.nodes);

    return (
        <UiStack
            spacing={2}
            sx={{
                height: "100%",
                minHeight: 0,
                borderRadius: 0,
                border: 0,
                background: "#11141b",
                p: 2.25,
                overflowY: "auto",
            }}
        >
            <UiBox>
                <UiTypography variant="overline" sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}>
                    Node Library
                </UiTypography>
                <UiTypography variant="h6" sx={{ fontSize: 18, fontWeight: 700, mt: 0.5 }}>
                    Drag architecture primitives into the canvas
                </UiTypography>
            </UiBox>

            <UiDividerLine sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

            <UiStack spacing={1.25}>
                {Object.keys(NODE_DEFINITIONS).map((kind) => (
                    <UiBox
                        key={kind}
                        onDoubleClick={() => {
                            const offset = nodes.length * 24;
                            addNode(kind as ArchitectureNodeKind, { x: 160 + offset, y: 120 + offset });
                        }}
                    >
                        <DraggablePaletteCard kind={kind as ArchitectureNodeKind} activeKind={activeKind} />
                    </UiBox>
                ))}
            </UiStack>

            <UiDividerLine sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

            <UiBox sx={{ borderRadius: 2.5, backgroundColor: "#0f131a", border: "1px solid rgba(255,255,255,0.06)", p: 1.75 }}>
                <UiTypography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
                    Modeling rules
                </UiTypography>
                <UiTypography variant="body2" sx={{ color: "rgba(255,255,255,0.66)", lineHeight: 1.6 }}>
                    Connections are schema-aware and validated by node type. Use Page, Component, API, Server Action and Database nodes to describe an end-to-end full-stack flow.
                </UiTypography>
            </UiBox>
        </UiStack>
    );
}