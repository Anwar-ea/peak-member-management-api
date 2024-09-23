import {model, Schema, Model} from "mongoose"
import { IExtendedMongoModel } from "../models";

export const modelCreator = <TEntity, TResponse> (entityName: string, schema: Schema): IExtendedMongoModel<TEntity, TResponse> => {
    return model<TEntity, IExtendedMongoModel<TEntity, TResponse>>(entityName, schema, entityName);
}

