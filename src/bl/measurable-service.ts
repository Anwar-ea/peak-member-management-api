import { inject, injectable } from "tsyringe";
import { IMeasurableService } from "./abstractions";
import { IMeasurableRepository, IUserRepository, MeasurableRepository } from "../dal";
import { FilterMatchModes, FilterOperators, IDataSourceResponse, IFetchRequest, IFilter, IMeasurableRequest, IMeasurableResponse, ITokenUser } from "../models";
import { Measurable } from "../entities";
import { assignIn } from "lodash";
import { Types, AnyBulkWriteOperation } from "mongoose";
import { GoalUnits } from "../models/enums/goals.enum";

@injectable()
export class MeasurableService implements IMeasurableService {
    constructor(
        @inject('MeasurableRepository') private readonly measurableRepository: MeasurableRepository,
        @inject('UserRepository') private readonly userRepository: IUserRepository,
    ) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Measurable, keyof Measurable>>): Promise<IMeasurableResponse | null> {
        return await this.measurableRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IMeasurableRequest, contextUser?: ITokenUser): Promise<IMeasurableResponse> {
        let measurable = new Measurable().toEntity(entityRequest, undefined, contextUser);
        let highestMeasurable = (
            await this.measurableRepository.findOne(
                { accountableId: new Types.ObjectId(entityRequest.accountableId) },
                null,
                { priority: -1 }
            )
        )?.toInstance();
        measurable.priority = highestMeasurable ? highestMeasurable.priority + 1 : 0;
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
        if(contextUser.privileges.includes('lawFirmRelativeDataDashboard')) {
            let userIds = await this.userRepository.find({lawFirmId: new Types.ObjectId(contextUser?.lawFirmId)}, {'_id':1});
            let lawFirmFilter = {field: 'accountableId', values: userIds.map(x => x._id), matchMode: FilterMatchModes.In, operator: FilterOperators.And};
            if(fetchRequest.queryOptionsRequest && fetchRequest.queryOptionsRequest.filtersRequest) fetchRequest.queryOptionsRequest.filtersRequest.push(lawFirmFilter);
            else fetchRequest.queryOptionsRequest = {
                ...fetchRequest.queryOptionsRequest, 
                filtersRequest: fetchRequest.queryOptionsRequest?.filtersRequest ? [...fetchRequest.queryOptionsRequest?.filtersRequest, lawFirmFilter] : [lawFirmFilter] } ;
          }
        if(!contextUser.privileges.includes('canSeeRevenueDataMeasurables')){
            let revenueFilter: IFilter<Measurable, 'unit'> = {field: 'unit', value: GoalUnits.Revenue, matchMode: FilterMatchModes.NotEqual, operator: FilterOperators.And};
            if(fetchRequest.queryOptionsRequest && fetchRequest.queryOptionsRequest.filtersRequest) fetchRequest.queryOptionsRequest.filtersRequest.push(revenueFilter);
            else fetchRequest.queryOptionsRequest = {
                ...fetchRequest.queryOptionsRequest, 
                filtersRequest: fetchRequest.queryOptionsRequest?.filtersRequest ? [...fetchRequest.queryOptionsRequest?.filtersRequest, revenueFilter] : [revenueFilter] };
        }
  
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

    async toggleArchive(
        id: string,
        payload: { active: boolean },
        contextUser: ITokenUser
    ): Promise<void> {
        await this.measurableRepository.update(id, payload);
    }

    async updatePriority(
        id: string,
        newPriority: number,
        contextUser: ITokenUser
    ): Promise<void> {
        // Get the measurable being updated to find its accountableId
        const currentMeasurable = await this.measurableRepository.findOneById(id);
        if (!currentMeasurable) {
            throw new Error(`Measurable with id ${id} not found`);
        }

        if (!currentMeasurable.accountableId) {
            throw new Error(`Measurable with id ${id} does not have an accountableId`);
        }

        // Get all measurables for this accountableId sorted by current priority
        const accountableMeasurables = (
            await this.measurableRepository.find(
                { accountableId: currentMeasurable.accountableId },
                undefined,
                { sort: { priority: -1 } }
            )
        ).map((x) => x.toInstance());

        // Remove the current measurable from the list
        const otherMeasurables = accountableMeasurables.filter((measurable) => measurable._id?.toString() !== id);

        // Insert the current measurable at the new position (newPriority is the index)
        const reorderedMeasurables = [...otherMeasurables];
        reorderedMeasurables.splice(newPriority, 0, currentMeasurable);

        // Update all measurables with their new priorities (0-indexed)
        const bulkOps = reorderedMeasurables
            .reverse()
            .map<AnyBulkWriteOperation<Measurable>>((measurable, index) => ({
                updateOne: {
                    filter: { _id: measurable._id },
                    update: {
                        priority: index,
                        modifiedAt: new Date(),
                        modifiedBy: contextUser.name,
                        modifiedById: new Types.ObjectId(contextUser.id),
                    },
                },
            }));

        // Execute bulk update
        await this.measurableRepository.bulkWrite(bulkOps);
    }
}
