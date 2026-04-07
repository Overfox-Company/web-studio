import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import type {
    DesignAlignmentGuide,
    DesignAlignmentLine,
    DesignAlignmentSnapLock,
    DesignAlignmentSnapLocks,
    DesignFrame,
} from "@/src/features/design-editor/types/interaction.types";
import { getNodeAbsoluteFrame, isContainerNode } from "@/src/features/design-editor/utils/design-tree";

const DEFAULT_TOLERANCE = 6;
const DEFAULT_RELEASE_TOLERANCE = 14;

interface ComputeAlignmentGuidesOptions {
    document: DesignDocumentSnapshot;
    draggedNodeId: string;
    containerId: string | null;
    previewAbsoluteFrame: DesignFrame;
    snapLocks?: Partial<DesignAlignmentSnapLocks>;
    tolerance?: number;
    releaseTolerance?: number;
}

interface AxisMatch {
    axis: "horizontal" | "vertical";
    distance: number;
    line: DesignAlignmentLine;
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

function getFrameLineValue(frame: DesignFrame, line: DesignAlignmentLine) {
    return getFrameLines(frame)[line];
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
            line: "left",
            guide: createVerticalGuide(`${label}-left`, referenceLines.left, Math.min(previewAbsoluteFrame.y, referenceFrame.y), Math.max(previewAbsoluteFrame.y + previewAbsoluteFrame.height, referenceFrame.y + referenceFrame.height), source),
        },
        {
            axis: "vertical",
            distance: Math.abs(previewLines.centerX - referenceLines.centerX),
            line: "centerX",
            guide: createVerticalGuide(`${label}-center-x`, referenceLines.centerX, Math.min(previewAbsoluteFrame.y, referenceFrame.y), Math.max(previewAbsoluteFrame.y + previewAbsoluteFrame.height, referenceFrame.y + referenceFrame.height), source),
        },
        {
            axis: "vertical",
            distance: Math.abs(previewLines.right - referenceLines.right),
            line: "right",
            guide: createVerticalGuide(`${label}-right`, referenceLines.right, Math.min(previewAbsoluteFrame.y, referenceFrame.y), Math.max(previewAbsoluteFrame.y + previewAbsoluteFrame.height, referenceFrame.y + referenceFrame.height), source),
        },
        {
            axis: "horizontal",
            distance: Math.abs(previewLines.top - referenceLines.top),
            line: "top",
            guide: createHorizontalGuide(`${label}-top`, referenceLines.top, Math.min(previewAbsoluteFrame.x, referenceFrame.x), Math.max(previewAbsoluteFrame.x + previewAbsoluteFrame.width, referenceFrame.x + referenceFrame.width), source),
        },
        {
            axis: "horizontal",
            distance: Math.abs(previewLines.centerY - referenceLines.centerY),
            line: "centerY",
            guide: createHorizontalGuide(`${label}-center-y`, referenceLines.centerY, Math.min(previewAbsoluteFrame.x, referenceFrame.x), Math.max(previewAbsoluteFrame.x + previewAbsoluteFrame.width, referenceFrame.x + referenceFrame.width), source),
        },
        {
            axis: "horizontal",
            distance: Math.abs(previewLines.bottom - referenceLines.bottom),
            line: "bottom",
            guide: createHorizontalGuide(`${label}-bottom`, referenceLines.bottom, Math.min(previewAbsoluteFrame.x, referenceFrame.x), Math.max(previewAbsoluteFrame.x + previewAbsoluteFrame.width, referenceFrame.x + referenceFrame.width), source),
        },
    ];
}

function applySnapLock(frame: DesignFrame, lock: DesignAlignmentSnapLock): DesignFrame {
    switch (lock.line) {
        case "left":
            return { ...frame, x: lock.position };
        case "centerX":
            return { ...frame, x: lock.position - frame.width / 2 };
        case "right":
            return { ...frame, x: lock.position - frame.width };
        case "top":
            return { ...frame, y: lock.position };
        case "centerY":
            return { ...frame, y: lock.position - frame.height / 2 };
        case "bottom":
            return { ...frame, y: lock.position - frame.height };
    }
}

function createSnapLock(match: AxisMatch): DesignAlignmentSnapLock {
    return {
        axis: match.axis,
        line: match.line,
        position: match.guide.position,
        guide: match.guide,
    };
}

export function computeAlignmentSnap({
    document,
    draggedNodeId,
    containerId,
    previewAbsoluteFrame,
    snapLocks,
    tolerance = DEFAULT_TOLERANCE,
    releaseTolerance = DEFAULT_RELEASE_TOLERANCE,
}: ComputeAlignmentGuidesOptions): {
    guides: DesignAlignmentGuide[];
    frame: DesignFrame;
    snapLocks: DesignAlignmentSnapLocks;
} {
    const nextSnapLocks: DesignAlignmentSnapLocks = {
        vertical: null,
        horizontal: null,
    };

    if (!containerId) {
        return {
            guides: [],
            frame: previewAbsoluteFrame,
            snapLocks: nextSnapLocks,
        };
    }

    const containerNode = document.nodes[containerId];

    if (!containerNode || !isContainerNode(containerNode)) {
        return {
            guides: [],
            frame: previewAbsoluteFrame,
            snapLocks: nextSnapLocks,
        };
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

    const guides: DesignAlignmentGuide[] = [];
    let frame = { ...previewAbsoluteFrame };

    const verticalLock = snapLocks?.vertical ?? null;

    if (verticalLock && Math.abs(getFrameLineValue(previewAbsoluteFrame, verticalLock.line) - verticalLock.position) <= releaseTolerance) {
        frame = applySnapLock(frame, verticalLock);
        nextSnapLocks.vertical = verticalLock;
        guides.push(verticalLock.guide);
    }

    const horizontalLock = snapLocks?.horizontal ?? null;

    if (horizontalLock && Math.abs(getFrameLineValue(previewAbsoluteFrame, horizontalLock.line) - horizontalLock.position) <= releaseTolerance) {
        frame = applySnapLock(frame, horizontalLock);
        nextSnapLocks.horizontal = horizontalLock;
        guides.push(horizontalLock.guide);
    }

    const matches = referenceFrames.flatMap(({ source, label, frame: referenceFrame }) => getReferenceMatches(source, label, frame, referenceFrame));

    if (!nextSnapLocks.vertical) {
        const bestVerticalMatch = matches
            .filter((match) => match.axis === "vertical" && match.distance <= tolerance)
            .sort((left, right) => left.distance - right.distance)[0];

        if (bestVerticalMatch) {
            frame = applySnapLock(frame, createSnapLock(bestVerticalMatch));
            nextSnapLocks.vertical = createSnapLock(bestVerticalMatch);
            guides.push(bestVerticalMatch.guide);
        }
    }

    if (!nextSnapLocks.horizontal) {
        const bestHorizontalMatch = matches
            .filter((match) => match.axis === "horizontal" && match.distance <= tolerance)
            .sort((left, right) => left.distance - right.distance)[0];

        if (bestHorizontalMatch) {
            frame = applySnapLock(frame, createSnapLock(bestHorizontalMatch));
            nextSnapLocks.horizontal = createSnapLock(bestHorizontalMatch);
            guides.push(bestHorizontalMatch.guide);
        }
    }

    return {
        guides,
        frame,
        snapLocks: nextSnapLocks,
    };
}

export function computeAlignmentGuides({
    document,
    draggedNodeId,
    containerId,
    previewAbsoluteFrame,
    tolerance = DEFAULT_TOLERANCE,
}: ComputeAlignmentGuidesOptions): DesignAlignmentGuide[] {
    return computeAlignmentSnap({
        document,
        draggedNodeId,
        containerId,
        previewAbsoluteFrame,
        tolerance,
    }).guides;
}