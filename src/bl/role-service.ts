import { inject, injectable } from "tsyringe";
import { IRoleRepository } from "../dal";
import { IRoleService } from "./abstractions";
import { IDataSourceResponse, IFetchRequest, IFilter, IRoleRequest, IRoleResponse } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { Role } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { IDropdownResponse } from "../models/inerfaces/response/dropdown-response";

@injectable()
export class RoleService implements IRoleService {
    constructor(@inject('RoleRepository') private readonly roleRepository: IRoleRepository){}

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Role, keyof Role>>): Promise<IRoleResponse | null> {
        return await this.roleRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IRoleRequest, contextUser?: ITokenUser): Promise<IRoleResponse> {
        let role = new Role().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.roleRepository.add(role);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IRoleRequest[], contextUser: ITokenUser): Promise<IRoleResponse[]> {
        return (await this.roleRepository.addRange(entitesRequest.map<Role>(acc => {
            let role = new Role().toEntity(acc, undefined, contextUser);
            return role;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<Role>): Promise<IDataSourceResponse<IRoleResponse>> {
        // fetchRequest.queryOptionsRequest = fetchRequest.queryOptionsRequest ? {...fetchRequest.queryOptionsRequest, includes:['User', 'MileStone']} :{includes:['User', 'MileStone']};
        return await this.roleRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IRoleResponse | null> {
        return await this.roleRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IRoleRequest, contextUser: ITokenUser): Promise<IRoleResponse> {
        let role = new Role().toEntity(entityRequest, id, contextUser);
        return await this.roleRepository.update(id, role);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IRoleRequest>, contextUser: ITokenUser): Promise<IRoleResponse> {
        let entity: Partial<Role> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.roleRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IRoleRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.roleRepository.updateRange(entitesRequest.map<Role>(acc => {
            let role = new Role().toEntity(acc, acc.id, contextUser);
            return role;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.roleRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let roles = await this.roleRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(roles.length !== ids.length) throw new Error(`Some role with provided ids not found`);

    }

    async dropdown(accountId: string): Promise<IDropdownResponse[]> {
        return await this.roleRepository.dropdown(accountId, ['name']);
    }
}