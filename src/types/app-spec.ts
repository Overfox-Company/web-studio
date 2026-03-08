import type { DataTrigger, FieldDefinition, RelationDefinition, RenderMode } from "@/src/types/editor";

export interface PageSpecification {
    id: string;
    name: string;
    route: string;
    render: RenderMode;
    layout: string;
    components: string[];
    navigationTargets: Array<{
        pageId: string;
        name: string;
        route: string;
    }>;
    builderTree: string;
}

export interface ComponentSpecification {
    id: string;
    name: string;
    componentType: string;
    props: Record<string, string>;
    stateDependencies: string[];
}

export interface DatabaseSpecification {
    id: string;
    model: string;
    fields: FieldDefinition[];
    indexes: string[];
    relations: RelationDefinition[];
}

export interface ApiSpecification {
    id: string;
    method: string;
    route: string;
    inputSchema: string;
    outputSchema: string;
}

export interface ServerActionSpecification {
    id: string;
    name: string;
    inputData: string;
    mutationLogic: string;
    databaseDependencies: string[];
}

export interface ExternalApiSpecification {
    id: string;
    serviceName: string;
    baseUrl: string;
    authStrategy: string;
}

export interface StoreSpecification {
    id: string;
    name: string;
    stateShape: Record<string, string>;
    persistence: boolean;
}

export interface DataFlowSpecification {
    id: string;
    source: string;
    target: string;
    schema: string;
    trigger: DataTrigger;
    notes?: string;
}

export interface ProjectFileSpecification {
    path: string;
    purpose: string;
}

export interface ApplicationSpecification {
    meta: {
        name: string;
        generatedAt: string;
        version: string;
    };
    pages: PageSpecification[];
    components: ComponentSpecification[];
    database: DatabaseSpecification[];
    apis: ApiSpecification[];
    actions: ServerActionSpecification[];
    externalApis: ExternalApiSpecification[];
    stateStores: StoreSpecification[];
    dataFlow: DataFlowSpecification[];
    projectStructure: ProjectFileSpecification[];
}