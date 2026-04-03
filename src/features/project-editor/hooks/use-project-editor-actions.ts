"use client";

import { useMemo } from "react";

import { exportProjectJson } from "@/src/features/project-editor/utils/export-project-json";
import { useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

function downloadJsonFile(fileName: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();

    window.URL.revokeObjectURL(url);
}

export function useProjectEditorActions() {
    const project = useProjectEditorStore((state) => state.project);
    const addNode = useProjectEditorStore((state) => state.addNode);
    const addEdge = useProjectEditorStore((state) => state.addEdge);
    const deleteEdge = useProjectEditorStore((state) => state.deleteEdge);
    const updateNode = useProjectEditorStore((state) => state.updateNode);
    const moveNode = useProjectEditorStore((state) => state.moveNode);
    const deleteNode = useProjectEditorStore((state) => state.deleteNode);
    const deleteSelectedNode = useProjectEditorStore((state) => state.deleteSelectedNode);
    const selectNode = useProjectEditorStore((state) => state.selectNode);
    const setProjectName = useProjectEditorStore((state) => state.setProjectName);

    return useMemo(
        () => ({
            addNode,
            addEdge,
            deleteEdge,
            updateNode,
            moveNode,
            deleteNode,
            deleteSelectedNode,
            selectNode,
            setProjectName,
            createNode(kind: ProjectNodeKind, position: { x: number; y: number }) {
                return addNode(kind, position);
            },
            exportProject() {
                const payload = exportProjectJson(project);
                const safeName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

                downloadJsonFile(`${safeName || "project"}.json`, payload);

                return payload;
            },
        }),
        [addEdge, addNode, deleteEdge, deleteNode, deleteSelectedNode, moveNode, project, selectNode, setProjectName, updateNode],
    );
}
