export interface IPaginated<T> {
    data: T[];
    page: number;
    hasNext: boolean;
    hasPrev: boolean;
}