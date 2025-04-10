import { IMeasurableResponse } from "./measurable-response";
import { IAccountResponseBase } from "./response-base";

export interface ICustomMeasurableValueResponse extends IAccountResponseBase {
    value: number;
    measurableId: string;
    startOfWeek: Date;
    endOfWeek: Date;
    week: number;
    year: number;
    measurable?: IMeasurableResponse;
}