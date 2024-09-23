import { inject, injectable } from "tsyringe";
import { IMeasurableService } from "./abstractions";
import { IMeasurableRepository } from "../dal";
import { IDataSourceResponse, IFetchRequest, IFilter, IMeasurableRequest, IMeasurableResponse, ITokenUser } from "../models";
import { Measurable } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";

@injectable()
export class MeasurableService implements IMeasurableService {
    constructor(@inject('MeasurableRepository') private readonly measurableRepository: IMeasurableRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Measurable, keyof Measurable>>): Promise<IMeasurableResponse | null> {
        return await this.measurableRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IMeasurableRequest, contextUser?: ITokenUser): Promise<IMeasurableResponse> {
        let measurable = new Measurable().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.measurableRepository.add(measurable);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IMeasurableRequest[], contextUser: ITokenUser): Promise<IMeasurableResponse[]> {
        return (await this.measurableRepository.addRange(entitesRequest.map<Measurable>(acc => {
            let measurable = new Measurable().toEntity(acc, undefined, contextUser);
            return measurable;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<Measurable>): Promise<IDataSourceResponse<IMeasurableResponse>> {
        // fetchRequest.queryOptionsRequest = fetchRequest.queryOptionsRequest ? {...fetchRequest.queryOptionsRequest, includes:['User', 'MileStone']} :{includes:['User', 'MileStone']};
        return await this.measurableRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IMeasurableResponse | null> {
        return await this.measurableRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IMeasurableRequest, contextUser: ITokenUser): Promise<IMeasurableResponse> {
        let measurable = new Measurable().toEntity(entityRequest, id, contextUser);
        return await this.measurableRepository.update(id, measurable);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IMeasurableRequest>, contextUser: ITokenUser): Promise<IMeasurableResponse> {
        let entity: Partial<Measurable> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.measurableRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IMeasurableRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.measurableRepository.updateRange(entitesRequest.map<Measurable>(acc => {
            let measurable = new Measurable().toEntity(acc, acc.id, contextUser);
            return measurable;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.measurableRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let measurables = await this.measurableRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(measurables.length !== ids.length) throw new Error(`Some measurable with provided ids not found`);

    }
}
