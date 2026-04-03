import JSZip from "jszip";

import type { StaticProjectCompileOutput } from "@/src/features/project-compile/types/compile.types";

export async function buildProjectExportZip(output: StaticProjectCompileOutput) {
    const zip = new JSZip();
    const root = zip.folder(output.rootFolderName);

    if (!root) {
        throw new Error("Unable to initialize the export archive.");
    }

    for (const file of output.files) {
        root.file(file.path, file.content);
    }

    return zip.generateAsync({ type: "blob" });
}