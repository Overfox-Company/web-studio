import type { XYPosition } from "@xyflow/react";

export function mapDropPosition(position: XYPosition): XYPosition {
    return {
        x: Math.round(position.x / 8) * 8,
        y: Math.round(position.y / 8) * 8,
    };
}
