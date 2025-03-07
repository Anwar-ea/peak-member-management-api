import { ILawFirmRequest, ILawFirmResponse, ITokenUser, ResponseInput } from "../models";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Schema } from "mongoose";
import { documentToEntityMapper, modelCreator } from "../utility";

export class LawFirm extends AccountEntityBase implements IToResponseBase<LawFirm, ILawFirmResponse> {
    name!: string;
    description?: string;
    
    
    toResponse(entity?: ResponseInput<LawFirm>): ILawFirmResponse {
        if(!entity) entity = this;
        return {
            ...super.toAccountResponseBase(entity),
            name: entity. name,
            description: entity.description
        }
    }

    toInstance(): LawFirm {
        return documentToEntityMapper<LawFirm>(new LawFirm, this);
    } ;

    toEntity = (entityRequest: ILawFirmRequest, id?: string, contextUser?: ITokenUser): LawFirm => {
        this.name = entityRequest.name;
        this.description = entityRequest.description;

        if(contextUser && !id){
            this.toAccountEntity(contextUser)
        }

        if(id && contextUser){
            this.toAccountEntity(contextUser, id)
        }
        
        return this;
    }
}

const lawFirmSchema =
  new Schema<LawFirm>({
    name: { type: String, required: true },
    description: { type: String },
  });

  lawFirmSchema.add(accountEntityBaseSchema)

  lawFirmSchema.loadClass(LawFirm);


export const lawFirmModel = modelCreator<LawFirm, ILawFirmResponse>("LawFirm", lawFirmSchema);