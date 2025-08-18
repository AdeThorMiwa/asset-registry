import type { Application } from "express";
import AssetRoutes from "./AssetRoutes";
import AnalyticsRoutes from "./AnalyticsRoutes";

class RouteManager {
    static setupRoutes(app: Application) {
        app.use('/health', (req, res) => {
            res.json({ message: 'pong' });
        });

        app.use("/assets", AssetRoutes);
        app.use("/analytics", AnalyticsRoutes);
    }
}

export default RouteManager