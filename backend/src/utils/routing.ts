import { NextFunction, Request, Response } from "express";

type AsyncRequestHandler<Req extends Request> = (
    req: Req,
    res: Response,
    next: NextFunction,
) => Promise<void>;

type AsyncHandlerWrapper = <Req extends Request>(
    fn: AsyncRequestHandler<Req>,
) => (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler: AsyncHandlerWrapper = <Req extends Request>(fn: AsyncRequestHandler<Req>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        fn(req as Req, res, next).catch(next);
    };
}