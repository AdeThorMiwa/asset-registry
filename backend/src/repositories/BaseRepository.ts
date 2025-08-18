import { Decimal } from '@prisma/client/runtime/client';
import DatabaseService from "../services/DatabaseService";

class BaseRepository {
    get db() {
        return DatabaseService.getClientInstance()
    }

    protected intToDecimal(n: bigint) {
        // Prisma.Decimal from BigInt, safe for uint256 -> DECIMAL(78,0)
        return new Decimal(n.toString(10));
    }

    protected intToDate(sec: bigint | number) {
        return new Date(Number(sec) * 1000);
    }

    normalizeFilters(filters: Record<string, unknown>) {
        const normalized: Record<string, unknown> = {};

        for (const key in filters) {
            const value = filters[key];
            if (typeof value === "bigint") {
                normalized[key] = this.intToDecimal(value);
            } else {
                normalized[key] = value;
            }
        }

        return normalized
    }
}

export default BaseRepository;