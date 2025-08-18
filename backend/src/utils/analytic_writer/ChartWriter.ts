import { Service } from "typedi";
import { ANALYTICS_WRITER_TOKEN } from "../../constants/tokens";
import { AnalyticsWriterFormat, IWriter } from "../../interface/analytics";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import path from "path";
import { writeFile } from "fs/promises";
import Logger from "../logger";

interface Opts {
    filename: string;
}

@Service({ id: ANALYTICS_WRITER_TOKEN, multiple: true })
export class ChartWriter implements IWriter {
    format = AnalyticsWriterFormat.Chart;
    private readonly width = 1000;
    private readonly height = 420;
    private readonly chart = new ChartJSNodeCanvas({ width: this.width, height: this.height, backgroundColour: "white" });

    async write(originalData: Record<string, unknown>, opts: Opts): Promise<void> {
        const data = originalData.dailyTransferCounts as any[];
        const labels = data.map(d => d.day);
        const values = data.map(d => d.count);

        const conf = {
            type: "line" as const,
            data: {
                labels,
                datasets: [
                    {
                        label: "Transfers per day",
                        data: values,
                    },
                ],
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: "Asset Transfers Over Time" },
                },
                scales: {
                    x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
                    y: { beginAtZero: true, precision: 0 },
                },
            },
        };

        const buffer = await this.chart.renderToBuffer(conf as any);
        const abs = path.resolve(`${opts.filename}.png`);
        await writeFile(abs, buffer);
        Logger.info("Chart rendered %o", { output: abs });
    }
}