import type {
    DesignAutoLayout,
    DesignDocumentSnapshot,
    DesignImageStyle,
    DesignNode,
    DesignNodeAxisSizing,
    DesignNodeSizing,
    DesignNodeStyle,
    DesignPadding,
    DesignShadow,
    DesignTypography,
} from "@/src/features/design-editor/types/design.types";
import type { DesignFrame } from "@/src/features/design-editor/types/interaction.types";

export interface InsertNodeOptions {
    index?: number | null;
}

export interface InsertSubtreePayload {
    nodes: Record<string, DesignNode>;
    rootNodeIds: string[];
    targetParentId: string;
    insertIndex?: number | null;
}

export interface ReparentNodesPayload {
    nodeIds: string[];
    nextParentId: string;
    absoluteFramesByNodeId?: Record<string, DesignFrame>;
    insertIndex?: number | null;
}

export type DesignNodePatch = Partial<{
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    visible: boolean;
    locked: boolean;
    text: string;
    src: string;
    clipContent: boolean;
    layoutMode: "absolute" | "auto";
}> & {
    sizing?: Partial<{
        width: Partial<DesignNodeAxisSizing>;
        height: Partial<DesignNodeAxisSizing>;
    }>;
    style?: Partial<Omit<DesignNodeStyle, "image" | "shadow" | "typography">> & {
        typography?: Partial<DesignTypography>;
        image?: Partial<DesignImageStyle>;
        shadow?: Partial<DesignShadow> | null;
    };
    padding?: Partial<DesignPadding>;
    autoLayout?: Partial<Omit<DesignAutoLayout, "padding">> & {
        padding?: Partial<DesignPadding>;
    };
};

export interface DesignDocumentStore {
    document: DesignDocumentSnapshot | null;
    hydrateDocument: (document: DesignDocumentSnapshot) => void;
    clearDocument: () => void;
    patchNode: (nodeId: string, patch: DesignNodePatch) => void;
    insertNode: (node: DesignNode, options?: InsertNodeOptions) => void;
    insertSubtree: (payload: InsertSubtreePayload) => void;
    removeNode: (nodeId: string) => void;
    commitNodeFrame: (nodeId: string, frame: DesignFrame) => void;
    reparentNodes: (payload: ReparentNodesPayload) => void;
    groupNodes: (nodeIds: string[]) => string | null;
    undo: () => void;
}

export interface DesignDocumentStoreState extends DesignDocumentStore {
    pastDocuments: DesignDocumentSnapshot[];
    futureDocuments: DesignDocumentSnapshot[];
}