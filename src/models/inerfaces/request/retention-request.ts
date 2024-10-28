export interface IRetentionRequest {
    retained: number;
    appointments: number;
    userId: string;
    startOfWeek: Date;
    endOfWeek: Date;
    week: number;
    year: number;
}