"use client";

import { useCallback, useState } from "react";

import { useComponentLibraryStore } from "@/src/features/component-library/store/component-library.store";
import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import type { ProjectEditorState } from "@/src/features/project-editor/types/editor.types";
import { triggerZipDownload } from "@/src/features/project-compile/DownloadTrigger";
import { buildProjectExportZip } from "@/src/features/project-compile/ZipBuilder";
import { compileProjectToStaticExport, StaticCompileError } from "@/src/features/project-compile/compile-project";
import type { CompileIssue, CompileStatus } from "@/src/features/project-compile/types/compile.types";

interface ProjectCompileDocumentOverride {
    pageId: string;
    document: DesignDocumentSnapshot;
}

interface UseProjectCompileOptions {
    getProjectSnapshot: () => ProjectEditorState | null;
    getDocumentOverride?: () => ProjectCompileDocumentOverride | null;
}

function summarizeIssues(issues: CompileIssue[]) {
    return issues.map((issue) => `- ${issue.message}`).join("\n");
}

function applyDocumentOverride(project: ProjectEditorState, override: ProjectCompileDocumentOverride | null) {
    if (!override) {
        return project;
    }

    const nextProject: ProjectEditorState = {
        ...project,
        nodes: project.nodes.map((node) => {
            if (node.kind !== "page" || node.id !== override.pageId) {
                return node;
            }

            return {
                ...node,
                data: {
                    ...node.data,
                    designDocument: override.document,
                },
            };
        }),
    };

    return nextProject;
}

export function useProjectCompile({ getProjectSnapshot, getDocumentOverride }: UseProjectCompileOptions) {
    const libraryComponentsById = useComponentLibraryStore((state) => state.snapshot.componentsById);
    const [compileState, setCompileState] = useState<CompileStatus>("idle");
    const [compileMessage, setCompileMessage] = useState<string | null>(null);

    const runCompile = useCallback(async () => {
        if (compileState === "compiling") {
            return;
        }

        setCompileState("compiling");
        setCompileMessage("Compiling static export...");

        try {
            const project = getProjectSnapshot();

            if (!project) {
                throw new StaticCompileError("The project could not be loaded.", [
                    {
                        severity: "error",
                        code: "project-not-found",
                        message: "The project snapshot is not available for compilation.",
                    },
                ]);
            }

            const sourceProject = applyDocumentOverride(project, getDocumentOverride?.() ?? null);
            const output = compileProjectToStaticExport(sourceProject, { libraryComponentsById });
            const zipBlob = await buildProjectExportZip(output);

            triggerZipDownload(zipBlob, output.downloadFileName);
            setCompileState("success");
            setCompileMessage(output.warnings.length > 0 ? `Compiled with ${output.warnings.length} warning(s)` : "Compile ready");

            if (output.warnings.length > 0) {
                window.alert(`Static export completed with warnings:\n\n${summarizeIssues(output.warnings)}`);
            }
        } catch (error) {
            const issues = error instanceof StaticCompileError
                ? error.issues
                : [{ severity: "error", code: "compile-failed", message: "The static export failed unexpectedly." } satisfies CompileIssue];

            setCompileState("error");
            setCompileMessage(issues[0]?.message ?? "Compile failed");
            window.alert(`Compile failed:\n\n${summarizeIssues(issues)}`);
        }
    }, [compileState, getDocumentOverride, getProjectSnapshot, libraryComponentsById]);

    return {
        compileState,
        compileMessage,
        runCompile,
    };
}