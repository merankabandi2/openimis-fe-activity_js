// Fake redux dispatch for mutation thunks: runs thunks, logs plain actions and
// answers the stub `graphql` descriptors. `mutationLogs` queries get
// `mutationLog(query)`, every other document gets `respond(query)`.
export function mutationDispatch({ respond = () => ({ payload: { data: {} } }), mutationLog = () => null } = {}, log = []) {
  const dispatch = async (action) => {
    if (typeof action === 'function') return action(dispatch);
    log.push(action);
    if (typeof action.payload === 'string' && action.type) {
      if (/mutationLogs/.test(action.payload)) {
        const node = mutationLog(action.payload);
        return { payload: { data: { mutationLogs: { edges: node ? [{ node }] : [] } } } };
      }
      return respond(action.payload);
    }
    return action;
  };
  return dispatch;
}

// Mutation document an action creator sends, the mutation succeeding at once.
export async function mutationDocument(thunk) {
  const log = [];
  const dispatch = mutationDispatch({
    respond: () => ({ payload: { data: {} } }),
    mutationLog: () => ({ status: 2 }),
  }, log);
  await dispatch(thunk);
  const sent = log.find((a) => typeof a.payload === 'string' && /^mutation/.test(a.payload.trim()));
  return sent?.payload;
}
