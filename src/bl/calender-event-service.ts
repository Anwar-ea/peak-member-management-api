import { inject, injectable } from "tsyringe";
import { ICalenderEventRequest, ICalenderEventResponse, IDataSourceResponse, IFetchRequest, IFilter, ITokenUser } from "../models";
import { assignIn } from "lodash";
import { Types } from "mongoose";
import { ICalenderEventService } from "./abstractions";
import { ICalenderEventRepository } from "../dal";
import { CalenderEvent } from "../entities";

@injectable()
export class CalenderEventService implements ICalenderEventService {
    constructor(@inject('CalenderEventRepository') private readonly calenderEventRepository: ICalenderEventRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<CalenderEvent, keyof CalenderEvent>>): Promise<ICalenderEventResponse | null> {
        return await this.calenderEventRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: ICalenderEventRequest, contextUser?: ITokenUser): Promise<ICalenderEventResponse> {
        let calenderEvent = new CalenderEvent().toEntity(entityRequest, undefined, contextUser);
        let response  = await this.calenderEventRepository.add(calenderEvent);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: ICalenderEventRequest[], contextUser: ITokenUser): Promise<ICalenderEventResponse[]> {
        return (await this.calenderEventRepository.addRange(entitesRequest.map<CalenderEvent>(acc => {
            let calenderEvent = new CalenderEvent().toEntity(acc, undefined, contextUser);
            return calenderEvent;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<CalenderEvent>): Promise<IDataSourceResponse<ICalenderEventResponse>> {
        return await this.calenderEventRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<ICalenderEventResponse | null> {
        return await this.calenderEventRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: ICalenderEventRequest, contextUser: ITokenUser): Promise<ICalenderEventResponse> {
        let calenderEvent = new CalenderEvent().toEntity(entityRequest, id, contextUser);
        return await this.calenderEventRepository.update(id, calenderEvent);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<ICalenderEventRequest>, contextUser: ITokenUser): Promise<ICalenderEventResponse> {
        let entity: Partial<CalenderEvent> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.calenderEventRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (ICalenderEventRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.calenderEventRepository.updateRange(entitesRequest.map<CalenderEvent>(acc => {
            let calenderEvent = new CalenderEvent().toEntity(acc, acc.id, contextUser);
            return calenderEvent;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.calenderEventRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let revenues = await this.calenderEventRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(revenues.length !== ids.length) throw new Error(`Some calender event with provided ids not found`);

    }
}
