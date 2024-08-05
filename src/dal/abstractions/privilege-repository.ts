import { FindManyOptions } from "typeorm";
import { Privilege } from "../../entities";
import { IDataSourceResponse, IFetchRequest, IFilter, IPrivilegeResponse } from "../../models";
import { IRepositoryBase } from "./repository-base";

export interface IPrivilegeRepository {
    get(options: IFetchRequest<Privilege>, accountId?: string): Promise<IDataSourceResponse<IPrivilegeResponse>>;
    where(options: FindManyOptions<Privilege>): Promise<Array<Privilege>>;
    getOne(filtersRequest: Array<IFilter<Privilege, keyof Privilege>>): Promise<IPrivilegeResponse | null>;
    getById(id: string): Promise<IPrivilegeResponse | null>;
}