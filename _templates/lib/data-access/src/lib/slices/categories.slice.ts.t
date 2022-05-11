---
to: <%= h.dataAccessLib(name) %>/slices/<%= h.pluralParamCase(name) %>.slice.ts
---
<%
plural = h.plural(name)
pluralUpper = h.pluralCapitalized(name)
className = h.singularCapitalized(name)
allCaps = name.toUpperCase()
paramCase = h.paramCase(name)
%>
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    Dictionary,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { <%= className %>Entity } from '../<%= paramCase %>.entity';
import { <%= className %>Service } from '../<%= paramCase %>.service';

export const <%= allCaps %>_FEATURE_KEY = '<%= plural %>';

export interface <%= pluralUpper %>State extends EntityState< <%= className %>Entity > {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: <%= className %>Entity;
  filterQuery?: string;
  filteredList?: Dictionary< <%= className %>Entity >;
}

export const <%= plural %>Adapter = createEntityAdapter< <%= className %>Entity >();

export const fetch<%= pluralUpper %> = createAsyncThunk(
  '<%= plural %>/fetchStatus',
  async (_, thunkAPI) => {
    const <%= plural %> = await <%= className %>Service.getAll();
    return <%= plural %>.map(c => ({
        id: c.id,
        
        // TODO: Assign rest of properties here

        createdAt: c.createdAt,
        updatedAt: c.updatedAt
    }))
  }
);

export const initial<%= pluralUpper %>State: <%= pluralUpper %>State =
  <%= plural %>Adapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined
  });

export const <%= plural %>Slice = createSlice({
  name: <%= allCaps %>_FEATURE_KEY,
  initialState: initial<%= pluralUpper %>State,
  reducers: {
    add: (state: <%= pluralUpper %>State, action: PayloadAction< <%= className %>Entity >) =>{
        <%= plural %>Adapter.addOne(state, action);
        filterList(state, state.filterQuery);
    },
    remove: (state: <%= pluralUpper %>State, action: PayloadAction< EntityId >) => {
        <%= plural %>Adapter.removeOne(state, action);
        filterList(state, state.filterQuery);
    },
    update: (state: <%= pluralUpper %>State, action: PayloadAction<Update< <%= className %>Entity>>) => {
        <%= plural %>Adapter.updateOne(state, action);
        filterList(state, state.filterQuery);
    },
    select: (state: <%= pluralUpper %>State, action: PayloadAction< <%= className %>Entity >) => {
        state.selected = action.payload;
    },
    clearSelection: (state: <%= pluralUpper %>State) => {
        state.selected = undefined;
    },
    filter: (state: <%= pluralUpper %>State, action: PayloadAction<string>) => {
        filterList(state, action.payload);
        state.filterQuery = action.payload;
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetch<%= pluralUpper %>.pending, (state: <%= pluralUpper %>State) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetch<%= pluralUpper %>.fulfilled,
        (state: <%= pluralUpper %>State, action: PayloadAction< <%= className %>Entity[] >) => {
          <%= plural %>Adapter.setAll(state, action.payload);
          filterList(state, state.filterQuery);
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetch<%= pluralUpper %>.rejected, (state: <%= pluralUpper %>State, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const <%= plural %>Reducer = <%= plural %>Slice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(<%= plural %>Actions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const <%= plural %>Actions = <%= plural %>Slice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAll<%= pluralUpper %>);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = <%= plural %>Adapter.getSelectors();

export const get<%= pluralUpper %>State = (rootState: RootState): <%= pluralUpper %>State =>
  rootState[<%= allCaps %>_FEATURE_KEY];

export const selectAll<%= pluralUpper %> = createSelector(
  get<%= pluralUpper %>State,
  selectAll
);

export const select<%= pluralUpper %>Entities = createSelector(
  get<%= pluralUpper %>State,
  selectEntities
);

export const selectLoadingStatus = createSelector(
    get<%= pluralUpper %>State,
    (state: <%= pluralUpper %>State) => state.loadingStatus
)

export const selectIsEmpty = createSelector(
    get<%= pluralUpper %>State,
    (state: <%= pluralUpper %>State) => state.ids.length === 0
)

export const selectFilteredList = createSelector(
    get<%= pluralUpper %>State,
    (state: <%= pluralUpper %>State) => state.filteredList
)




function filterList(state: <%= pluralUpper %>State, query?: string) {
    console.log('Query', query);
    
    const filteredList: Dictionary<<%= className %>Entity> = {};
    
    if (!query) {
        state.filteredList = state.entities;
        return;
    }

    const lowerQuery = query.toLowerCase();
    
    // const queryString = query || state.filterQuery;
    
    state.ids.forEach(id => {
        if (state.entities[id]?.name?.toLowerCase().indexOf(lowerQuery) === -1)
            return;

        filteredList[id] = state.entities[id];
    });

    state.filteredList = filteredList;
}

