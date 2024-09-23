import { Model } from "mongoose";
import { ResponseInput } from "../types";

export interface IExtendedMongoModel<TEntity, TResponse> extends Model<TEntity> {
    toResponse: (entity: ResponseInput<TEntity>) => TResponse;
    toInstance: () => TEntity;
  }