import { Service } from "typedi";
import { ANALYTICS_WRITER_TOKEN } from "../../constants/tokens";
import { AnalyticsWriterFormat, IWriter } from "../../interface/analytics";
import Logger from "../logger";
import path from "path";
import { writeFile } from "fs/promises";

interface Opts {
    filename: string;
}

@Service({ id: ANALYTICS_WRITER_TOKEN, multiple: true })
export class JSONWriter implements IWriter {
    format = AnalyticsWriterFormat.Json;

    async write(data: Record<string, unknown>, opts: Opts): Promise<void> {
        Logger.info("Writing JSON file %s", opts.filename);
        const filePath = path.resolve(`${opts.filename}.json`);
        await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
        Logger.info("JSON write complete for file %s", opts.filename);
    }
}