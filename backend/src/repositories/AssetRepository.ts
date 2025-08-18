import { Service } from "typedi";
import type { ISaveAssetPayload } from "../interface/asset";
import BaseRepository from "./BaseRepository";
import type { Asset } from "../../prisma/prisma";
import { PageBuilder } from "../utils/pagination";

@Service()
class AssetRepository extends BaseRepository {
    async getById(assetId: bigint): Promise<Asset | undefined> {
        const asset = await this.db.asset.findFirst({ where: { assetId: this.intToDecimal(assetId) } });
        return asset ?? undefined;
    }

    async getMany(builder: PageBuilder) {
        const query = builder.build();
        return await this.db.asset.findMany({
            where: query.where,
            skip: query.skip,
            take: query.take,
        })
    }

    async getCount(builder: PageBuilder) {
        const query = builder.build();
        return await this.db.asset.count({
            where: query.where,
            skip: query.skip,
            take: query.take,
        })
    }

    async save(payload: ISaveAssetPayload) {
        return await this.db.asset.upsert({
            where: { assetId: this.intToDecimal(payload.assetId) },
            create: {
                assetId: this.intToDecimal(payload.assetId),
                description: payload.description,
                registrationTs: this.intToDate(payload.timestamp),
                registeredBy: payload.registeredBy,
                currentOwner: payload.registeredBy,
            },
            update: {}, // no-op on duplicates (idempotent)
        })
    }
}

export default AssetRepository