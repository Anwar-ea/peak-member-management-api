
export interface IStrategicPlanningGoals{
    lastYear?: number;
    oneYear?: number;
    threeYear?: number;
} 

export interface IStrategicPlanningRequest {
    lawFirmId: string;
    coreValues?: Array<string>;
    attorneyWhy?: string;
    lawfirmVision?: string;
    lawfirmMissionStatement?: string;
    grossRevenue?: IStrategicPlanningGoals;
    totalExpenses?: IStrategicPlanningGoals;
    numberOfOffices?: IStrategicPlanningGoals;
    numberOfClientsInDb?: IStrategicPlanningGoals;
    numberOfProspectsInDb?: IStrategicPlanningGoals;
    numberOfProfessionalContacts?: IStrategicPlanningGoals;
    numberOfHoursWorkedInAverageWeek?: IStrategicPlanningGoals;
    noOfWeeksWorkedInYear?: IStrategicPlanningGoals;
}   