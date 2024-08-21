export interface IMeasurableRequest {
    name: string    
    unit: string
    goal: number
    goalMetric: number
    showAverage: boolean
    showCumulative: boolean
    applyFormula: boolean
    averageStartDate?: Date
    cumulativeStartDate?: Date
    formula?: string
    accountableId: string;
}