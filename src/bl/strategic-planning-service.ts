import { inject, injectable } from "tsyringe";
import { IStrategicPlanningService } from "./abstractions";
import { IStrategicPlanningRepository, IUserRepository } from "../dal";
import { FilterMatchModes, FilterOperators, IDataSourceResponse, IFetchRequest, IFilter, IStrategicPlanningRequest, IStrategicPlanningResponse, ITokenUser } from "../models";
import { StrategicPlanning } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";

@injectable()
export class StrategicPlanningService implements IStrategicPlanningService {
    constructor(
        @inject('StrategicPlanningRepository') private readonly strategicPlanningRepository: IStrategicPlanningRepository,
        @inject('UserRepository') private readonly userRepository: IUserRepository

    ) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<StrategicPlanning, keyof StrategicPlanning>>): Promise<IStrategicPlanningResponse | null> {
        return await this.strategicPlanningRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IStrategicPlanningRequest, contextUser?: ITokenUser): Promise<IStrategicPlanningResponse> {
        let strategicPlanning = new StrategicPlanning().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.strategicPlanningRepository.add(strategicPlanning);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IStrategicPlanningRequest[], contextUser: ITokenUser): Promise<IStrategicPlanningResponse[]> {
        return (await this.strategicPlanningRepository.addRange(entitesRequest.map<StrategicPlanning>(acc => {
            let strategicPlanning = new StrategicPlanning().toEntity(acc, undefined, contextUser);
            return strategicPlanning;
        }))).map(sp => sp.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<StrategicPlanning>): Promise<IDataSourceResponse<IStrategicPlanningResponse>> {
            let lawFirmFilter = {field: 'lawFirmId', values: [new Types.ObjectId(contextUser?.lawFirmId)], matchMode: FilterMatchModes.In, operator: FilterOperators.And};
            if(fetchRequest.queryOptionsRequest && fetchRequest.queryOptionsRequest.filtersRequest) fetchRequest.queryOptionsRequest.filtersRequest.push(lawFirmFilter);
            else fetchRequest.queryOptionsRequest = {
                ...fetchRequest.queryOptionsRequest, 
                filtersRequest: fetchRequest.queryOptionsRequest?.filtersRequest ? [...fetchRequest.queryOptionsRequest?.filtersRequest, lawFirmFilter] : [lawFirmFilter] } ;
        
        return await this.strategicPlanningRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IStrategicPlanningResponse | null> {
        return await this.strategicPlanningRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IStrategicPlanningRequest, contextUser: ITokenUser): Promise<IStrategicPlanningResponse> {
        let strategicPlanning = new StrategicPlanning().toEntity(entityRequest, id, contextUser);
        return await this.strategicPlanningRepository.update(id, strategicPlanning);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IStrategicPlanningRequest>, contextUser: ITokenUser): Promise<IStrategicPlanningResponse> {
        let entity: Partial<StrategicPlanning> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.strategicPlanningRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IStrategicPlanningRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.strategicPlanningRepository.updateRange(entitesRequest.map<StrategicPlanning>(acc => {
            let strategicPlanning = new StrategicPlanning().toEntity(acc, acc.id, contextUser);
            return strategicPlanning;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.strategicPlanningRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let strategicPlannings = await this.strategicPlanningRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(strategicPlannings.length !== ids.length) throw new Error(`Some strategic planning with provided ids not found`);

    }
}
