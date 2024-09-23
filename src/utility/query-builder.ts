// import { Any, ArrayContains, Between, Equal, FindManyOptions, FindOptionsOrder, FindOptionsWhere, ILike, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not } from "typeorm";
import { AccountEntityBase, EntityBase } from "../entities";
import { IFetchRequest, IFilter } from "../models";
import { FilterMatchModes, FilterOperators, SortOrder } from "../models";
import { FilterQuery, RootFilterQuery, Types } from "mongoose";

// export const buildQuery = <T extends AccountEntityBase | EntityBase>(fetchRequest: IFetchRequest<T>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): FindManyOptions<T> => {
//     let query: FindManyOptions<T> = {}
//     let sortOptions: FindOptionsOrder<T> = {};
//     const pagedRequest = fetchRequest.pagedListRequest;

//     if (fetchRequest.queryOptionsRequest?.sortRequest) {
//         for (const sortRequest of fetchRequest.queryOptionsRequest?.sortRequest.sort((a, b) => a.priority - b.priority)) {
//             sortOptions = { ...sortOptions, [sortRequest.field]: sortRequest.direction === SortOrder.Ascending ? "asc" : "desc" }
//         }
//     }
    
//     query.where = queryOptionsMapper(fetchRequest.queryOptionsRequest?.filtersRequest ?? [], getOnlyActive, dontGetDeleted, accountId);
//     query.order = sortOptions;
//     query.relations = fetchRequest.queryOptionsRequest?.includes ?? [];
//     if (pagedRequest) {
//         query.skip = (pagedRequest.pageNo - 1) * pagedRequest.pageSize;
//         query.take = pagedRequest.pageSize;
//     }

//     return query;
// }

// const queryMapper = <T>(filterRequest: IFilter<T, keyof T>): FindOptionsWhere<T> => {
//     let whereClause: FindOptionsWhere<T> = {};

//     switch (filterRequest.matchMode) {
//         case FilterMatchModes.Contains:
//             whereClause = { [filterRequest.field as string]: ArrayContains([filterRequest.value]) } as FindOptionsWhere<T>;
//             break;
//         case FilterMatchModes.Equal:
//             whereClause = { [filterRequest.field as string]: Equal(filterRequest.value) } as FindOptionsWhere<T>;
//             break;
//         case FilterMatchModes.GreaterThan:
//             whereClause = { [filterRequest.field as string]: MoreThan(filterRequest.value) } as FindOptionsWhere<T>;
//             break;
//         case FilterMatchModes.GreaterThanOrEqual:
//             whereClause = { [filterRequest.field as string]: MoreThanOrEqual(filterRequest.value) } as FindOptionsWhere<T>;
//             break;
//         case FilterMatchModes.LessThan:
//             whereClause = { [filterRequest.field as string]: LessThan(filterRequest.value) } as FindOptionsWhere<T>;
//             break;
//         case FilterMatchModes.LessThanOrEqual:
//             whereClause = { [filterRequest.field as string]: LessThanOrEqual(filterRequest.value) } as FindOptionsWhere<T>;
//             break;
//         case FilterMatchModes.NotEqual:
//             whereClause = { [filterRequest.field as string]: Not(filterRequest.value) } as FindOptionsWhere<T>;
//             break;
//         case FilterMatchModes.Like:
//             whereClause = { [filterRequest.field as string]: (filterRequest.ignoreCase ? ILike(`%${filterRequest.value}%`) : Like(`%${filterRequest.value}%`)) } as FindOptionsWhere<T>;
//             break;
//         case FilterMatchModes.Any:
//             whereClause = { [filterRequest.field as string]: Any<T[keyof T]>(filterRequest.values as Array<any>) } as FindOptionsWhere<T>;
//             break;
//         case FilterMatchModes.Between:
//             whereClause = { [filterRequest.field as string]: Between(filterRequest.rangeValues?.start, filterRequest.rangeValues?.end) } as FindOptionsWhere<T>;
//             break;
//         case FilterMatchModes.In:
//             whereClause = { [filterRequest.field as string]: In(filterRequest.values as Array<T[keyof T]>) } as FindOptionsWhere<T>;
//             break;
//         default:
//             break;
//     }

//     return whereClause;
// }

// export const queryOptionsMapper = <T extends AccountEntityBase | EntityBase>(filters: Array<IFilter<T, keyof T>>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): Array<FindOptionsWhere<T>> => {
//     let defaultWhereClause: FindOptionsWhere<T> = {};

//     if (accountId) {
//         const whereClause: FindOptionsWhere<AccountEntityBase> = { accountId: new Types.ObjectId(accountId) };
//         defaultWhereClause = { ...defaultWhereClause, ...(whereClause as FindOptionsWhere<T>) };
//     }

//     if (getOnlyActive) defaultWhereClause = { ...defaultWhereClause, ...({ active: true } as FindOptionsWhere<T>) };

//     if (dontGetDeleted) defaultWhereClause = { ...defaultWhereClause, ...({ deleted: false } as FindOptionsWhere<T>) };

//     return filters.reduce((state: Array<FindOptionsWhere<T>>, filter: IFilter<T, keyof T>) => {
//         filter.operator === FilterOperators.And && state.length ? state[0] = { ...state[0], ...queryMapper(filter) } : state.push(queryMapper(filter))
//         return state;
//     }, [defaultWhereClause])
// }


export const buildMongoQuery = <T extends AccountEntityBase | EntityBase>(fetchRequest: IFetchRequest<T>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): {query: RootFilterQuery<T>, skip: number, limit: number, sort: Record<string, 1 | -1>, populate: Array<string>} => {
    let query: FilterQuery<T> = {}
    let sortOptions: Record<string, 1 | -1> = {};
    let skip = 0;
    let limit = 10;
    const pagedRequest = fetchRequest.pagedListRequest;

    if (fetchRequest.queryOptionsRequest?.sortRequest) {
        for (const sortRequest of fetchRequest.queryOptionsRequest?.sortRequest.sort((a, b) => a.priority - b.priority)) {
            sortOptions[sortRequest.field as string] = sortRequest.direction === SortOrder.Ascending ? 1 : -1 ;
        }
    }
    
    query = mongoQueryOptionsMapper(fetchRequest.queryOptionsRequest?.filtersRequest ?? [], getOnlyActive, dontGetDeleted, accountId);
    if (pagedRequest) {
        skip = (pagedRequest.pageNo - 1) * pagedRequest.pageSize;
        limit = pagedRequest.pageSize;
    }

    return {query, limit, skip, sort: sortOptions, populate: fetchRequest.queryOptionsRequest?.includes ?? []};
}

export const mongoQueryOptionsMapper = <T extends AccountEntityBase | EntityBase>(filters: Array<IFilter<T, keyof T>>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): RootFilterQuery<T> => {
    let defaultWhereClause: FilterQuery<T> = {};

    if (accountId) {
        const whereClause: FilterQuery<T> = { accountId: new Types.ObjectId(accountId) };
        defaultWhereClause = { ...defaultWhereClause, ...whereClause };
    }

    if (getOnlyActive) defaultWhereClause = { ...defaultWhereClause, ...{ active: true } };

    if (dontGetDeleted) defaultWhereClause = { ...defaultWhereClause, ...{ deleted: false } };
    // defaultWhereClause.$or = [];
    let filter = filters.reduce((state: FilterQuery<T>, filter: IFilter<T, keyof T>) => {
        filter.operator === FilterOperators.And ? state = { ...state, ...mongoQueryMapper(filter) } : (state.$or ? state.$or.push(mongoQueryMapper(filter)) : state.$or = [mongoQueryMapper(filter)])
        return state;
    }, defaultWhereClause);
    return {...filter, ...defaultWhereClause}
}


const mongoQueryMapper = <T>(filterRequest: IFilter<T, keyof T>): FilterQuery<T> => {
    let whereClause: FilterQuery<T> = {};

    switch (filterRequest.matchMode) {
        case FilterMatchModes.Contains:
            whereClause = { $elementMatch: {[filterRequest.field]: filterRequest.value} };
            break;
        case FilterMatchModes.Equal:
            whereClause[filterRequest.field] = filterRequest.value;
            break;
        case FilterMatchModes.GreaterThan:
            whereClause[filterRequest.field] = { $gt: filterRequest.value };
            break;
        case FilterMatchModes.GreaterThanOrEqual:
            whereClause[filterRequest.field] = { $gte: filterRequest.value };
            break;
        case FilterMatchModes.LessThan:
            whereClause[filterRequest.field] = { $lt: filterRequest.value };
            break;
        case FilterMatchModes.LessThanOrEqual:
            whereClause[filterRequest.field] = { $lte: filterRequest.value };
            break;
        case FilterMatchModes.NotEqual:
            whereClause[filterRequest.field] = { $ne: filterRequest.value };
            break;
        case FilterMatchModes.Like:
            whereClause[filterRequest.field] = {$regex: (filterRequest.ignoreCase ? new RegExp(filterRequest.value as string, 'i') : new RegExp(filterRequest.value as string))};
            break;
        case FilterMatchModes.Any:
            whereClause[filterRequest.field] = {$not: {$size: 0}};
            break;
        case FilterMatchModes.Between:
            whereClause[filterRequest.field]= { $gte: filterRequest.rangeValues?.start, $lte:filterRequest.rangeValues?.end };
            break;
        case FilterMatchModes.In:
            whereClause[filterRequest.field] = { $in: (filterRequest.values as Array<T[keyof T]>) };
            break;
        case FilterMatchModes.NotIn:
            whereClause[filterRequest.field] = { $nin: (filterRequest.values as Array<T[keyof T]>) };
            break;
        default:
            break;
    }

    return whereClause;
}