import { IResponseBase } from "../../models/inerfaces/response/response-base";
import { ITokenUser, ResponseInput } from "../../models";
import { Schema, Types } from "mongoose";

export abstract class EntityBase {
    _id!: Types.ObjectId;
    createdAt!: Date;
    active!: boolean;
    createdBy!: string;
    createdById!: Types.ObjectId;
    modifiedAt?: Date;
    modifiedBy?: string;
    modifiedById?: Types.ObjectId;
    deleted!: boolean; 

    protected toBaseEntiy(contextUser: ITokenUser, id?: string): EntityBase {
            this.active = true;
            this.deleted = false;

        if(!id){
            this._id = new Types.ObjectId();
            this.createdAt = new Date();
            this.createdBy = contextUser.name;
            this.createdById = new Types.ObjectId(contextUser.id.length ? contextUser.id : undefined);
        }else {
            this._id = new Types.ObjectId(id);
            this.modifiedAt = new Date();
            this.modifiedBy = contextUser.name;
            this.modifiedById = new Types.ObjectId(contextUser.id);
        }

        return this;
    }
    
    protected toResponseBase<T extends EntityBase>(entity: ResponseInput<T>): IResponseBase {
        return {
            id: entity._id.toString(),
            active: entity.active,
            createdAt: entity.createdAt,
            createdBy: entity.createdBy,
            createdById: entity.createdById.toString(),
            modifiedAt: entity.modifiedAt,
            modifiedBy: entity.modifiedBy,
            modifiedById: entity.modifiedById ? entity.modifiedById?.toString() : undefined
        }
    }
}

export const entityBaseSchema = new Schema<EntityBase>({
    _id: { type: Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    createdById: { type: Schema.Types.ObjectId, required: true },
    modifiedAt: { type: Date },
    modifiedBy: { type: String },
    modifiedById: { type: Schema.Types.ObjectId },
    deleted: { type: Boolean, default: false },
});

entityBaseSchema.loadClass(EntityBase);
