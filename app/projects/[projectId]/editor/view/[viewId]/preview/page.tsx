import { DesignPreviewPage } from "@/src/features/design-editor/components/DesignPreviewPage";

interface DesignViewPreviewPageProps {
    params: Promise<{
        projectId: string;
        viewId: string;
    }>;
}

export default async function DesignViewPreviewPage({ params }: DesignViewPreviewPageProps) {
    const { projectId, viewId } = await params;

    return <DesignPreviewPage projectId={projectId} viewId={viewId} />;
}