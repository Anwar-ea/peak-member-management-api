import { FlattenMaps } from "mongoose";

export type ResponseInput<TEntity> = TEntity | FlattenMaps<TEntity>;