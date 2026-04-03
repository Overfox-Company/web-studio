"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";
import { memo } from "react";

import type { NodeProps } from "@xyflow/react";

import { BaseNodeCard } from "@/src/features/project-editor/nodes/base/BaseNodeCard";
import { useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";
import type { ProjectFlowNode } from "@/src/features/project-editor/types/editor.types";

export const ViewNode = memo(function ViewNode({ data, selected, dragging }: NodeProps<ProjectFlowNode>) {
    const router = useRouter();
    const node = data.node;
    const projectId = useProjectEditorStore((state) => state.project.projectId);

    const handleOpenDesignEditor = useCallback(() => {
        router.push(`/projects/${projectId}/editor/view/${node.id}`);
    }, [node.id, projectId, router]);

    return (
        <BaseNodeCard
            node={node}
            selected={selected}
            dragging={dragging}
            preview={Boolean(data.isPreview)}
            onDoubleClick={handleOpenDesignEditor}
            meta={[
                { label: "route", value: node.kind === "view" ? node.data.route : "-" },
                { label: "render", value: node.kind === "view" ? node.data.renderMode : "-" },
            ]}
        />
    );
});
