import test from 'node:test';
import assert from 'node:assert/strict';

import {
  allocateFunding,
  createPtba,
  updatePtba,
  fetchActivite,
  fetchCalendarActivities,
  fetchPtbaDashboard,
  fetchQuarterlyExecutions,
  fetchTransitionHistory,
} from '../src/actions.js';
import { mutationDocument } from './support/mutation-dispatch.mjs';

const UUID = '00000000-0000-4000-8000-000000000001';

// Runs thunks; answers the stub `graphql` descriptors with `respond(query)`.
function fakeDispatch(respond, log = []) {
  const dispatch = async (action) => {
    if (typeof action === 'function') return action(dispatch);
    log.push(action);
    if (typeof action.payload === 'string' && Array.isArray(action.type)) return respond(action.payload);
    return action;
  };
  return dispatch;
}

test('ACT-S8: allocateFunding sends no id argument (the input type has none)', async () => {
  const payload = await mutationDocument(allocateFunding({ id: UUID, sousActiviteId: UUID, fundingSourceId: UUID, amount: 10 }, 'x'));
  assert.doesNotMatch(payload, /\bid: "/);
  assert.match(payload, /sousActiviteId: "/);
  assert.match(payload, /fundingSourceId: "/);
});

test('ACT-S2: the activity query asks indicator achievements, not the missing currentValue field', () => {
  const { payload } = fetchActivite(null, [`id: "${UUID}"`]);
  assert.doesNotMatch(payload, /currentValue/);
  assert.match(payload, /achievements \{ edges \{ node \{ achieved date timestamp \} \} \}/);
});

test('ACT-D-N1: history and execution queries use UserGQLType.otherNames, not firstName', async () => {
  const history = fetchTransitionHistory(null, []).payload;
  const queries = [];
  const dispatch = fakeDispatch((query) => {
    queries.push(query);
    return { payload: { data: { quarterlyExecution: { edges: [], pageInfo: { hasNextPage: false } } } } };
  });
  await dispatch(fetchQuarterlyExecutions(null, []));
  const executions = queries[0];
  for (const q of [history, executions]) {
    assert.doesNotMatch(q, /firstName/);
    assert.match(q, /otherNames/);
  }
});

test('DEF-E-03: the dashboard asks budgetEngage for each composante', () => {
  const { payload } = fetchPtbaDashboard(null, [`ptbaId: "${UUID}"`]);
  const perf = /composantePerformance \{([^}]*)\}/.exec(payload)[1];
  assert.match(perf, /\bbudgetEngage\b/);
  assert.match(perf, /\btauxEngagement\b/);
});

test('DEF-E-01 / ACT-A-N3: the calendar reads every page with first <= 100 and merges the rows', async () => {
  const queries = [];
  const pages = {
    none: { data: { sousActivite: { totalCount: 150, pageInfo: { hasNextPage: true, endCursor: 'c1' }, edges: Array.from({ length: 100 }, (_, i) => ({ node: { id: `a${i}` } })) } } },
    c1: { data: { sousActivite: { totalCount: 150, pageInfo: { hasNextPage: false, endCursor: 'c2' }, edges: Array.from({ length: 50 }, (_, i) => ({ node: { id: `b${i}` } })) } } },
  };
  const log = [];
  const dispatch = fakeDispatch((query) => {
    queries.push(query);
    const after = /after: "([^"]+)"/.exec(query)?.[1] ?? 'none';
    return { payload: pages[after] };
  }, log);
  await dispatch(fetchCalendarActivities(null, [`activite_SousComposante_Composante_Ptba_Id: "${UUID}"`]));
  assert.equal(queries.length, 2);
  for (const q of queries) {
    const first = Number(/first: (\d+)/.exec(q)[1]);
    assert.ok(first <= 100, `first: ${first}`);
  }
  const success = log.find((a) => a.type === 'ACTIVITY_GET_CALENDAR_ACTIVITIES_RESP');
  assert.equal(success.payload.data.sousActivite.edges.length, 150);
  assert.ok(log.find((a) => a.type === 'ACTIVITY_GET_CALENDAR_ACTIVITIES_REQ'));
});

test('DEF-E-07: a GraphQL error on a page reaches the reducer as the list error', async () => {
  const log = [];
  const dispatch = fakeDispatch(() => ({ payload: { errors: [{ message: 'boom' }], data: { sousActivite: null } } }), log);
  await dispatch(fetchCalendarActivities(null, []));
  const success = log.find((a) => a.type === 'ACTIVITY_GET_CALENDAR_ACTIVITIES_RESP');
  assert.deepEqual(success.payload.errors, [{ message: 'boom' }]);
});

test('ACT-S12: PTBA create and update send no status (it changes only through transitions)', async () => {
  const ptba = { id: UUID, code: 'P', name: 'N', fiscalYearStart: '2026-01-01', fiscalYearEnd: '2026-12-31', status: 'ACTIVE' };
  for (const action of [createPtba({ ...ptba, id: null }, 'x'), updatePtba(ptba, 'x')]) {
    assert.doesNotMatch(await mutationDocument(action), /status:/);
  }
});
