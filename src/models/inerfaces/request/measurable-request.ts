import { Goals, GoalUnits } from "../../enums/goals.enum"

export interface IMeasurableRequest {
    id?: string;
    name: string    
    unit: GoalUnits
    goal: Goals
    goalMetric?: number
    goalMetricRange?: { start: number, end: number }
    showAverage: boolean
    showCumulative: boolean
    applyFormula: boolean
    averageStartDate?: Date
    cumulativeStartDate?: Date
    formula?: string
    accountableId: string;
}