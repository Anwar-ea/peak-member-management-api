import { inject, injectable } from "tsyringe";
import { IMeasurableService } from "./abstractions";
import { IMeasurableRepository } from "../dal";
import { IDataSourceResponse, IFetchRequest, IFilter, IMeasurableRequest, IMeasurableResponse, ITokenUser } from "../models";
import { randomUUID } from "crypto";
import { In } from "typeorm";
import { Measurable } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";

@injectable()
export class MeasurableService implements IMeasurableService {
    constructor(@inject('MeasurableRepository') private readonly measurableRepository: IMeasurableRepository) { }

    async getOne(contextMeasurable: ITokenUser, filtersRequest: Array<IFilter<Measurable, keyof Measurable>>): Promise<IMeasurableResponse | null> {
        return await this.measurableRepository.getOne(filtersRequest)
    }

    async add(entityRequest: IMeasurableRequest, contextMeasurable?: ITokenUser): Promise<IMeasurableResponse> {
        let measurable = new Measurable().toEntity(entityRequest, undefined, contextMeasurable);
        let response  = await this.measurableRepository.addRecord(measurable);
        if (response) return response;
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IMeasurableRequest[], contextMeasurable: ITokenUser): Promise<IMeasurableResponse[]> {
        return this.measurableRepository.addMany(entitesRequest.map<Measurable>(acc => {
            let measurable = new Measurable().toEntity(acc, undefined, contextMeasurable);
            return measurable;
        }))
    }

    async get(contextMeasurable: ITokenUser, fetchRequest: IFetchRequest<Measurable>): Promise<IDataSourceResponse<IMeasurableResponse>> {
        // fetchRequest.queryOptionsRequest = fetchRequest.queryOptionsRequest ? {...fetchRequest.queryOptionsRequest, includes:['User', 'MileStone']} :{includes:['User', 'MileStone']};
        return await this.measurableRepository.get(fetchRequest);
    }

    async getById(id: string, contextMeasurable: ITokenUser): Promise<IMeasurableResponse | null> {
        return await this.measurableRepository.getById(id);
    }

    async update(id: string, entityRequest: IMeasurableRequest, contextMeasurable: ITokenUser): Promise<IMeasurableResponse> {
        let measurable = new Measurable().toEntity(entityRequest, id, contextMeasurable);
        return await this.measurableRepository.updateRecord(measurable);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IMeasurableRequest>, contextUser: ITokenUser): Promise<IMeasurableResponse> {
        let entity: Partial<Measurable> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.measurableRepository.partialUpdate(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IMeasurableRequest & { id: string; })[], contextMeasurable: ITokenUser): Promise<IMeasurableResponse[]> {
        return this.measurableRepository.updateMany(entitesRequest.map<Measurable>(acc => {
            let measurable = new Measurable().toEntity(acc, acc.id, contextMeasurable);
            return measurable;
        }))
    }

    async delete(id: string, contextMeasurable: ITokenUser): Promise<void> {
        let measurable = await this.measurableRepository.findOneById(id);
        if(measurable) await this.measurableRepository.deleteEntity(measurable);
        else throw new Error(`Measurable with id ${id} not found`);
    }

    async deleteMany(ids: string[], contextMeasurable: ITokenUser): Promise<void> {
        let measurables = await this.measurableRepository.where({where:{_id: In(ids)}});
        
        if(measurables.length !== ids.length) throw new Error(`Some measurable with provided ids not found`);

        await this.measurableRepository.deleteMany(measurables);
    }
}
