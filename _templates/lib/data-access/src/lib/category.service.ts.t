---
to: <%= h.dataAccessLib(name) %>/<%= h.paramCase(name) %>.service.ts
---
<%
plural = h.plural(name)
pluralParamCase = h.pluralParamCase(name)
className = h.singularCapitalized(name)
%>
import { <%= className %> } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { <%= plural %>Actions } from './slices/<%= pluralParamCase %>.slice';
import { <%= className %>Entity } from './<%= paramCase %>.entity';

export class <%= className %>Service {
    static async save(dispatch: Dispatch<any>, <%= name %>: <%= className %>Entity) {
        if (!<%= name %>.id) {
            const entity = new <%= className %>(<%= name %>);
            const res = await DataStore.save(entity);

            <%= name %>.id = res.id;

            return dispatch(<%= plural %>Actions.add(<%= name %>));
        }
        
        const existing = await DataStore.query(<%= className %>, <%= name %>.id);

        if (!existing) {
            return console.log(`It seems that <%= name %>: ${<%= name %>.id} has been removed`);
        }

        await DataStore.save(
            <%= className %>.copyOf(existing, updated => {
                // TODO: Update <%= name %> properties here
            })
        );
        
        return dispatch(<%= plural %>Actions.update({ id: <%= name %>.id, changes: <%= name %> }));
    }

    static getAll() {
        return DataStore.query(<%= className %>);
    }

    static async delete(id: string) {
        const item = await DataStore.query(<%= className %>, id);
        if (!item)
            return console.error(`<%= className %> Id: ${id} not found`);
        
        // TODO: Do any extra cleanup here like for example remove image
        // if (item.picture)
        //     AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }
}
