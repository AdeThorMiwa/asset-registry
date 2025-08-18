import { Container, Service } from "typedi";
import { PageBuilder } from "../utils/pagination";
import AssetRepository from "../repositories/AssetRepository";
import TransferRepository from "../repositories/TransferRepository";
import { AnalyticsWriterFormat, IAnaylyticsQuery } from "../interface/analytics";
import FileWriterFactory from "../utils/analytic_writer";

@Service()
class AnalyticsService {
    private readonly assetRepository = Container.get(AssetRepository);
    private readonly transferRepository = Container.get(TransferRepository);

    public async getAnalytics(query: IAnaylyticsQuery) {
        const builder = PageBuilder.new().from(query.from).to(query.to);

        const [assets, transfers, activeOwners, dailyTransferCounts] = await Promise.all([
            this.assetRepository.getCount(builder),
            this.transferRepository.getCount(builder),
            this.transferRepository.getActiveOwners(builder.size(3)),
            this.transferRepository.dailyTransferCounts()
        ])

        const data = { assets, transfers, activeOwners, dailyTransferCounts };
        const jsonWriter = FileWriterFactory.getWriter(AnalyticsWriterFormat.Json);
        const mdWriter = FileWriterFactory.getWriter(AnalyticsWriterFormat.Markdown);
        const chartWriter = FileWriterFactory.getWriter(AnalyticsWriterFormat.Chart);

        await Promise.all([
            jsonWriter.write(data, { filename: "analytics" }),
            mdWriter.write(data, { filename: "summary" }),
            chartWriter.write(data, { filename: "chart" })
        ])
    }
}

export default AnalyticsService