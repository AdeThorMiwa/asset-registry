import { Router } from "express";
import { Container } from "typedi";
import AssetController from "../controllers/AssetController";
import { asyncHandler } from "../utils/routing";
import { paginationValidation } from "../middlewares/validation";
import ErrorHandler from "../utils/error";
import { query } from "express-validator";

const router: Router = Router();
const controller = Container.get(AssetController);

router.get(
    "/",
    paginationValidation,
    query("owner").optional().isEthereumAddress(),
    ErrorHandler.routeValidationError,
    asyncHandler(controller.getAllAssets.bind(controller)),
);

router.get(
    "/:assetId/transfers",
    paginationValidation,
    ErrorHandler.routeValidationError,
    asyncHandler(controller.getAssetTransfers.bind(controller)),
);

export default router;