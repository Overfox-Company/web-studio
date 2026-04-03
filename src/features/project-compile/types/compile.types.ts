import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import type { PageNode, ProjectEditorState } from "@/src/features/project-editor/types/editor.types";

export type CompileSeverity = "warning" | "error";
export type CompileStatus = "idle" | "compiling" | "success" | "error";

export interface CompileIssue {
    severity: CompileSeverity;
    code: string;
    message: string;
    pageId?: string;
}

export interface ResolvedExportPage {
    page: PageNode;
    document: DesignDocumentSnapshot;
    fileName: string;
    normalizedSlug: string;
    title: string;
    isEntry: boolean;
}

export interface ExportAsset {
    path: string;
    content: string | Uint8Array;
    mimeType: string;
}

export interface AssetExportResult {
    assets: ExportAsset[];
    warnings: CompileIssue[];
    imageSrcByNodeId: Record<string, string>;
}

export interface StaticExportFile {
    path: string;
    content: string | Uint8Array;
}

export interface StaticProjectCompileOutput {
    project: ProjectEditorState;
    rootFolderName: string;
    downloadFileName: string;
    files: StaticExportFile[];
    warnings: CompileIssue[];
}