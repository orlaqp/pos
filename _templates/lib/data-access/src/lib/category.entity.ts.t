---
to: <%= h.dataAccessLib(name) %>/<%= h.paramCase(name) %>.entity.ts
---
<%
className = h.singularCapitalized(name)
%>
export type <%= className %>Entity = {
    id?: string;
    
    // TODO: Add entity properties here

    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class <%= className %>EntityMapper {
    static fromModel(x: <%= className %>): <%= className %>Entity {
        return {
            id: x.id,
            
            // TODO: Add the rest of the properties here

            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
        };
    }
}


