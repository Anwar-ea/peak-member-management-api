import { Schema, Types } from "mongoose";
import { ICustomMeasureableValueRequest, ICustomMeasureableValueResponse, ITokenUser, ResponseInput } from "../models";
import { documentToEntityMapper, modelCreator } from "../utility";
import { IToResponseBase } from "./abstractions/to-response-base";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { Measurable } from "./measureable";

export class CustomMeasureableValue extends AccountEntityBase implements IToResponseBase<CustomMeasureableValue, ICustomMeasureableValueResponse> {
    value!: number;
    measureableId!: Types.ObjectId;
    startOfWeek!: Date;
    endOfWeek!: Date;
    week!: number;
    year!: number;
    measureable?: Measurable;
    
    toInstance(): CustomMeasureableValue {
        return documentToEntityMapper<CustomMeasureableValue>(new CustomMeasureableValue, this);
    }

    toEntity(entityRequest: ICustomMeasureableValueRequest, id?: string, contextUser?: ITokenUser): CustomMeasureableValue {
        this.value = entityRequest.value;
        this.year = entityRequest.year;
        this.measureableId =  new Types.ObjectId(entityRequest.measureableId)
        this.week = entityRequest.week;
        this.startOfWeek = entityRequest.startOfWeek;
        this.endOfWeek = entityRequest.endOfWeek;
        if(contextUser && !id) {
            super.toAccountEntity(contextUser)
        }
        
        if(id && contextUser) {
            super.toAccountEntity(contextUser, id)
        }

        return this;
    }

    toResponse(entity?: ResponseInput<CustomMeasureableValue> | undefined): ICustomMeasureableValueResponse {
        if(!entity) entity = this;
        return {
            ...this.toAccountResponseBase(entity), 
            value: entity.value,
            week: entity.week,
            startOfWeek: entity.startOfWeek,
            endOfWeek: entity.endOfWeek,
            year: entity.year,
            measureableId: entity.measureableId.toString(),
            measureable: entity.measureable ? entity.measureable.toResponse(entity.measureable) : undefined,
        }
    }

}

const customMeasureableValueSchema = new Schema<CustomMeasureableValue>({
    value: {type: Number, required: true},
    week: {type: Number, required: true},
    year: {type: Number, required: true},
    startOfWeek: {type: Date, required: true},
    endOfWeek: {type: Date, required: true},
    measureableId: { type: Schema.Types.ObjectId, ref: 'Measureable' },
});

customMeasureableValueSchema.add(accountEntityBaseSchema)

customMeasureableValueSchema.loadClass(CustomMeasureableValue);

customMeasureableValueSchema.virtual('measureable', {
    ref: 'Measureable',
    localField: 'measureableId',
    foreignField: '_id',
    justOne: true,
});

export const customMeasureableValueModel = modelCreator<CustomMeasureableValue, ICustomMeasureableValueResponse>('CustomMeasureableValue', customMeasureableValueSchema);