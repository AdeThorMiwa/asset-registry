import { PrismaClient } from '../../prisma/prisma/client'
import { Env } from "../config/env";
import Logger from "../utils/logger";

class DatabaseService {
    private client?: PrismaClient;

    connect() {
        this.client = new PrismaClient({
            log: Env.NODE_ENV === "production" ? [] : ["error", "warn"],
        });

        process.on("beforeExit", async () => {
            await this.client!.$disconnect().catch((e: Error) => Logger.error("Prisma disconnect failed", e));
        });
    }

    getClientInstance(): PrismaClient {
        if (!this.client) { this.connect(); }
        return this.client!
    }
}

export default new DatabaseService()