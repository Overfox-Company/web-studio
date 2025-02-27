export type UploadModel = {
    image: string,
    name: string
}
export type EditModel = {
    image: string,
    name: string,
    id: string
}

export type AddTag = {
    name: string
}
export type AddVideo = {
    views?: number;
    _id?: string;
    title: string;
    time: string;
    image: string;
    video: string;
    dump: string;
    quality: string;
    models: string[];
    tags: string[];
    searchPrarms: string;
}