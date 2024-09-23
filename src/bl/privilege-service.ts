import { inject, injectable } from "tsyringe";
import { IPrivilegeRepository } from "../dal";
import { IPrivilegeService } from "./abstractions";
import { IDataSourceResponse, IFetchRequest, IFilter, IPrivilegeResponse } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { Privilege } from "../entities";

@injectable()
export class PrivilegeService implements IPrivilegeService {

    constructor(@inject('PrivilegeRepository') private readonly privilegeRepository: IPrivilegeRepository){}

    getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Privilege, keyof Privilege>>): Promise<IPrivilegeResponse | null> {
        throw new Error("Method not implemented.");
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<Privilege>): Promise<IDataSourceResponse<IPrivilegeResponse>> {
        return await this.privilegeRepository.getPagedData(fetchRequest ?? {}, true, true);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IPrivilegeResponse | null> {
        return await this.privilegeRepository.findOneByIdWithResponse(id);
    }
}