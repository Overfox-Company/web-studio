"use client";

import { useMemo } from "react";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Box, Stack, Typography } from "@mui/material";

import { projectEditorStyles } from "@/src/customization/project-editor";
import {
    EditorPanel,
    EditorSection,
    EditorSectionTitle,
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
            sx={projectEditorStyles.nodePalette.item(token.accent, activeKind === kind, isDragging, CSS.Translate.toString(transform))}
        >
            <Stack direction="row" spacing={1.25} alignItems="center">
                <NodeIcon kind={kind} />
                <Box minWidth={0}>
                    <Typography sx={projectEditorStyles.nodePalette.itemTitle}>
                        {token.label}
                    </Typography>
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
        <EditorPanel sx={projectEditorStyles.nodePalette.panel} elevation={0}>
            <EditorSection sx={projectEditorStyles.nodePalette.section}>
                <PanelHeader>
                    <EditorSectionTitle>Architecture library</EditorSectionTitle>
                </PanelHeader>

                <TextField
                    //      style={projectEditorStyles.nodePalette.searchField}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search nodes"
                />

                <Stack spacing={1.15} sx={projectEditorStyles.nodePalette.list}>
                    {items.map((item) => (
                        <PaletteItem key={item.kind} kind={item.kind} activeKind={activeKind} />
                    ))}
                </Stack>
            </EditorSection>
        </EditorPanel>
    );
}
