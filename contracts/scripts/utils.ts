export const getEnv = (name: string, required = false): string | undefined => {
    const v = process.env[name];
    if (required && (!v || v.trim() === "")) {
        throw new Error(`Missing required env: ${name}`);
    }
    return v?.trim();
}