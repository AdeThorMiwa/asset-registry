import type { NextFunction, Request, Response } from "express";
import createHttpError, { isHttpError } from "http-errors"
import Logger from "./logger";
import { Env } from "../config/env";
import { validationResult } from "express-validator";

class ErrorHandler {
    static routeValidationError = (req: Request, _: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorSet = new Set();
            errors.array().forEach(er => {
                errorSet.add(`${er.msg}`);
            });

            return next(new createHttpError.BadRequest(`${Array.from(errorSet.values())}`));
        }
        next();
    };

    static httpMiddleware(
        error: Error,
        req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction) {
        const baseError = isHttpError(error) ? error : createHttpError.InternalServerError(error.message || 'An error occurred while processing your request. We are looking into it.');

        Logger.error({
            method: req.method,
            url: req.url,
            clientInfo: req.headers['user-agent'],
            status: baseError.statusCode,
            message: baseError.message,
            stack: error.stack,
        });

        const errObject: Record<string, unknown> = {
            name: baseError.name,
            message: baseError.message,
            statusCode: baseError.statusCode,
        };

        if (Env.NODE_ENV !== 'production') {
            errObject.stack = error.stack;
        }

        return res.status(baseError.statusCode).json(errObject);
    }

    static handleServerError(cleanup: () => Promise<void>) {
        process.on('uncaughtException', (err: Error) => {
            // eslint-disable-next-line no-console
            console.error(err);
            Logger.info('UNCAUGHT EXCEPTION! Shutting down...');
            cleanup().then(() => process.exit(1))
        });

        process.on('unhandledRejection', (err: Error) => {
            // eslint-disable-next-line no-console
            console.log(err);
            Logger.info('UNHANDLED REJECTION! Shutting down...');
            cleanup().then(() => process.exit(1))
        });

        process.on("SIGINT", async () => {
            Logger.info('SIGINT RECEIVED. Shutting down gracefully!');
            cleanup().then(() => process.exit(1))
        });

        process.on('SIGTERM', () => {
            Logger.info('SIGTERM RECEIVED. Shutting down gracefully!');
            cleanup().then(() => process.exit(1))
        });
    }
}

export default ErrorHandler