---
to: <%= h.dataAccessLib(name) %>/<%= h.paramCase(name) %>.entity.ts
---
<%
className = h.singularCapitalized(name)
%>
export type <%= className %>Entity = {
    id?: string,
    
    // TODO: Add entity properties here

    createdAt?: string | null | undefined,
    updatedAt?: string | null | undefined,
};