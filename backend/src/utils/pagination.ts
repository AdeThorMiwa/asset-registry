import { IPaginated } from "../interface/pagination";

export class PageBuilder {
    private _page = 1;
    private _size = 10;
    private _filter = {}
    private _from = "";
    private _to = "";

    static new() {
        return new PageBuilder()
    }

    page(page?: number) {
        this._page = page ?? this._page;
        return this
    }

    size(size?: number) {
        this._size = size ?? this._size;
        return this
    }

    filter(filter?: Record<string, unknown>) {
        this._filter = filter ?? this._filter;
        return this
    }

    from(from?: string) {
        this._from = from ?? this._from;
        return this
    }

    to(to?: string) {
        this._to = to ?? this._to;
        return this
    }

    build() {
        const size = this._size;
        const skip = (this._page - 1) * size;
        return { take: size, skip, where: this._filter, page: this._page, limit: this._size }
    }
}

export const paginate = <T>(
    data: T[],
    builder: PageBuilder,
    total: number,
): IPaginated<T> => {
    const result = builder.build();
    let page = result.page;
    const totalPages = Math.ceil(total / result.limit);
    page = Math.max(Math.min(page, totalPages), 1);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
        page,
        data,
        hasNext,
        hasPrev,
    };
};