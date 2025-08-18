import { Router } from "express";
import { Container } from "typedi";
import { asyncHandler } from "../utils/routing";
import { dateRangeValidation } from "../middlewares/validation";
import ErrorHandler from "../utils/error";
import AnalyticsController from "../controllers/AnalyticsController";

const router: Router = Router();
const controller = Container.get(AnalyticsController);

router.get(
    "/",
    dateRangeValidation,
    ErrorHandler.routeValidationError,
    asyncHandler(controller.getAnalytics.bind(controller)),
);

export default router;