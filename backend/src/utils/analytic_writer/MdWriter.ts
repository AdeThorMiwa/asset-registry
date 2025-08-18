import { Service } from "typedi";
import { ANALYTICS_WRITER_TOKEN } from "../../constants/tokens";
import { AnalyticsWriterFormat, IWriter } from "../../interface/analytics";
import { writeFile } from "fs/promises";
import path from "path";
import Logger from "../logger";

interface Opts {
    filename: string;
    template: string;
}

@Service({ id: ANALYTICS_WRITER_TOKEN, multiple: true })
export class MDWriter implements IWriter {
    format = AnalyticsWriterFormat.Markdown;

    async write(data: Record<string, unknown>, opts: Opts): Promise<void> {
        Logger.info("Writing MD file %s", opts.filename);
        await writeFile(path.resolve(`${opts.filename}.md`), TEMPLATES(data.assets as number, data.transfers as number, data.activeOwners as any[]).basic, "utf-8");
        Logger.info("MD write complete for file %s", opts.filename);
    }
}

// @todo manage templates better
var TEMPLATES = (assets: number, transfers: number, top3: any[]) => ({
    basic: [
        `# Asset Registry Analytics`,
        ``,
        `- **Total assets registered:** ${assets}`,
        `- **Total ownership transfers:** ${transfers}`,
        ``,
        `## Top 3 Most Active Owners (by transfers participated)`,
        ``,
        ...top3.map((t, i) => `${i + 1}. \`${t.address}\` — ${t.count} transfers`),
        ``,
    ].join("\n")
})