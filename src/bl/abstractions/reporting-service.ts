import { IMeasurableReport, IReportTotals, ITokenUser } from "../../models";

export interface IReportingService {
    get(contextUser: ITokenUser, userId?: string): Promise<Array<IMeasurableReport>>;
    reportTotals(accountId: string): Promise<IReportTotals>;
}