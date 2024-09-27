import { AnyARecord } from "dns";
import { IDataSourceResponse, IFetchRequest } from "../../models";
import { ReportResponse } from "../../models/inerfaces/response/report-response";

export interface IReportService {
    generateReport(fetxhRequest: IFetchRequest<any>): Promise<IDataSourceResponse<ReportResponse>>
}