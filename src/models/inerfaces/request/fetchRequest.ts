import { PagedRequest } from "../../classes";
import { FilterMatchModes, FilterOperators, SortOrder } from "../../enums";

export interface IFetchRequest<T> {
    pagedListRequest?: PagedRequest;
    queryOptionsRequest?: IQueryOptions<T>;
}

export interface ISortRequest<T> {
    /**
     * Holds the name of the column to be sorted.
     */
    field: keyof T;

    /**
     * Holds the direction of sorting.
     */
    direction: SortOrder;

    /**
     * Holds the priority of sorting.
     */
    priority: number;
}

export interface IQueryOptions<T> {
    /**
     * Holds the filters' list that are going to be applied on query while fetching the records.
     */
    filtersRequest?: Array<IFilter<T, keyof T>>;

    /**
     * Holds the columns name their priority and direction of sorting that are going to be applied on query while fetching the records.
     */
    sortRequest?: Array<ISortRequest<T>>;

    /**
     * Holds the list of table names whose records are needed to be fetched along with current table's records.
     */
    includes?: string[];

    /**
     * Holds the list of the table names whose records are needed to be fetched along with included tables.
     */
    thenIncludes?: string[];
}

export interface IFilter<T, K extends keyof T> {
    /**
     * Holds the name of the column filter is going to be applied on.
     */
    field: K | string;

    /**
     * Holds the mode of the filter equal, not equal, less than or greater than etc.
     */
    matchMode: FilterMatchModes;

    /**
     * Holds the operator of the filter and or.
     */
    operator?: FilterOperators;

    /**
     * Holds the value against the filter is going to be applied.
     */
    value?: T[K];

    /**
     * Holds the value against the filter is going to be applied.
     */
    values?: Array<T[K]>;

    /**
     * Holds the range of values to be checked between
     */
    rangeValues?: {start:T[K], end: T[K]};

    /**
     * Holds the value whether case is needed to be ignored or not.
     */
    ignoreCase?: boolean;
}
