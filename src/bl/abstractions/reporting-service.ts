import { IMeasurableReport, ITokenUser } from "../../models";

export interface IReportingService {
    get(contextUser: ITokenUser, userId?: string): Promise<Array<IMeasurableReport>>;
}