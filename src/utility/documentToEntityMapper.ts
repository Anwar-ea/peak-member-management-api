import {assign, pick} from 'lodash';

export const documentToEntityMapper = <TEntity> (entity: TEntity, document: Object): TEntity => {
    assign(entity, pick(document, Object.keys(entity as Object)));
    return entity;
}

