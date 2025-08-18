import { Service } from "typedi";
import type { ISaveTransferPayload } from "../interface/transfer";
import BaseRepository from "./BaseRepository";
import { PageBuilder } from "../utils/pagination";
import dayjs from "dayjs";

@Service()
class TransferRepository extends BaseRepository {
    async getMany(builder: PageBuilder) {
        const query = builder.build();
        return await this.db.assetTransfer.findMany({
            where: this.normalizeFilters(query.where),
            skip: query.skip,
            take: query.take,
        })
    }

    async getCount(builder: PageBuilder) {
        const query = builder.build();
        return await this.db.assetTransfer.count({
            where: this.normalizeFilters(query.where),
            skip: query.skip,
            take: query.take,
        })
    }

    async getActiveOwners(builder: PageBuilder) {
        const { limit } = builder.build();
        const [sent, received] = await Promise.all([
            this.db.assetTransfer.groupBy({
                by: ["previousOwner"],
                _count: { _all: true },
            }),
            this.db.assetTransfer.groupBy({
                by: ["newOwner"],
                _count: { _all: true },
            }),
        ]);

        const counts = new Map<string, number>();
        for (const row of sent) {
            counts.set(row.previousOwner.toLowerCase(), (counts.get(row.previousOwner.toLowerCase()) || 0) + row._count._all);
        }
        for (const row of received) {
            counts.set(row.newOwner.toLowerCase(), (counts.get(row.newOwner.toLowerCase()) || 0) + row._count._all);
        }

        return [...counts.entries()]
            .map(([address, count]) => ({ address, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    async dailyTransferCounts(): Promise<{ day: string; count: number }[]> {
        const rows: Array<{ day: Date; count: bigint }> = await this.db.$queryRawUnsafe(
            `SELECT date_trunc('day', "blockTimestamp") AS day, COUNT(*)::bigint AS count
       FROM "AssetTransfer"
       GROUP BY 1
       ORDER BY 1 ASC`
        );
        return rows.map((r) => ({ day: dayjs(r.day).format("YYYY-MM-DD"), count: Number(r.count) }));
    }

    async save(payload: ISaveTransferPayload) {
        await this.db.assetTransfer.upsert({
            where: {
                txHash_logIndex: {
                    txHash: payload.txHash,
                    logIndex: payload.logIndex,
                },
            },
            create: {
                assetId: this.intToDecimal(payload.assetId),
                previousOwner: payload.previousOwner,
                newOwner: payload.newOwner,
                blockNumber: payload.blockNumber!,
                blockTimestamp: this.intToDate(payload.blockTimestamp),
                txHash: payload.txHash,
                logIndex: Number(payload.logIndex!),
            },
            update: {}, // no-op on duplicates
        });
    }
}

export default TransferRepository