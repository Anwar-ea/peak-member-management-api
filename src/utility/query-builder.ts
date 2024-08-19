import { Any, ArrayContains, Between, Equal, FindManyOptions, FindOptionsOrder, FindOptionsWhere, ILike, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not } from "typeorm";
import { AccountEntityBase, EntityBase } from "../entities";
import { IFetchRequest, IFilter } from "../models";
import { FilterMatchModes, FilterOperators, SortOrder } from "../models";

export const buildQuery = <T extends AccountEntityBase | EntityBase>(fetchRequest: IFetchRequest<T>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): FindManyOptions<T> => {
    let query: FindManyOptions<T> = {}
    let sortOptions: FindOptionsOrder<T> = {};
    const pagedRequest = fetchRequest.pagedListRequest;

    if (fetchRequest.queryOptionsRequest?.sortRequest) {
        for (const sortRequest of fetchRequest.queryOptionsRequest?.sortRequest.sort((a, b) => a.priority - b.priority)) {
            sortOptions = { ...sortOptions, [sortRequest.field]: sortRequest.direction === SortOrder.Ascending ? "asc" : "desc" }
        }
    }
    
    query.where = queryOptionsMapper(fetchRequest.queryOptionsRequest?.filtersRequest ?? [], getOnlyActive, dontGetDeleted, accountId);
    query.order = sortOptions;
    query.relations = fetchRequest.queryOptionsRequest?.includes ?? [];
    if (pagedRequest) {
        query.skip = (pagedRequest.pageNo - 1) * pagedRequest.pageSize;
        query.take = pagedRequest.pageSize;
    }

    return query;
}

const queryMapper = <T>(filterRequest: IFilter<T, keyof T>): FindOptionsWhere<T> => {
    let whereClause: FindOptionsWhere<T> = {};

    switch (filterRequest.matchMode) {
        case FilterMatchModes.Contains:
            whereClause = { [filterRequest.field as string]: ArrayContains([filterRequest.value]) } as FindOptionsWhere<T>;
            break;
        case FilterMatchModes.Equal:
            whereClause = { [filterRequest.field as string]: Equal(filterRequest.value) } as FindOptionsWhere<T>;
            break;
        case FilterMatchModes.GreaterThan:
            whereClause = { [filterRequest.field as string]: MoreThan(filterRequest.value) } as FindOptionsWhere<T>;
            break;
        case FilterMatchModes.GreaterThanOrEqual:
            whereClause = { [filterRequest.field as string]: MoreThanOrEqual(filterRequest.value) } as FindOptionsWhere<T>;
            break;
        case FilterMatchModes.LessThan:
            whereClause = { [filterRequest.field as string]: LessThan(filterRequest.value) } as FindOptionsWhere<T>;
            break;
        case FilterMatchModes.LessThanOrEqual:
            whereClause = { [filterRequest.field as string]: LessThanOrEqual(filterRequest.value) } as FindOptionsWhere<T>;
            break;
        case FilterMatchModes.NotEqual:
            whereClause = { [filterRequest.field as string]: Not(filterRequest.value) } as FindOptionsWhere<T>;
            break;
        case FilterMatchModes.Like:
            whereClause = { [filterRequest.field as string]: (filterRequest.ignoreCase ? ILike(`%${filterRequest.value}%`) : Like(`%${filterRequest.value}%`)) } as FindOptionsWhere<T>;
            break;
        case FilterMatchModes.Any:
            whereClause = { [filterRequest.field as string]: Any<T[keyof T]>(filterRequest.values as Array<any>) } as FindOptionsWhere<T>;
            break;
        case FilterMatchModes.Between:
            whereClause = { [filterRequest.field as string]: Between(filterRequest.rangeValues?.start, filterRequest.rangeValues?.end) } as FindOptionsWhere<T>;
            break;
        case FilterMatchModes.In:
            whereClause = { [filterRequest.field as string]: In(filterRequest.values as Array<T[keyof T]>) } as FindOptionsWhere<T>;
            break;
        default:
            break;
    }

    return whereClause;
}

export const queryOptionsMapper = <T extends AccountEntityBase | EntityBase>(filters: Array<IFilter<T, keyof T>>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): Array<FindOptionsWhere<T>> => {
    let defaultWhereClause: FindOptionsWhere<T> = {};

    if (accountId) {
        const whereClause: FindOptionsWhere<AccountEntityBase> = { accountId };
        defaultWhereClause = { ...defaultWhereClause, ...(whereClause as FindOptionsWhere<T>) };
    }

    if (getOnlyActive) defaultWhereClause = { ...defaultWhereClause, ...({ active: true } as FindOptionsWhere<T>) };

    if (dontGetDeleted) defaultWhereClause = { ...defaultWhereClause, ...({ deleted: false } as FindOptionsWhere<T>) };

    return filters.reduce((state: Array<FindOptionsWhere<T>>, filter: IFilter<T, keyof T>) => {
        filter.operator === FilterOperators.And && state.length ? state[0] = { ...state[0], ...queryMapper(filter) } : state.push(queryMapper(filter))
        return state;
    }, [defaultWhereClause])
}