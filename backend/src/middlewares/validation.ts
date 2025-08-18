import { query } from "express-validator";

export const DEFAULT_PAGINATION_LIMIT = 10;

export const paginationValidation = [
    query('page').optional().toInt().isInt().default(1),
    query('limit').optional().toInt().isInt().default(DEFAULT_PAGINATION_LIMIT),
];

export const dateRangeValidation = [
    query('from').optional().toInt().isInt(),
    query('to').optional().toInt().isInt(),
];