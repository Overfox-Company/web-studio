import { create } from "zustand";

import type {
    DesignAlignmentGuide,
    DesignCandidateInsertionMode,
    DesignInteractionSession,
    DesignTool,
    DesignViewport,
} from "@/src/features/design-editor/types/interaction.types";

interface DesignInteractionStore {
    selectedNodeId: string | null;
    selectedNodeIds: string[];
    hoveredNodeId: string | null;
    activeTool: DesignTool;
    viewport: DesignViewport;
    activeSession: DesignInteractionSession | null;
    inlineTextNodeId: string | null;
    isSpacePressed: boolean;
    collapsedLayerIds: string[];
    candidateParentId: string | null;
    candidateInsertionIndex: number | null;
    candidateInsertionMode: DesignCandidateInsertionMode | null;
    activeContainerId: string | null;
    alignmentGuides: DesignAlignmentGuide[];
    selectNode: (nodeId: string | null, options?: { additive?: boolean }) => void;
    setSelectedNodeIds: (nodeIds: string[], primaryNodeId?: string | null) => void;
    clearSelection: () => void;
    hoverNode: (nodeId: string | null) => void;
    setActiveTool: (tool: DesignTool) => void;
    setViewport: (viewport: DesignViewport) => void;
    setActiveSession: (session: DesignInteractionSession | null) => void;
    setInlineTextNodeId: (nodeId: string | null) => void;
    setSpacePressed: (isPressed: boolean) => void;
    setDragFeedback: (feedback: {
        candidateParentId?: string | null;
        candidateInsertionIndex?: number | null;
        candidateInsertionMode?: DesignCandidateInsertionMode | null;
        activeContainerId?: string | null;
        alignmentGuides?: DesignAlignmentGuide[];
    }) => void;
    clearDragFeedback: () => void;
    toggleLayerCollapsed: (nodeId: string) => void;
    expandLayer: (nodeId: string) => void;
    resetForDocument: () => void;
}

const DEFAULT_VIEWPORT: DesignViewport = {
    x: 120,
    y: 96,
    zoom: 0.9,
};

export const useDesignInteractionStore = create<DesignInteractionStore>((set) => ({
    selectedNodeId: null,
    selectedNodeIds: [],
    hoveredNodeId: null,
    activeTool: "select",
    viewport: DEFAULT_VIEWPORT,
    activeSession: null,
    inlineTextNodeId: null,
    isSpacePressed: false,
    collapsedLayerIds: [],
    candidateParentId: null,
    candidateInsertionIndex: null,
    candidateInsertionMode: null,
    activeContainerId: null,
    alignmentGuides: [],

    selectNode: (nodeId, options) => {
        set((state) => {
            if (!nodeId) {
                if (!state.selectedNodeId && state.selectedNodeIds.length === 0) {
                    return state;
                }

                return {
                    selectedNodeId: null,
                    selectedNodeIds: [],
                };
            }

            if (options?.additive) {
                const isAlreadySelected = state.selectedNodeIds.includes(nodeId);
                const nextSelectedNodeIds = isAlreadySelected
                    ? state.selectedNodeIds.filter((selectedId) => selectedId !== nodeId)
                    : [...state.selectedNodeIds, nodeId];
                const nextPrimaryNodeId = isAlreadySelected
                    ? state.selectedNodeId === nodeId
                        ? nextSelectedNodeIds.at(-1) ?? null
                        : state.selectedNodeId
                    : nodeId;

                return {
                    selectedNodeId: nextPrimaryNodeId,
                    selectedNodeIds: nextSelectedNodeIds,
                };
            }

            if (state.selectedNodeId === nodeId && state.selectedNodeIds.length === 1) {
                return state;
            }

            return {
                selectedNodeId: nodeId,
                selectedNodeIds: [nodeId],
            };
        });
    },

    setSelectedNodeIds: (nodeIds, primaryNodeId) => {
        set((state) => {
            const normalizedNodeIds = Array.from(new Set(nodeIds));
            const nextPrimaryNodeId = primaryNodeId && normalizedNodeIds.includes(primaryNodeId)
                ? primaryNodeId
                : normalizedNodeIds.at(-1) ?? null;

            if (
                state.selectedNodeId === nextPrimaryNodeId &&
                state.selectedNodeIds.length === normalizedNodeIds.length &&
                state.selectedNodeIds.every((nodeId, index) => nodeId === normalizedNodeIds[index])
            ) {
                return state;
            }

            return {
                selectedNodeId: nextPrimaryNodeId,
                selectedNodeIds: normalizedNodeIds,
            };
        });
    },

    clearSelection: () => {
        set((state) => {
            if (!state.selectedNodeId && state.selectedNodeIds.length === 0) {
                return state;
            }

            return {
                selectedNodeId: null,
                selectedNodeIds: [],
            };
        });
    },

    hoverNode: (nodeId) => {
        set((state) => {
            if (state.hoveredNodeId === nodeId) {
                return state;
            }

            return {
                hoveredNodeId: nodeId,
            };
        });
    },

    setActiveTool: (tool) => {
        set({ activeTool: tool });
    },

    setViewport: (viewport) => {
        set({ viewport });
    },

    setActiveSession: (session) => {
        set({ activeSession: session });
    },

    setInlineTextNodeId: (nodeId) => {
        set({ inlineTextNodeId: nodeId });
    },

    setSpacePressed: (isPressed) => {
        set({ isSpacePressed: isPressed });
    },

    setDragFeedback: (feedback) => {
        set((state) => ({
            candidateParentId: feedback.candidateParentId !== undefined ? feedback.candidateParentId : state.candidateParentId,
            candidateInsertionIndex:
                feedback.candidateInsertionIndex !== undefined ? feedback.candidateInsertionIndex : state.candidateInsertionIndex,
            candidateInsertionMode:
                feedback.candidateInsertionMode !== undefined ? feedback.candidateInsertionMode : state.candidateInsertionMode,
            activeContainerId: feedback.activeContainerId !== undefined ? feedback.activeContainerId : state.activeContainerId,
            alignmentGuides: feedback.alignmentGuides !== undefined ? feedback.alignmentGuides : state.alignmentGuides,
        }));
    },

    clearDragFeedback: () => {
        set((state) => {
            if (
                !state.candidateParentId &&
                state.candidateInsertionIndex == null &&
                !state.candidateInsertionMode &&
                !state.activeContainerId &&
                state.alignmentGuides.length === 0
            ) {
                return state;
            }

            return {
                candidateParentId: null,
                candidateInsertionIndex: null,
                candidateInsertionMode: null,
                activeContainerId: null,
                alignmentGuides: [],
            };
        });
    },

    toggleLayerCollapsed: (nodeId) => {
        set((state) => ({
            collapsedLayerIds: state.collapsedLayerIds.includes(nodeId)
                ? state.collapsedLayerIds.filter((id) => id !== nodeId)
                : [...state.collapsedLayerIds, nodeId],
        }));
    },

    expandLayer: (nodeId) => {
        set((state) => {
            if (!state.collapsedLayerIds.includes(nodeId)) {
                return state;
            }

            return {
                collapsedLayerIds: state.collapsedLayerIds.filter((id) => id !== nodeId),
            };
        });
    },

    resetForDocument: () => {
        set({
            selectedNodeId: null,
            selectedNodeIds: [],
            hoveredNodeId: null,
            activeTool: "select",
            viewport: DEFAULT_VIEWPORT,
            activeSession: null,
            inlineTextNodeId: null,
            isSpacePressed: false,
            collapsedLayerIds: [],
            candidateParentId: null,
            candidateInsertionIndex: null,
            candidateInsertionMode: null,
            activeContainerId: null,
            alignmentGuides: [],
        });
    },
}));