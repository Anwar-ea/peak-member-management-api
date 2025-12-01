import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Schema, Types } from "mongoose";
import { documentToEntityMapper, modelCreator } from "../utility";
import { LawFirm } from "./law-firm";
import { IStrategicPlanningRequest, IStrategicPlanningResponse, IStrategicPlanningGoals, ITokenUser, ResponseInput } from "../models";


export class StrategicPlanning extends AccountEntityBase implements IToResponseBase<StrategicPlanning, IStrategicPlanningResponse> {
    lawFirmId!: Types.ObjectId;
    lawFirm?: LawFirm;
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
    
    toResponse(entity?: ResponseInput<StrategicPlanning>): IStrategicPlanningResponse {

        if(!entity) entity = this;

        return {
            ...super.toAccountResponseBase(entity),
            lawFirmId: entity.lawFirmId.toString(),
            lawFirm: entity.lawFirm ? entity.lawFirm.toResponse(entity.lawFirm) : undefined,
            coreValues: entity.coreValues,
            attorneyWhy: entity.attorneyWhy,
            lawfirmVision: entity.lawfirmVision,
            lawfirmMissionStatement: entity.lawfirmMissionStatement,
            grossRevenue: entity.grossRevenue,
            totalExpenses: entity.totalExpenses,
            numberOfOffices: entity.numberOfOffices,
            numberOfClientsInDb: entity.numberOfClientsInDb,
            numberOfProspectsInDb: entity.numberOfProspectsInDb,
            numberOfProfessionalContacts: entity.numberOfProfessionalContacts,
            numberOfHoursWorkedInAverageWeek: entity.numberOfHoursWorkedInAverageWeek,
            noOfWeeksWorkedInYear: entity.noOfWeeksWorkedInYear
        }
    }

    toInstance (): StrategicPlanning {
        return documentToEntityMapper<StrategicPlanning>(new StrategicPlanning, this)
    }
    
    toEntity = (entityRequest: IStrategicPlanningRequest, id?: string, contextUser?: ITokenUser): StrategicPlanning => {
        this.lawFirmId = new Types.ObjectId(entityRequest.lawFirmId);
        this.coreValues = entityRequest.coreValues;
        this.attorneyWhy = entityRequest.attorneyWhy;
        this.lawfirmVision = entityRequest.lawfirmVision;
        this.lawfirmMissionStatement = entityRequest.lawfirmMissionStatement;
        this.grossRevenue = entityRequest.grossRevenue;
        this.totalExpenses = entityRequest.totalExpenses;
        this.numberOfOffices = entityRequest.numberOfOffices;
        this.numberOfClientsInDb = entityRequest.numberOfClientsInDb;
        this.numberOfProspectsInDb = entityRequest.numberOfProspectsInDb;
        this.numberOfProfessionalContacts = entityRequest.numberOfProfessionalContacts;
        this.numberOfHoursWorkedInAverageWeek = entityRequest.numberOfHoursWorkedInAverageWeek;
        this.noOfWeeksWorkedInYear = entityRequest.noOfWeeksWorkedInYear;
        if(contextUser && !id){
            super.toAccountEntity(contextUser)
        }
        
        if(id && contextUser){
            super.toAccountEntity(contextUser, id)
        }

        return this;
    }
}




const strategicPlanningGoalsSchema = new Schema<IStrategicPlanningGoals>({
    lastYear: { type: Number, required: false },
    oneYear: { type: Number, required: false },
    threeYear: { type: Number, required: false },
});

export const strategicPlanningSchema = new Schema<StrategicPlanning>({
    lawFirmId: { type: Schema.Types.ObjectId, ref: 'LawFirm', required: true , unique: true},
    coreValues: [{ type: String, required: false }],
    attorneyWhy: { type: String, required: false },
    lawfirmVision: { type: String, required: false },
    lawfirmMissionStatement: { type: String, required: false },
    grossRevenue: { type: strategicPlanningGoalsSchema, required: false },
    totalExpenses: { type: strategicPlanningGoalsSchema, required: false },
    numberOfOffices: { type: strategicPlanningGoalsSchema, required: false },
    numberOfClientsInDb: { type: strategicPlanningGoalsSchema, required: false },
    numberOfProspectsInDb: { type: strategicPlanningGoalsSchema, required: false },
    numberOfProfessionalContacts: { type: strategicPlanningGoalsSchema, required: false },
    numberOfHoursWorkedInAverageWeek: { type: strategicPlanningGoalsSchema, required: false },
    noOfWeeksWorkedInYear: { type: strategicPlanningGoalsSchema, required: false },
});

strategicPlanningSchema.add(accountEntityBaseSchema)

strategicPlanningSchema.loadClass(StrategicPlanning);

strategicPlanningSchema.virtual('lawFirm', {
    ref: 'LawFirm',
    localField: 'lawFirmId',
    foreignField: '_id',
    justOne: true,
});

export const strategicPlanningModel = modelCreator<StrategicPlanning, IStrategicPlanningResponse>('StrategicPlanning', strategicPlanningSchema);
