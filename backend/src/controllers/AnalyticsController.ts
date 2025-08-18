import { Request, Response } from "express";
import { Container, Service } from "typedi";
import AnalyticsService from "../services/AnalyticsService";
import { IAnaylyticsQuery } from "../interface/analytics";

@Service()
class AnalyticsController {
    private readonly analyticsService = Container.get(AnalyticsService);

    async getAnalytics(req: Request, res: Response) {
        const query = req.query as unknown as IAnaylyticsQuery;
        await this.analyticsService.getAnalytics(query);
        res.send(201)
    }
}

export default AnalyticsController;