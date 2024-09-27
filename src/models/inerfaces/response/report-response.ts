import { IMeasurableResponse } from "./measurable-response";
import { IRevenueResponse } from "./revenue-response";
import { IUserResponse } from "./user-response";

export type ReportResponse = IUserResponse & {measureables: Array<IMeasurableResponse>, revenues: Array<IRevenueResponse & {label: string}>};