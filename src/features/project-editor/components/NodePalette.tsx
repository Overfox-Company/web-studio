"use client";

import { useMemo } from "react";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Box, Stack, Typography } from "@mui/material";

import {
    EditorPanel,
    EditorSection,
    EditorSectionHint,
    EditorSectionTitle,
    PanelEyebrow,
    PanelHeader,
    TextField,
} from "@/src/features/project-editor/components/ui/primitives";
import { NodeIcon } from "@/src/features/project-editor/nodes/base/NodeIcon";
import { useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";
import { NODE_PALETTE } from "@/src/features/project-editor/utils/node-colors";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

function PaletteItem({ kind, activeKind }: { kind: ProjectNodeKind; activeKind: ProjectNodeKind | null }) {
    const token = NODE_PALETTE.find((item) => item.kind === kind)!;
    const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
        id: `palette-${kind}`,
        data: { kind, source: "palette" },
    });

    return (
        <Box
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            sx={{
                borderRadius: "12px",
                border: `1px solid ${activeKind === kind ? token.accent : "rgb(219, 222, 230)"}`,
                background: isDragging ? "rgba(255,255,255,0.96)" : "rgba(235, 239, 246, 0)",
                p: 1,
                overflow: "hidden",
                cursor: "grab",
                opacity: isDragging ? 0.72 : 1,
                transform: CSS.Translate.toString(transform),
                boxShadow: activeKind === kind ? `0 12px 24px ${token.accent}12` : "none",
                transition: "border-color 180ms ease, transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease",
                willChange: "transform",
            }}
        >
            <Stack direction="row" spacing={1.25} alignItems="center">
                <NodeIcon kind={kind} />
                <Box minWidth={0}>
                    <Typography sx={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: "#111827",
                        letterSpacing: "-0.02em"
                    }}>
                        {token.label}
                    </Typography>
                    {/* <Typography sx={{ fontSize: "0.82rem", color: "#667085", lineHeight: 1.55 }}>
                        {token.description}
                    </Typography>*/}
                </Box>
            </Stack>
        </Box>
    );
}

export function NodePalette({ activeKind }: { activeKind: ProjectNodeKind | null }) {
    const searchQuery = useProjectEditorStore((state) => state.ui.searchQuery);
    const setSearchQuery = useProjectEditorStore((state) => state.setSearchQuery);

    const items = useMemo(() => {
        if (!searchQuery.trim()) {
            return NODE_PALETTE;
        }

        const query = searchQuery.toLowerCase();

        return NODE_PALETTE.filter((item) => {
            return item.label.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
        });
    }, [searchQuery]);

    return (
        <EditorPanel sx={{ height: "100%", p: 2.25 }} elevation={0}>
            <EditorSection sx={{ height: "100%" }}>
                <PanelHeader>
                    <EditorSectionTitle>Architecture library</EditorSectionTitle>
                </PanelHeader>

                <TextField
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search nodes"
                />

                <Stack spacing={1.15} sx={{ overflowY: "auto", pr: 0.5 }}>
                    {items.map((item) => (
                        <PaletteItem key={item.kind} kind={item.kind} activeKind={activeKind} />
                    ))}
                </Stack>
            </EditorSection>
        </EditorPanel>
    );
}
