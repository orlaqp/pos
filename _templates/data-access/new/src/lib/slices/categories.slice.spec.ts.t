---
to: <%= h.dataAccessLib(name) %>/slices/<%= h.plural(name) %>.slice.spec.ts
---
<%
plural = h.plural(name)
pluralUpper = h.pluralCapitalized(name)
className = h.singularCapitalized(name)
%>
import {
  fetch<%= pluralUpper %>,
  <%= pluralUpper %>Adapter,
  <%= pluralUpper %>Reducer,
} from './<%= plural %>.slice';

describe('<%= pluralUpper %> reducer', () => {
  it('should handle initial state', () => {
    const expected = <%= pluralUpper %>Adapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(<%= pluralUpper %>Reducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetch<%= pluralUpper %>', () => {
    let state = <%= plural %>Reducer(
      undefined,
      fetch<%= pluralUpper %>.pending(null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    );

    state = <%= plural %>Reducer(
      state,
      fetch<%= pluralUpper %>.fulfilled([{ id: 1 }], null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    );

    state = <%= plural %>Reducer(
      state,
      fetch<%= pluralUpper %>.rejected(new Error('Uh oh'), null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    );
  });
});
