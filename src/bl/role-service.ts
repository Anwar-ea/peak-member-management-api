import { inject, injectable } from "tsyringe";
import { IRoleRepository } from "../dal";
import { IRoleService } from "./abstractions";
import { IDataSourceResponse, IFetchRequest, IFilter, IRoleRequest, IRoleResponse } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { randomUUID } from "crypto";
import { In } from "typeorm";
import { Role } from "../entities";
import { log } from "console";
import { assignIn } from "lodash";
import { Types } from "mongoose";

@injectable()
export class RoleService implements IRoleService {
    constructor(@inject('RoleRepository') private readonly roleRepository: IRoleRepository){}

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Role, keyof Role>>): Promise<IRoleResponse | null> {
        return await this.roleRepository.getOne(filtersRequest)
    }

    async add(entityRequest: IRoleRequest, contextUser: ITokenUser): Promise<IRoleResponse> {
        let role = new Role().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.roleRepository.addRecord(role);
        if (response) return response;
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IRoleRequest[], contextUser: ITokenUser): Promise<IRoleResponse[]> {
        return this.roleRepository.addMany(entitesRequest.map<Role>(acc => {
            let role = new Role().toEntity(acc, undefined, contextUser);
            return role;
        }))
    }

    async get(contextUser?: ITokenUser, fetchRequest: IFetchRequest<Role> = {}): Promise<IDataSourceResponse<IRoleResponse>> {
        let result = await this.roleRepository.get(fetchRequest, contextUser?.accountId);
        return result; 
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IRoleResponse | null> {
        return await this.roleRepository.getById(id);
    }

    async update(id: string, entityRequest: IRoleRequest, contextUser: ITokenUser): Promise<IRoleResponse> {
        let role = new Role().toEntity(entityRequest, id, contextUser);
        return await this.roleRepository.updateRecord(role);
    }

    async partialUpdate(id: string, partialEntity: Partial<IRoleRequest>, contextUser: ITokenUser): Promise<IRoleResponse> {
        let entity: Partial<Role> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.roleRepository.partialUpdate(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IRoleRequest & { id: string; })[], contextUser: ITokenUser): Promise<IRoleResponse[]> {
        return this.roleRepository.updateMany(entitesRequest.map<Role>(acc => {
            let role = new Role().toEntity(acc, acc.id, contextUser);
            return role;
        }))
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        let role = await this.roleRepository.findOneById(id);
        if(role) await this.roleRepository.deleteEntity(role);
        else throw new Error(`Role with id ${id} not found`);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let roles = await this.roleRepository.where({where:{_id: In(ids)}});
        
        if(roles.length !== ids.length) throw new Error(`Some role with provided ids not found`);

        await this.roleRepository.deleteMany(roles);
    }
}