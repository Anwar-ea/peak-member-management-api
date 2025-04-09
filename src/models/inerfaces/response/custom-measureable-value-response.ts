import { IMeasurableResponse } from "./measurable-response";
import { IAccountResponseBase } from "./response-base";

export interface ICustomMeasureableValueResponse extends IAccountResponseBase {
    value: number;
    measureableId: string;
    startOfWeek: Date;
    endOfWeek: Date;
    week: number;
    year: number;
    measureable?: IMeasurableResponse;
}