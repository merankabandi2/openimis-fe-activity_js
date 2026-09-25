// Minimal stand-in for the @openimis/fe-core helpers used by actions.js and
// reducer.js. Query/mutation formatting mirrors fe-core; `graphql` returns
// the document instead of dispatching it.
function entityAndFilters(entity, filters) {
  return `${entity}${filters && filters.length ? `(${filters.join(',')})` : ''}`;
}

function pageAndEdges(projections) {
  return `pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor} edges { node { ${projections.join(',')} } }`;
}

export const formatQuery = (entity, filters, projections) => `{ ${entityAndFilters(entity, filters)} ${projections ? `{ ${projections.join(',')} }` : ''} }`;
export const formatPageQuery = (entity, filters, projections) => `{ ${entityAndFilters(entity, filters)} { ${pageAndEdges(projections)} } }`;
export const formatPageQueryWithCount = (entity, filters, projections) => `{ ${entityAndFilters(entity, filters)} { totalCount ${pageAndEdges(projections)} } }`;

export function formatGQLString(str) {
  if (!str) return str;
  return str.replace(/["]/g, '\\"');
}

export function formatMutation(operationName, input, clientMutationLabel) {
  const clientMutationId = 'test-client-mutation-id';
  const payload = `mutation { ${operationName}(input: { clientMutationId: "${clientMutationId}" clientMutationLabel: "${clientMutationLabel}" ${input.trim()} }) { clientMutationId internalId } }`;
  return { clientMutationId, payload };
}

export function graphql(payload, type, params) {
  return { payload, type, params };
}

export function decodeId(id) {
  if (/^\d+$/.test(id)) return id;
  return atob(id).split(':')[1];
}

export function parseData(data) {
  if (!data) return [];
  return data.edges.map((e) => e.node);
}

export function pageInfo(data) {
  if (!data) return {};
  return { totalCount: data.totalCount, ...data.pageInfo };
}

export const formatGraphQLError = (payload) => (payload.errors ? { detail: payload.errors.map((e) => e.message).join('; ') } : null);
export const formatServerError = (payload) => ({ detail: payload?.statusText ?? null });
export const dispatchMutationReq = (state, action) => ({ ...state, submittingMutation: true, mutation: action.meta });
export const dispatchMutationResp = (state) => ({ ...state, submittingMutation: false });
export const dispatchMutationErr = (state) => ({ ...state, submittingMutation: false });
export const journalize = (mutation) => ({ type: 'CORE_MUTATION_ADD', payload: mutation });
export const fetchMutation = (clientMutationId) => ({ type: 'FETCH_MUTATION', clientMutationId });
export const coreAlert = (title, message, detail) => ({ type: 'CORE_ALERT', payload: { title, message, detail } });
