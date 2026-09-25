import test from 'node:test';
import assert from 'node:assert/strict';

import reducer from '../src/reducer.js';
import { decodeRelayId, decodeNestedIds } from '../src/utils/relay.js';

const relay = (type, pk) => Buffer.from(`${type}:${pk}`).toString('base64');
const UUID = (n) => `00000000-0000-4000-8000-00000000000${n}`;
const edges = (nodes) => ({ edges: nodes.map((node) => ({ node })) });

test('decodeRelayId returns the primary key of a relay id and leaves raw keys unchanged', () => {
  assert.equal(decodeRelayId(relay('ComposanteGQLType', UUID(1))), UUID(1));
  assert.equal(decodeRelayId(relay('IndicatorGQLType', 31)), '31');
  assert.equal(decodeRelayId(UUID(1)), UUID(1));
  assert.equal(decodeRelayId('31'), '31');
  assert.equal(decodeRelayId(null), null);
  assert.equal(decodeRelayId(decodeRelayId(relay('PTBAGQLType', UUID(2)))), UUID(2));
});

test('decodeNestedIds decodes ids at every depth and leaves other fields alone', () => {
  const node = {
    id: relay('ActiviteGQLType', UUID(1)),
    code: 'Q29tcG9zYW50ZUdRTFR5cGU6eA==',
    sousActivites: edges([{ id: relay('SousActiviteGQLType', UUID(2)), fundingAllocations: edges([{ id: relay('SousActiviteFundingGQLType', UUID(3)), fundingSource: { id: relay('FundingSourceGQLType', UUID(4)) } }]) }]),
  };
  const decoded = decodeNestedIds(node);
  assert.equal(decoded.id, UUID(1));
  assert.equal(decoded.code, node.code);
  const sa = decoded.sousActivites.edges[0].node;
  assert.equal(sa.id, UUID(2));
  assert.equal(sa.fundingAllocations.edges[0].node.id, UUID(3));
  assert.equal(sa.fundingAllocations.edges[0].node.fundingSource.id, UUID(4));
});

test('GET_PTBA stores raw keys for nested composantes, sous-composantes, activites and sous-activites', () => {
  const payload = {
    data: {
      ptba: edges([{
        id: relay('PTBAGQLType', UUID(1)),
        composantes: edges([{
          id: relay('ComposanteGQLType', UUID(2)),
          sousComposantes: edges([{
            id: relay('SousComposanteGQLType', UUID(3)),
            activites: edges([{ id: relay('ActiviteGQLType', UUID(4)), sousActivites: edges([{ id: relay('SousActiviteGQLType', UUID(5)) }]) }]),
          }]),
        }]),
      }]),
    },
  };
  const state = reducer(undefined, { type: 'ACTIVITY_GET_PTBA_RESP', payload });
  const composante = state.ptba.composantes.edges[0].node;
  const sousComposante = composante.sousComposantes.edges[0].node;
  const activite = sousComposante.activites.edges[0].node;
  assert.equal(state.ptba.id, UUID(1));
  assert.equal(composante.id, UUID(2));
  assert.equal(sousComposante.id, UUID(3));
  assert.equal(activite.id, UUID(4));
  assert.equal(activite.sousActivites.edges[0].node.id, UUID(5));
});

test('GET_ACTIVITE stores raw keys for sous-composante, sous-activites, allocations and indicators', () => {
  const payload = {
    data: {
      activite: edges([{
        id: relay('ActiviteGQLType', UUID(1)),
        sousComposante: { id: relay('SousComposanteGQLType', UUID(2)), composante: { id: relay('ComposanteGQLType', UUID(3)), ptba: { id: relay('PTBAGQLType', UUID(4)) } } },
        sousActivites: edges([{ id: relay('SousActiviteGQLType', UUID(5)), fundingAllocations: edges([{ id: relay('SousActiviteFundingGQLType', UUID(6)), fundingSource: { id: relay('FundingSourceGQLType', UUID(7)) } }]) }]),
        indicators: edges([{ id: relay('IndicatorGQLType', 31) }]),
      }]),
    },
  };
  const { activite } = reducer(undefined, { type: 'ACTIVITY_GET_ACTIVITE_RESP', payload });
  assert.equal(activite.sousComposante.id, UUID(2));
  assert.equal(activite.sousComposante.composante.ptba.id, UUID(4));
  const sa = activite.sousActivites.edges[0].node;
  assert.equal(sa.id, UUID(5));
  assert.equal(sa.fundingAllocations.edges[0].node.id, UUID(6));
  assert.equal(sa.fundingAllocations.edges[0].node.fundingSource.id, UUID(7));
  assert.equal(activite.indicators.edges[0].node.id, '31');
});

test('list payloads decode nested references used to match rows (executions, weekly entries)', () => {
  const executions = reducer(undefined, {
    type: 'ACTIVITY_GET_QUARTERLY_EXECUTIONS_RESP',
    payload: { data: { quarterlyExecution: edges([{ id: relay('QuarterlyExecutionGQLType', UUID(1)), sousActivite: { id: relay('SousActiviteGQLType', UUID(2)) } }]) } },
  });
  assert.equal(executions.quarterlyExecutions[0].sousActivite.id, UUID(2));
  const weekly = reducer(undefined, {
    type: 'ACTIVITY_GET_WEEKLY_PLAN_ENTRIES_RESP',
    payload: { data: { weeklyPlanEntry: edges([{ id: relay('WeeklyPlanEntryGQLType', UUID(1)), sousActivite: { id: relay('SousActiviteGQLType', UUID(3)) } }]) } },
  });
  assert.equal(weekly.weeklyPlanEntries[0].sousActivite.id, UUID(3));
});
