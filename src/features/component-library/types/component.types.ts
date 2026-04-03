import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";

// Architecture note:
// - Base sidebar components are default templates used to start a reusable component.
// - A Library Component is a user-customized reusable component stored inside one library.
// - The library editor canvas is a construction workspace, not a final page.

export const BASE_COMPONENT_TYPES = ["button", "input", "checkbox", "textarea", "label", "select", "card", "badge", "switch", "radio"] as const;

export type BaseComponentType = (typeof BASE_COMPONENT_TYPES)[number];

export interface ComponentLibrary {
    id: string;
    name: string;
    description?: string;
    componentIds: string[];
    createdAt: string;
    updatedAt: string;
}

export interface LibraryComponent {
    id: string;
    libraryId: string;
    name: string;
    baseType: BaseComponentType;
    previewImage?: string | null;
    document: DesignDocumentSnapshot;
    createdAt: string;
    updatedAt: string;
}

export interface ComponentLibrarySnapshot {
    projectId: string;
    librariesById: Record<string, ComponentLibrary>;
    componentsById: Record<string, LibraryComponent>;
    version: number;
    updatedAt: string;
}

export interface ComponentEditorSelection {
    libraryId: string | null;
    componentId: string | null;
}
