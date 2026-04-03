import type { DesignImageNode } from "@/src/features/design-editor/types/design.types";
import type { CompileIssue, ExportAsset, ResolvedExportPage } from "@/src/features/project-compile/types/compile.types";

function sanitizeAssetName(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "asset";
}

function inferFileExtension(mimeType: string) {
    switch (mimeType) {
        case "image/png":
            return "png";
        case "image/jpeg":
            return "jpg";
        case "image/webp":
            return "webp";
        case "image/gif":
            return "gif";
        case "image/svg+xml":
            return "svg";
        default:
            return "bin";
    }
}

function decodeDataUri(dataUri: string) {
    const match = dataUri.match(/^data:([^;,]+)?(?:;(base64))?,(.*)$/);

    if (!match) {
        return null;
    }

    const [, mimeType = "application/octet-stream", encoding, rawPayload] = match;
    const payload = encoding === "base64"
        ? Uint8Array.from(atob(rawPayload), (character) => character.charCodeAt(0))
        : new TextEncoder().encode(decodeURIComponent(rawPayload));

    return {
        mimeType,
        payload,
    };
}

function createPlaceholderSvg(node: DesignImageNode) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.max(1, Math.round(node.width))} ${Math.max(1, Math.round(node.height))}">
  <rect width="100%" height="100%" rx="18" fill="#eef2f6" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="8 6" />
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#64748b" font-size="14" font-family="IBM Plex Sans, sans-serif">${node.name || "Image"}</text>
</svg>`;
}

export function exportProjectAssets(pages: ResolvedExportPage[]) {
    const assets: ExportAsset[] = [];
    const warnings: CompileIssue[] = [];
    const imageSrcByNodeId: Record<string, string> = {};

    for (const page of pages) {
        for (const node of Object.values(page.document.nodes)) {
            if (node.type !== "image") {
                continue;
            }

            const assetBaseName = `${sanitizeAssetName(page.normalizedSlug)}-${sanitizeAssetName(node.id)}`;

            if (node.src.startsWith("data:")) {
                const decoded = decodeDataUri(node.src);

                if (!decoded) {
                    warnings.push({
                        severity: "warning",
                        code: "invalid-data-uri-image",
                        pageId: page.page.id,
                        message: `Image "${node.name}" could not be decoded and will be skipped.`,
                    });
                    continue;
                }

                const fileName = `${assetBaseName}.${inferFileExtension(decoded.mimeType)}`;
                const path = `assets/images/${fileName}`;

                assets.push({
                    path,
                    content: decoded.payload,
                    mimeType: decoded.mimeType,
                });
                imageSrcByNodeId[node.id] = `./${path}`;
                continue;
            }

            if (node.src.startsWith("placeholder://")) {
                const path = `assets/images/${assetBaseName}.svg`;

                assets.push({
                    path,
                    content: createPlaceholderSvg(node),
                    mimeType: "image/svg+xml",
                });
                imageSrcByNodeId[node.id] = `./${path}`;
                warnings.push({
                    severity: "warning",
                    code: "placeholder-image-exported",
                    pageId: page.page.id,
                    message: `Image "${node.name}" uses a placeholder source. A placeholder asset was generated for export.`,
                });
                continue;
            }

            if (/^https?:\/\//i.test(node.src) || node.src.startsWith("/")) {
                imageSrcByNodeId[node.id] = node.src;
                warnings.push({
                    severity: "warning",
                    code: "external-image-reference",
                    pageId: page.page.id,
                    message: `Image "${node.name}" keeps its existing URL reference because it is not embedded in the document model.`,
                });
                continue;
            }

            warnings.push({
                severity: "warning",
                code: "unsupported-image-source",
                pageId: page.page.id,
                message: `Image "${node.name}" uses an unsupported source and was omitted from export.`,
            });
        }
    }

    return {
        assets,
        warnings,
        imageSrcByNodeId,
    };
}