import { ILawFirmResponse } from "..";
import { IAccountResponseBase } from "./response-base";
interface IStrategicPlanningGoals{
    lastYear?: number;
    oneYear?: number;
    threeYear?: number;
} 

export interface IStrategicPlanningResponse extends IAccountResponseBase {
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
    lawFirmId: string;
    lawFirm?: ILawFirmResponse;
}