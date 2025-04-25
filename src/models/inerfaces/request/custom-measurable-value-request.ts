
export interface ICustomMeasurableValueRequest {
        value: number;
        measurableId: string;
        startOfWeek: Date;
        endOfWeek: Date;
        week: number;
        year: number;
}