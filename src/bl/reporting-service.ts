import { inject, injectable } from "tsyringe";
import { IDataSourceResponse, IFetchRequest, IFilter, ITokenUser } from "../models";
import { Notification } from "../entities/notification";
import { INotificationResponse } from "../models/inerfaces/response/notification-response";
import { IReportingService } from "./abstractions/reporting-service";
import { IMeasurableRepository } from "../dal";
import { IRevenueRepository } from "../dal/abstractions/revenue-repository";
import { Measurable } from "../entities";
import { RootFilterQuery } from "mongoose";
import moment from "moment";

@injectable()
export class ReportingService implements IReportingService {
    constructor(@inject('MeasurableRepository') private readonly measurableRepository: IMeasurableRepository,
                @inject('RevenueRepository') private readonly revenueRepository: IRevenueRepository) { }

    async get(): Promise<any> {
        const filter = { createdAt: moment().startOf('year') } as RootFilterQuery<Measurable>;
        return await this.measurableRepository.find(filter);
    }
}
