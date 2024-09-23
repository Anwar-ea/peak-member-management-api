import { Privilege } from "../../entities";
import { IDataSourceResponse, IFetchRequest, IFilter, IPrivilegeResponse } from "../../models";
import { HydratedDocument, ProjectionType, RootFilterQuery } from "mongoose";

export interface IPrivilegeRepository {
    findOneByIdWithResponse(id: string): Promise<IPrivilegeResponse | null>;
    getOneByQueryWithResponse(options: Array<IFilter<Privilege, keyof Privilege>>, getOnlyActive: boolean, dontGetDeleted: boolean, accountId?: string): Promise<IPrivilegeResponse | null>;
    find(options?: RootFilterQuery<Privilege>, projection?: ProjectionType<Privilege>): Promise<Array<HydratedDocument<Privilege>>>;
    getPagedData(fetchRequest: IFetchRequest<Privilege>, getOnlyActive: boolean, dontGetDeleted: boolean, accountId?: string): Promise<IDataSourceResponse<IPrivilegeResponse>>;
}