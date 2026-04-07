import { nanoid } from "nanoid";

import { designEditorDefaults } from "@/src/customization/design-editor";
import { designDocumentSchema } from "@/src/features/design-editor/schema/design.schema";
import type {
    DesignDocumentSnapshot,
    DesignFrameNode,
    DesignNode,
    DesignNodeStyle,
    DesignRectangleNode,
    DesignTextNode,
    DesignTypography,
} from "@/src/features/design-editor/types/design.types";
import type {
    BaseComponentType,
    ComponentLibrary,
    ComponentLibrarySnapshot,
    LibraryComponent,
} from "@/src/features/component-library/types/component.types";

type NodeStyleOverrides = Partial<Omit<DesignNodeStyle, "typography">> & {
    typography?: Partial<DesignTypography>;
};

function createDefaultSizing() {
    return {
        width: {
            mode: "fixed" as const,
            min: null,
            max: null,
        },
        height: {
            mode: "fixed" as const,
            min: null,
            max: null,
        },
    };
}

export const BASE_COMPONENT_LIBRARY_ITEMS: Array<{
    type: BaseComponentType;
    label: string;
    description: string;
    accent: string;
}> = [
        { type: "button", label: "Button", description: "CTA button template", accent: "#3b82f6" },
        { type: "input", label: "Input", description: "Single-line field", accent: "#22c55e" },
        { type: "checkbox", label: "Checkbox", description: "Selection control", accent: "#f59e0b" },
        { type: "textarea", label: "Textarea", description: "Multi-line field", accent: "#8b5cf6" },
        { type: "label", label: "Label", description: "Form helper text", accent: "#14b8a6" },
        { type: "select", label: "Select", description: "Basic dropdown shell", accent: "#0ea5e9" },
        { type: "card", label: "Card", description: "Content container", accent: "#f97316" },
        { type: "badge", label: "Badge", description: "Small status pill", accent: "#ec4899" },
        { type: "switch", label: "Switch", description: "Toggle control", accent: "#10b981" },
        { type: "radio", label: "Radio", description: "Single choice control", accent: "#eab308" },
    ];

function now() {
    return new Date().toISOString();
}

export function createEmptyComponentLibrarySnapshot(projectId: string): ComponentLibrarySnapshot {
    return {
        projectId,
        librariesById: {},
        componentsById: {},
        version: 1,
        updatedAt: now(),
    };
}

export function createComponentLibrary(name = "UI Library"): ComponentLibrary {
    const timestamp = now();

    return {
        id: nanoid(),
        name,
        description: "Reusable user components for this project.",
        componentIds: [],
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

function findBaseComponentMeta(baseType: BaseComponentType) {
    return BASE_COMPONENT_LIBRARY_ITEMS.find((item) => item.type === baseType) ?? BASE_COMPONENT_LIBRARY_ITEMS[0];
}

function createStyle(overrides: NodeStyleOverrides = {}): DesignNodeStyle {
    const { typography, ...rest } = overrides;

    return {
        fill: "transparent",
        stroke: null,
        strokeWidth: 0,
        borderRadius: 0,
        opacity: 1,
        shadow: null,
        ...rest,
        ...(typography
            ? {
                typography: {
                    ...designEditorDefaults.typography,
                    ...typography,
                },
            }
            : {}),
    };
}

function createFrameNode(params: {
    id: string;
    name: string;
    parentId: string | null;
    children?: string[];
    x: number;
    y: number;
    width: number;
    height: number;
    layoutMode?: "absolute" | "auto";
    clipContent?: boolean;
    style?: NodeStyleOverrides;
    autoLayout?: Partial<DesignFrameNode["autoLayout"]>;
}): DesignFrameNode {
    return {
        id: params.id,
        type: "frame",
        name: params.name,
        parentId: params.parentId,
        children: params.children ?? [],
        x: params.x,
        y: params.y,
        width: params.width,
        height: params.height,
        sizing: createDefaultSizing(),
        rotation: 0,
        visible: true,
        locked: false,
        clipContent: params.clipContent ?? false,
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
        layoutMode: params.layoutMode ?? "absolute",
        autoLayout: {
            direction: params.autoLayout?.direction ?? "vertical",
            justifyContent: params.autoLayout?.justifyContent ?? "start",
            alignItems: params.autoLayout?.alignItems ?? "start",
            gap: params.autoLayout?.gap ?? 0,
            padding: {
                top: params.autoLayout?.padding?.top ?? 0,
                right: params.autoLayout?.padding?.right ?? 0,
                bottom: params.autoLayout?.padding?.bottom ?? 0,
                left: params.autoLayout?.padding?.left ?? 0,
            },
        },
        style: createStyle(params.style),
    };
}

function createTextNode(params: {
    id: string;
    name: string;
    parentId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    style?: NodeStyleOverrides;
}): DesignTextNode {
    return {
        id: params.id,
        type: "text",
        name: params.name,
        parentId: params.parentId,
        children: [],
        x: params.x,
        y: params.y,
        width: params.width,
        height: params.height,
        sizing: createDefaultSizing(),
        rotation: 0,
        visible: true,
        locked: false,
        text: params.text,
        style: createStyle(params.style),
    };
}

function createRectangleNode(params: {
    id: string;
    name: string;
    parentId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    style?: NodeStyleOverrides;
}): DesignRectangleNode {
    return {
        id: params.id,
        type: "rectangle",
        name: params.name,
        parentId: params.parentId,
        children: [],
        x: params.x,
        y: params.y,
        width: params.width,
        height: params.height,
        sizing: createDefaultSizing(),
        rotation: 0,
        visible: true,
        locked: false,
        style: createStyle(params.style),
    };
}

function createWorkspaceDocument(componentId: string, componentName: string, baseType: BaseComponentType): DesignDocumentSnapshot {
    const rootId = `${componentId}-workspace`;
    const contentRootId = `${componentId}-base`;
    const nodes: Record<string, DesignNode> = {};

    nodes[rootId] = createFrameNode({
        id: rootId,
        name: `${componentName} Workspace`,
        parentId: null,
        children: [contentRootId],
        x: 0,
        y: 0,
        width: 720,
        height: 420,
        clipContent: false,
        style: {
            fill: "rgba(15, 23, 42, 0.4)",
            stroke: "rgba(148, 163, 184, 0.2)",
            strokeWidth: 1,
            borderRadius: 28,
            shadow: null,
        },
    });

    if (baseType === "button") {
        const labelId = `${componentId}-button-label`;

        nodes[contentRootId] = createFrameNode({
            id: contentRootId,
            name: "Button Base",
            parentId: rootId,
            children: [labelId],
            x: 180,
            y: 164,
            width: 220,
            height: 56,
            layoutMode: "auto",
            clipContent: false,
            autoLayout: {
                direction: "horizontal",
                justifyContent: "center",
                alignItems: "center",
                padding: { top: 16, right: 28, bottom: 16, left: 28 },
            },
            style: {
                fill: "#2563eb",
                stroke: null,
                borderRadius: 999,
                shadow: designEditorDefaults.shadows.frame,
            },
        });
        nodes[labelId] = createTextNode({
            id: labelId,
            name: "Button Text",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 164,
            height: 24,
            text: "Button",
            style: { typography: { color: "#ffffff", fontWeight: 600, textAlign: "center" } },
        });
    }

    if (baseType === "input") {
        const placeholderId = `${componentId}-input-placeholder`;

        nodes[contentRootId] = createFrameNode({
            id: contentRootId,
            name: "Input Base",
            parentId: rootId,
            children: [placeholderId],
            x: 140,
            y: 150,
            width: 360,
            height: 56,
            layoutMode: "auto",
            clipContent: false,
            autoLayout: {
                direction: "horizontal",
                justifyContent: "start",
                alignItems: "center",
                padding: { top: 16, right: 18, bottom: 16, left: 18 },
            },
            style: {
                fill: "rgba(15, 23, 42, 0.86)",
                stroke: "rgba(148, 163, 184, 0.28)",
                strokeWidth: 1,
                borderRadius: 16,
            },
        });
        nodes[placeholderId] = createTextNode({
            id: placeholderId,
            name: "Placeholder",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 320,
            height: 22,
            text: "Placeholder text",
            style: { typography: { color: "rgba(226, 232, 240, 0.72)" } },
        });
    }

    if (baseType === "checkbox") {
        const boxId = `${componentId}-checkbox-box`;
        const labelId = `${componentId}-checkbox-label`;

        nodes[contentRootId] = createFrameNode({
            id: contentRootId,
            name: "Checkbox Base",
            parentId: rootId,
            children: [boxId, labelId],
            x: 150,
            y: 168,
            width: 240,
            height: 28,
            layoutMode: "auto",
            autoLayout: {
                direction: "horizontal",
                justifyContent: "start",
                alignItems: "center",
                gap: 14,
            },
            style: { fill: "transparent" },
        });
        nodes[boxId] = createRectangleNode({
            id: boxId,
            name: "Checkbox Box",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 22,
            height: 22,
            style: { fill: "#2563eb", stroke: "#93c5fd", strokeWidth: 1, borderRadius: 7 },
        });
        nodes[labelId] = createTextNode({
            id: labelId,
            name: "Checkbox Label",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 180,
            height: 22,
            text: "Checkbox label",
            style: { typography: { color: "#e2e8f0" } },
        });
    }

    if (baseType === "textarea") {
        const placeholderId = `${componentId}-textarea-placeholder`;

        nodes[contentRootId] = createFrameNode({
            id: contentRootId,
            name: "Textarea Base",
            parentId: rootId,
            children: [placeholderId],
            x: 120,
            y: 118,
            width: 380,
            height: 168,
            layoutMode: "auto",
            autoLayout: {
                direction: "vertical",
                justifyContent: "start",
                alignItems: "start",
                padding: { top: 18, right: 18, bottom: 18, left: 18 },
            },
            style: {
                fill: "rgba(15, 23, 42, 0.86)",
                stroke: "rgba(148, 163, 184, 0.28)",
                strokeWidth: 1,
                borderRadius: 18,
            },
        });
        nodes[placeholderId] = createTextNode({
            id: placeholderId,
            name: "Textarea Placeholder",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 320,
            height: 72,
            text: "Placeholder\nMore content...",
            style: { typography: { color: "rgba(226, 232, 240, 0.72)" } },
        });
    }

    if (baseType === "label") {
        nodes[contentRootId] = createTextNode({
            id: contentRootId,
            name: "Label Base",
            parentId: rootId,
            x: 180,
            y: 184,
            width: 260,
            height: 24,
            text: "Field label",
            style: { typography: { color: "#e2e8f0", fontWeight: 600, fontSize: 15 } },
        });
    }

    if (baseType === "select") {
        const labelId = `${componentId}-select-label`;
        const arrowId = `${componentId}-select-arrow`;

        nodes[contentRootId] = createFrameNode({
            id: contentRootId,
            name: "Select Base",
            parentId: rootId,
            children: [labelId, arrowId],
            x: 132,
            y: 150,
            width: 340,
            height: 56,
            layoutMode: "auto",
            autoLayout: {
                direction: "horizontal",
                justifyContent: "space-between",
                alignItems: "center",
                padding: { top: 16, right: 18, bottom: 16, left: 18 },
            },
            style: {
                fill: "rgba(15, 23, 42, 0.86)",
                stroke: "rgba(148, 163, 184, 0.28)",
                strokeWidth: 1,
                borderRadius: 16,
            },
        });
        nodes[labelId] = createTextNode({
            id: labelId,
            name: "Select Label",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 240,
            height: 22,
            text: "Choose an option",
            style: { typography: { color: "#e2e8f0" } },
        });
        nodes[arrowId] = createTextNode({
            id: arrowId,
            name: "Select Arrow",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 18,
            height: 22,
            text: "v",
            style: { typography: { color: "#94a3b8", textAlign: "center", fontWeight: 700 } },
        });
    }

    if (baseType === "card") {
        const titleId = `${componentId}-card-title`;
        const bodyId = `${componentId}-card-body`;

        nodes[contentRootId] = createFrameNode({
            id: contentRootId,
            name: "Card Base",
            parentId: rootId,
            children: [titleId, bodyId],
            x: 130,
            y: 96,
            width: 360,
            height: 220,
            layoutMode: "auto",
            clipContent: false,
            autoLayout: {
                direction: "vertical",
                justifyContent: "start",
                alignItems: "start",
                gap: 12,
                padding: { top: 22, right: 22, bottom: 22, left: 22 },
            },
            style: {
                fill: "rgba(255, 255, 255, 0.96)",
                stroke: "rgba(148, 163, 184, 0.22)",
                strokeWidth: 1,
                borderRadius: 24,
                shadow: designEditorDefaults.shadows.frame,
            },
        });
        nodes[titleId] = createTextNode({
            id: titleId,
            name: "Card Title",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 280,
            height: 28,
            text: "Card title",
            style: { typography: { color: "#0f172a", fontWeight: 700, fontSize: 20 } },
        });
        nodes[bodyId] = createTextNode({
            id: bodyId,
            name: "Card Body",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 300,
            height: 72,
            text: "Short supporting description for this reusable component.",
            style: { typography: { color: "#475569", fontSize: 15 } },
        });
    }

    if (baseType === "badge") {
        const labelId = `${componentId}-badge-label`;

        nodes[contentRootId] = createFrameNode({
            id: contentRootId,
            name: "Badge Base",
            parentId: rootId,
            children: [labelId],
            x: 230,
            y: 176,
            width: 150,
            height: 36,
            layoutMode: "auto",
            autoLayout: {
                direction: "horizontal",
                justifyContent: "center",
                alignItems: "center",
                padding: { top: 8, right: 16, bottom: 8, left: 16 },
            },
            style: {
                fill: "rgba(16, 185, 129, 0.18)",
                stroke: "rgba(16, 185, 129, 0.36)",
                strokeWidth: 1,
                borderRadius: 999,
            },
        });
        nodes[labelId] = createTextNode({
            id: labelId,
            name: "Badge Label",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 110,
            height: 18,
            text: "Badge",
            style: { typography: { color: "#6ee7b7", fontWeight: 700, textAlign: "center", fontSize: 13 } },
        });
    }

    if (baseType === "switch") {
        const trackId = `${componentId}-switch-track`;
        const knobId = `${componentId}-switch-knob`;
        const labelId = `${componentId}-switch-label`;

        nodes[contentRootId] = createFrameNode({
            id: contentRootId,
            name: "Switch Base",
            parentId: rootId,
            children: [trackId, labelId],
            x: 150,
            y: 164,
            width: 240,
            height: 32,
            layoutMode: "auto",
            autoLayout: {
                direction: "horizontal",
                justifyContent: "start",
                alignItems: "center",
                gap: 14,
            },
            style: { fill: "transparent" },
        });
        nodes[trackId] = createFrameNode({
            id: trackId,
            name: "Switch Track",
            parentId: contentRootId,
            children: [knobId],
            x: 0,
            y: 0,
            width: 56,
            height: 32,
            clipContent: false,
            style: { fill: "#10b981", borderRadius: 999 },
        });
        nodes[knobId] = createFrameNode({
            id: knobId,
            name: "Switch Knob",
            parentId: trackId,
            x: 28,
            y: 4,
            width: 24,
            height: 24,
            clipContent: false,
            style: { fill: "#ffffff", borderRadius: 999, shadow: designEditorDefaults.shadows.mergeFallback },
        });
        nodes[labelId] = createTextNode({
            id: labelId,
            name: "Switch Label",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 140,
            height: 22,
            text: "Enable option",
            style: { typography: { color: "#e2e8f0" } },
        });
    }

    if (baseType === "radio") {
        const ringId = `${componentId}-radio-ring`;
        const dotId = `${componentId}-radio-dot`;
        const labelId = `${componentId}-radio-label`;

        nodes[contentRootId] = createFrameNode({
            id: contentRootId,
            name: "Radio Base",
            parentId: rootId,
            children: [ringId, labelId],
            x: 150,
            y: 168,
            width: 220,
            height: 24,
            layoutMode: "auto",
            autoLayout: {
                direction: "horizontal",
                justifyContent: "start",
                alignItems: "center",
                gap: 12,
            },
            style: { fill: "transparent" },
        });
        nodes[ringId] = createFrameNode({
            id: ringId,
            name: "Radio Ring",
            parentId: contentRootId,
            children: [dotId],
            x: 0,
            y: 0,
            width: 22,
            height: 22,
            clipContent: false,
            style: { fill: "transparent", stroke: "#93c5fd", strokeWidth: 2, borderRadius: 999 },
        });
        nodes[dotId] = createFrameNode({
            id: dotId,
            name: "Radio Dot",
            parentId: ringId,
            x: 5,
            y: 5,
            width: 10,
            height: 10,
            clipContent: false,
            style: { fill: "#2563eb", borderRadius: 999 },
        });
        nodes[labelId] = createTextNode({
            id: labelId,
            name: "Radio Label",
            parentId: contentRootId,
            x: 0,
            y: 0,
            width: 160,
            height: 22,
            text: "Radio option",
            style: { typography: { color: "#e2e8f0" } },
        });
    }

    return designDocumentSchema.parse({
        id: `library-component-${componentId}`,
        viewNodeId: componentId,
        name: componentName,
        rootNodeId: rootId,
        nodes,
        version: 1,
        updatedAt: now(),
    });
}

export function createLibraryComponent(libraryId: string, baseType: BaseComponentType, name?: string): LibraryComponent {
    const timestamp = now();
    const id = nanoid();
    const baseMeta = findBaseComponentMeta(baseType);
    const componentName = name ?? baseMeta.label;

    return {
        id,
        libraryId,
        name: componentName,
        baseType,
        previewImage: null,
        document: createWorkspaceDocument(id, componentName, baseType),
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}
