import { Privilege } from "../../entities";
import { IDataSourceResponse, IFetchRequest, IFilter, IPrivilegeResponse } from "../../models";
import { ITokenUser } from "../../models/inerfaces/tokenUser";
import { IServiceBase } from "./service-base";

export interface IPrivilegeService {
    get(contextUser?: ITokenUser, fetchRequest?: IFetchRequest<Privilege>): Promise<IDataSourceResponse<IPrivilegeResponse>>;
    getOne(contextUser?: ITokenUser, filtersRequest?: Array<IFilter<Privilege, keyof Privilege>>): Promise<IPrivilegeResponse | null>;
    getById(id: string, contextUser?: ITokenUser): Promise<IPrivilegeResponse | null>;
}