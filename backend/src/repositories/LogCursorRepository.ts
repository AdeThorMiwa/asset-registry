import { Service } from "typedi";
import BaseRepository from "./BaseRepository";

@Service()
class LogCursorRepository extends BaseRepository {
    async getCursor(key: string) {
        const row = await this.db.logReaderCursor.findUnique({ where: { key } })
        if (!row) return -1n;
        return BigInt(row.value);
    }

    async setCursor(key: string, _value: bigint) {
        const value = _value.toString(10);
        await this.db.logReaderCursor.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        })
    }
}

export default LogCursorRepository