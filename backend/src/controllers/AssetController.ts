import { Request, Response } from "express";
import { Container, Service } from "typedi";
import AssetService from "../services/AssetService";
import { IPaginationQuery } from "../interface/logs";
import { IGetAssetQuery } from "../interface/asset";

@Service()
class AssetController {
    private readonly assetService = Container.get(AssetService);

    async getAllAssets(req: Request, res: Response) {
        const query = req.query as unknown as IGetAssetQuery;
        const response = await this.assetService.getAssets(query);
        res.json(response);
    }

    async getAssetTransfers(req: Request, res: Response) {
        const assetId = BigInt(req.params.assetId!);
        const query = req.query as unknown as IPaginationQuery;
        const response = await this.assetService.getAssetTransfers(assetId, query);
        res.json(response);
    }
}

export default AssetController;