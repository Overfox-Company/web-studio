import type { DesignFrame } from "@/src/features/design-editor/types/interaction.types";
import type { PageViewportMode } from "@/src/features/project-editor/types/editor.types";

export const PAGE_VIEWPORT_WIDTHS: Record<PageViewportMode, number> = {
    desktop: 1440,
    mobile: 390,
};

// In this phase, the Desktop/Mobile selector only changes the visual width of the
// root page layout. It does not implement real responsiveness, breakpoints,
// device-specific styles, or document variants.
export function createRootViewportFrameOverride(frame: DesignFrame, viewportMode: PageViewportMode): DesignFrame {
    return {
        ...frame,
        width: PAGE_VIEWPORT_WIDTHS[viewportMode],
    };
}