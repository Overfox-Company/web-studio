import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import type { DesignAlignmentGuide, DesignFrame } from "@/src/features/design-editor/types/interaction.types";
import { getNodeAbsoluteFrame, isContainerNode } from "@/src/features/design-editor/utils/design-tree";

const DEFAULT_TOLERANCE = 6;

interface ComputeAlignmentGuidesOptions {
    document: DesignDocumentSnapshot;
    draggedNodeId: string;
    containerId: string | null;
    previewAbsoluteFrame: DesignFrame;
    tolerance?: number;
}

interface AxisMatch {
    axis: "horizontal" | "vertical";
    distance: number;
    guide: DesignAlignmentGuide;
}

function getFrameLines(frame: DesignFrame) {
    return {
        left: frame.x,
        centerX: frame.x + frame.width / 2,
        right: frame.x + frame.width,
        top: frame.y,
        centerY: frame.y + frame.height / 2,
        bottom: frame.y + frame.height,
    };
}

function createVerticalGuide(id: string, position: number, start: number, end: number, source: DesignAlignmentGuide["source"]): DesignAlignmentGuide {
    return {
        id,
        axis: "vertical",
        position,
        start,
        end,
        source,
    };
}

function createHorizontalGuide(id: string, position: number, start: number, end: number, source: DesignAlignmentGuide["source"]): DesignAlignmentGuide {
    return {
        id,
        axis: "horizontal",
        position,
        start,
        end,
        source,
    };
}

function getReferenceMatches(
    source: DesignAlignmentGuide["source"],
    label: string,
    previewAbsoluteFrame: DesignFrame,
    referenceFrame: DesignFrame,
): AxisMatch[] {
    const previewLines = getFrameLines(previewAbsoluteFrame);
    const referenceLines = getFrameLines(referenceFrame);

    return [
        {
            axis: "vertical",
            distance: Math.abs(previewLines.left - referenceLines.left),
            guide: createVerticalGuide(`${label}-left`, referenceLines.left, Math.min(previewAbsoluteFrame.y, referenceFrame.y), Math.max(previewAbsoluteFrame.y + previewAbsoluteFrame.height, referenceFrame.y + referenceFrame.height), source),
        },
        {
            axis: "vertical",
            distance: Math.abs(previewLines.centerX - referenceLines.centerX),
            guide: createVerticalGuide(`${label}-center-x`, referenceLines.centerX, Math.min(previewAbsoluteFrame.y, referenceFrame.y), Math.max(previewAbsoluteFrame.y + previewAbsoluteFrame.height, referenceFrame.y + referenceFrame.height), source),
        },
        {
            axis: "vertical",
            distance: Math.abs(previewLines.right - referenceLines.right),
            guide: createVerticalGuide(`${label}-right`, referenceLines.right, Math.min(previewAbsoluteFrame.y, referenceFrame.y), Math.max(previewAbsoluteFrame.y + previewAbsoluteFrame.height, referenceFrame.y + referenceFrame.height), source),
        },
        {
            axis: "horizontal",
            distance: Math.abs(previewLines.top - referenceLines.top),
            guide: createHorizontalGuide(`${label}-top`, referenceLines.top, Math.min(previewAbsoluteFrame.x, referenceFrame.x), Math.max(previewAbsoluteFrame.x + previewAbsoluteFrame.width, referenceFrame.x + referenceFrame.width), source),
        },
        {
            axis: "horizontal",
            distance: Math.abs(previewLines.centerY - referenceLines.centerY),
            guide: createHorizontalGuide(`${label}-center-y`, referenceLines.centerY, Math.min(previewAbsoluteFrame.x, referenceFrame.x), Math.max(previewAbsoluteFrame.x + previewAbsoluteFrame.width, referenceFrame.x + referenceFrame.width), source),
        },
        {
            axis: "horizontal",
            distance: Math.abs(previewLines.bottom - referenceLines.bottom),
            guide: createHorizontalGuide(`${label}-bottom`, referenceLines.bottom, Math.min(previewAbsoluteFrame.x, referenceFrame.x), Math.max(previewAbsoluteFrame.x + previewAbsoluteFrame.width, referenceFrame.x + referenceFrame.width), source),
        },
    ];
}

export function computeAlignmentGuides({
    document,
    draggedNodeId,
    containerId,
    previewAbsoluteFrame,
    tolerance = DEFAULT_TOLERANCE,
}: ComputeAlignmentGuidesOptions): DesignAlignmentGuide[] {
    if (!containerId) {
        return [];
    }

    const containerNode = document.nodes[containerId];

    if (!containerNode || !isContainerNode(containerNode)) {
        return [];
    }

    const referenceFrames = [
        {
            source: "container" as const,
            label: containerNode.id,
            frame: getNodeAbsoluteFrame(document, containerNode.id),
        },
        ...containerNode.children
            .filter((childId) => childId !== draggedNodeId && document.nodes[childId]?.visible)
            .map((childId) => ({
                source: "sibling" as const,
                label: childId,
                frame: getNodeAbsoluteFrame(document, childId),
            })),
    ];

    const matches = referenceFrames.flatMap(({ source, label, frame }) => getReferenceMatches(source, label, previewAbsoluteFrame, frame));
    const bestVerticalMatch = matches
        .filter((match) => match.axis === "vertical" && match.distance <= tolerance)
        .sort((left, right) => left.distance - right.distance)[0];
    const bestHorizontalMatch = matches
        .filter((match) => match.axis === "horizontal" && match.distance <= tolerance)
        .sort((left, right) => left.distance - right.distance)[0];

    return [bestVerticalMatch?.guide, bestHorizontalMatch?.guide].filter((guide): guide is DesignAlignmentGuide => Boolean(guide));
}