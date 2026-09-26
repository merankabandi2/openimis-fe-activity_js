// Outcome of an openIMIS mutation as recorded in its MutationLog
// (core.MutationLog.status: 0 received, 1 error, 2 success).
export const MUTATION_STATUS = { RECEIVED: 0, ERROR: 1, SUCCESS: 2 };

const POLL_ATTEMPTS = 12;
const POLL_DELAY_MS = 250;

/**
 * Messages of a MutationLog error: a JSON list of { message, detail } (the
 * detail holds the reason, the message only names the mutation), or a raw
 * string.
 */
export function mutationErrorMessages(error) {
  if (!error) return [];
  let entries = error;
  if (typeof error === 'string') {
    try {
      entries = JSON.parse(error);
    } catch (e) {
      return [error];
    }
  }
  return (Array.isArray(entries) ? entries : [entries])
    .map((e) => (typeof e === 'string' ? e : e?.detail || e?.message))
    .filter(Boolean)
    .map(String);
}

/** Messages of a GraphQL response that carries `errors`. */
export const graphQLErrorMessages = (payload) => (payload?.errors || [])
  .map((e) => e?.message)
  .filter(Boolean);

/**
 * Reads the MutationLog of `clientMutationId` through fe-core's
 * fetchMutation until it leaves status 0 or the attempts run out; returns
 * the last node read (null when none was found).
 */
export async function pollMutationLog(dispatch, fetchMutation, clientMutationId, {
  attempts = POLL_ATTEMPTS,
  delayMs = POLL_DELAY_MS,
} = {}) {
  let node = null;
  for (let i = 0; i < attempts; i += 1) {
    if (i > 0) await new Promise((resolve) => { setTimeout(resolve, delayMs * i); });
    const response = await dispatch(fetchMutation(clientMutationId));
    node = response?.payload?.data?.mutationLogs?.edges?.[0]?.node ?? null;
    if (node && node.status !== MUTATION_STATUS.RECEIVED) break;
  }
  return node;
}
