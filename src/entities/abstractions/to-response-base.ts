import { ResponseInput } from "../../models";
import { AccountEntityBase } from "../base-entities/account-entity-base";
import { EntityBase } from "../base-entities/entity-base";

export interface IToResponseBase<TEntity extends (EntityBase | AccountEntityBase), TResponse>{
    toResponse: (entity?: ResponseInput<TEntity>) => TResponse;
    toInstance: () => TEntity;
}