/**
 * Maximum page size accepted by the backend relay connections
 * (GRAPHENE RELAY_CONNECTION_MAX_LIMIT).
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Reads a whole relay connection page by page.
 *
 * `fetchPage(after)` resolves to the GraphQL response payload of one page
 * (`{ data: { [entity]: connection }, errors }`). Pages are requested until
 * `pageInfo.hasNextPage` is false. The result is a single payload holding
 * every edge, or the first payload that carries errors or no connection.
 */
export async function collectAllPages(entity, fetchPage) {
  const edges = [];
  let after = null;
  let last = null;
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const payload = await fetchPage(after);
    const connection = payload?.data?.[entity];
    if (!payload || payload.errors?.length || !connection) return payload;
    edges.push(...(connection.edges || []));
    last = connection;
    const { hasNextPage, endCursor } = connection.pageInfo || {};
    if (!hasNextPage || !endCursor || endCursor === after) break;
    after = endCursor;
  }
  return { data: { [entity]: { ...last, edges } } };
}
