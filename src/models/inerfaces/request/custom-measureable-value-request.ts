
export interface ICustomMeasureableValueRequest {
        value: number;
        measureableId: string;
        startOfWeek: Date;
        endOfWeek: Date;
        week: number;
        year: number;
}