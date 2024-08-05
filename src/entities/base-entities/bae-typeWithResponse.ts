import { IToResponseBase } from "../abstractions/to-response-base";
import { AccountEntityBase } from "./account-entity-base";
import { EntityBase } from "./entity-base";

export type BaseType<TEntity extends (EntityBase | AccountEntityBase), TResponse> = TEntity & IToResponseBase<TEntity, TResponse>;