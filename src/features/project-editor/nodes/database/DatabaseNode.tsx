"use client";

import { memo } from "react";

import type { NodeProps } from "@xyflow/react";

import { BaseNodeCard } from "@/src/features/project-editor/nodes/base/BaseNodeCard";
import type { ProjectFlowNode } from "@/src/features/project-editor/types/editor.types";

export const DatabaseNode = memo(function DatabaseNode({ data, selected, dragging }: NodeProps<ProjectFlowNode>) {
    const node = data.node;

    return (
        <BaseNodeCard
            node={node}
            selected={selected}
            dragging={dragging}
            preview={Boolean(data.isPreview)}
            meta={[
                { label: "provider", value: node.kind === "database" ? node.data.provider : "-" },
                { label: "entity", value: node.kind === "database" ? node.data.entityName : "-" },
            ]}
        />
    );
});
