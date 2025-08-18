import { Container } from "typedi";
import { ANALYTICS_WRITER_TOKEN } from "../../constants/tokens";
import { AnalyticsWriterFormat, IWriter } from "../../interface/analytics";
import createHttpError from "http-errors";


class FileWriterFactory {
    private writers: IWriter[];

    constructor() {
        this.writers = Container.getMany(ANALYTICS_WRITER_TOKEN);
    }

    getWriter(format: AnalyticsWriterFormat): IWriter {
        const writer = this.writers.find(w => w.format === format);
        if (!writer) throw new createHttpError.InternalServerError("Service unavailable");
        return writer;
    }
}

export * from "./JsonWriter"
export * from "./MdWriter"
export * from "./ChartWriter"
export default new FileWriterFactory();