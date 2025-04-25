import { Schema, Types } from "mongoose";
import { ICustomMeasurableValueRequest, ICustomMeasurableValueResponse, ITokenUser, ResponseInput } from "../models";
import { documentToEntityMapper, modelCreator } from "../utility";
import { IToResponseBase } from "./abstractions/to-response-base";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { Measurable } from "./measureable";

export class CustomMeasurableValue extends AccountEntityBase implements IToResponseBase<CustomMeasurableValue, ICustomMeasurableValueResponse> {
    value!: number;
    measurableId!: Types.ObjectId;
    startOfWeek!: Date;
    endOfWeek!: Date;
    week!: number;
    year!: number;
    measurable?: Measurable;
    
    toInstance(): CustomMeasurableValue {
        return documentToEntityMapper<CustomMeasurableValue>(new CustomMeasurableValue, this);
    }

    toEntity(entityRequest: ICustomMeasurableValueRequest, id?: string, contextUser?: ITokenUser): CustomMeasurableValue {
        this.value = entityRequest.value;
        this.year = entityRequest.year;
        this.measurableId =  new Types.ObjectId(entityRequest.measurableId)
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

    toResponse(entity?: ResponseInput<CustomMeasurableValue> | undefined): ICustomMeasurableValueResponse {
        if(!entity) entity = this;
        return {
            ...this.toAccountResponseBase(entity), 
            value: entity.value,
            week: entity.week,
            startOfWeek: entity.startOfWeek,
            endOfWeek: entity.endOfWeek,
            year: entity.year,
            measurableId: entity.measurableId.toString(),
            measurable: entity.measurable ? entity.measurable.toResponse(entity.measurable) : undefined,
        }
    }

}

const customMeasurableValueSchema = new Schema<CustomMeasurableValue>({
    value: {type: Number, required: true},
    week: {type: Number, required: true},
    year: {type: Number, required: true},
    startOfWeek: {type: Date, required: true},
    endOfWeek: {type: Date, required: true},
    measurableId: { type: Schema.Types.ObjectId, ref: 'Measurable' },
});

customMeasurableValueSchema.add(accountEntityBaseSchema)

customMeasurableValueSchema.loadClass(CustomMeasurableValue);

customMeasurableValueSchema.virtual('measurable', {
    ref: 'Measurable',
    localField: 'measurableId',
    foreignField: '_id',
    justOne: true,
});

export const customMeasurableValueModel = modelCreator<CustomMeasurableValue, ICustomMeasurableValueResponse>('CustomMeasurableValue', customMeasurableValueSchema);