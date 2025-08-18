import { Container, Service } from "typedi";
import { IPaginationQuery } from "../interface/logs";
import { PageBuilder, paginate } from "../utils/pagination";
import AssetRepository from "../repositories/AssetRepository";
import TransferRepository from "../repositories/TransferRepository";
import createHttpError from "http-errors";

@Service()
class AssetService {
    private readonly assetRepository = Container.get(AssetRepository);
    private readonly transferRepository = Container.get(TransferRepository);

    async getAssets(query: IPaginationQuery) {
        const { page, limit, ...filters } = query;
        const builder = new PageBuilder().filter(this._mapGetAssetFilterKeys(filters)).page(page).size(limit);
        const [data, total] = await Promise.all([this.assetRepository.getMany(builder), this.assetRepository.getCount(builder)]);
        return paginate(data, builder, total);
    }

    async getAssetTransfers(assetId: bigint, query: IPaginationQuery) {
        const asset = await this.assetRepository.getById(assetId);
        if (!asset) { throw new createHttpError.NotFound("asset not found"); }
        const builder = new PageBuilder().filter({ assetId }).page(query.page).size(query.limit);
        const [data, total] = await Promise.all([this.transferRepository.getMany(builder), this.transferRepository.getCount(builder)]);
        return paginate(data, builder, total);
    }

    private _mapGetAssetFilterKeys(filters: Record<string, unknown>) {
        const keyMaps: Record<string, string> = { owner: "currentOwner" };
        let mapped: Record<string, unknown> = {};
        for (const key in filters) {
            const originalKey = keyMaps[key];
            if (originalKey) mapped[originalKey] = filters[key];
            else mapped[key] = filters[key];
        }
        return mapped
    }
}

export default AssetService