export enum AnalyticsWriterFormat {
    Json = "json",
    Markdown = "md",
    Chart = "chart"
}

export interface IAnaylyticsQuery {
    from?: string;
    to?: string;
}


export interface IWriter {
    format: AnalyticsWriterFormat;
    write(data: Record<string, unknown>, opts: unknown): Promise<void>;
}