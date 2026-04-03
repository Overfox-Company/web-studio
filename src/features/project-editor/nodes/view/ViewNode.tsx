"use client";

import { memo } from "react";

import type { NodeProps } from "@xyflow/react";

import { BaseNodeCard } from "@/src/features/project-editor/nodes/base/BaseNodeCard";
import type { ProjectFlowNode } from "@/src/features/project-editor/types/editor.types";

export const ViewNode = memo(function ViewNode({ data, selected, dragging }: NodeProps<ProjectFlowNode>) {
    const node = data.node;

    return (
        <BaseNodeCard
            node={node}
            selected={selected}
            dragging={dragging}
            preview={Boolean(data.isPreview)}
            meta={[
                { label: "route", value: node.kind === "view" ? node.data.route : "-" },
                { label: "render", value: node.kind === "view" ? node.data.renderMode : "-" },
            ]}
        />
    );
});
