export interface IRevenueRequest {
    startOfWeek: Date;
    endOfWeek: Date;
    week: number;
    year: number;
    revenue: number
    userId: string;
}