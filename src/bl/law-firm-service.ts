import { inject, injectable } from "tsyringe";
import { ILawFirmService } from "./abstractions";
import { ILawFirmRepository } from "../dal";
import { IDataSourceResponse, IFetchRequest, IFilter, ILawFirmRequest, ILawFirmResponse, ITokenUser } from "../models";
import { LawFirm } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { IDropdownResponse } from "../models/inerfaces/response/dropdown-response";

@injectable()
export class LawFirmService implements ILawFirmService {
    constructor(@inject('LawFirmRepository') private readonly lawFirmRepository: ILawFirmRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<LawFirm, keyof LawFirm>>): Promise<ILawFirmResponse | null> {
        return await this.lawFirmRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: ILawFirmRequest, contextUser?: ITokenUser): Promise<ILawFirmResponse> {
        let lawFirm = new LawFirm().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.lawFirmRepository.add(lawFirm);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: ILawFirmRequest[], contextUser: ITokenUser): Promise<ILawFirmResponse[]> {
        return (await this.lawFirmRepository.addRange(entitesRequest.map<LawFirm>(acc => {
            let lawFirm = new LawFirm().toEntity(acc, undefined, contextUser);
            return lawFirm;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<LawFirm>): Promise<IDataSourceResponse<ILawFirmResponse>> {
        // fetchRequest.queryOptionsRequest = fetchRequest.queryOptionsRequest ? {...fetchRequest.queryOptionsRequest, includes:['User', 'MileStone']} :{includes:['User', 'MileStone']};
        return await this.lawFirmRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<ILawFirmResponse | null> {
        return await this.lawFirmRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: ILawFirmRequest, contextUser: ITokenUser): Promise<ILawFirmResponse> {
        let lawFirm = new LawFirm().toEntity(entityRequest, id, contextUser);
        return await this.lawFirmRepository.update(id, lawFirm);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<ILawFirmRequest>, contextUser: ITokenUser): Promise<ILawFirmResponse> {
        let entity: Partial<LawFirm> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.lawFirmRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (ILawFirmRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.lawFirmRepository.updateRange(entitesRequest.map<LawFirm>(acc => {
            let lawFirm = new LawFirm().toEntity(acc, acc.id, contextUser);
            return lawFirm;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.lawFirmRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let lawFirms = await this.lawFirmRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(lawFirms.length !== ids.length) throw new Error(`Some lawFirm with provided ids not found`);

    }

    async dropdown(accountId: string): Promise<IDropdownResponse[]> {
        return await this.lawFirmRepository.dropdown(accountId, ['name']);
    }

    async toggleArchive(
        id: string,
        payload: { active: boolean },
        contextUser: ITokenUser
    ): Promise<void> {
        await this.lawFirmRepository.update(id, payload);
    }
}
