import "dotenv/config";
import { z } from "zod";


const env = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    DATABASE_URL: z.url(),
    PORT: z.string().default("3000"),
    RPC_HTTP_URL: z.url(),
    RPC_WS_URL: z.url(),
    ASSET_REGISTRY_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    NETWORK: z.string(),
    CONFIRMATIONS: z.string().default("3"),
    LOG_LEVEL: z.enum(["debug", "info", "warning", "error"]).default("debug"),
});

export const Env = env.parse(process.env);