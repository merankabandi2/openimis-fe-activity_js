import test from 'node:test';
import assert from 'node:assert/strict';

import { allocateFunding, ACTION_TYPE } from '../src/actions.js';
import reducer from '../src/reducer.js';
import { mutationWasRefused, MUTATION_STATUS } from '../src/utils/mutation-outcome.js';
import { mutationDispatch } from './support/mutation-dispatch.mjs';

const UUID = '00000000-0000-4000-8000-000000000001';
const REFUSAL = JSON.stringify([{
  message: 'Failed to process AllocateFundingMutation mutation',
  detail: "['Total funding (500000.00) exceeds budget total (400000.00) for ']",
}]);
const ALLOCATION = { sousActiviteId: UUID, fundingSourceId: UUID, amount: 500000 };

// Store state of the activity module after the mutation thunk ran, as
// ActivitePage reads it on the render where submittingMutation drops.
async function stateAfter(thunk, { respond, mutationLog }, initial) {
  const log = [];
  await mutationDispatch({ respond, mutationLog }, log)(thunk);
  return log.reduce((state, action) => reducer(state, action), initial ?? reducer(undefined, { type: '@@INIT' }));
}

const accepted = () => ({ payload: { data: { allocateFunding: { clientMutationId: 'x', internalId: null } } } });

test('ACT-CLOSE-0928-01: a refused allocation ends the mutation with a refused outcome, so the page does not refetch', async () => {
  const state = await stateAfter(allocateFunding(ALLOCATION, 'Ajouter source'), {
    respond: accepted,
    mutationLog: () => ({ status: MUTATION_STATUS.ERROR, error: REFUSAL }),
  });
  assert.equal(state.submittingMutation, false);
  assert.equal(mutationWasRefused(state.mutation), true);
  assert.deepEqual(state.mutation.outcome.messages, ["['Total funding (500000.00) exceeds budget total (400000.00) for ']"]);
});

test('ACT-CLOSE-0928-01: journalize resetting mutation.status does not hide the refusal', async () => {
  const state = await stateAfter(allocateFunding(ALLOCATION, 'Ajouter source'), {
    respond: accepted,
    mutationLog: () => ({ status: MUTATION_STATUS.ERROR, error: REFUSAL }),
  });
  state.mutation.status = 0;
  assert.equal(mutationWasRefused(state.mutation), true);
});

test('ACT-CLOSE-0928-01: a mutation refused at the GraphQL level also counts as refused', async () => {
  const state = await stateAfter(allocateFunding(ALLOCATION, 'Ajouter source'), {
    respond: () => ({ payload: { data: { allocateFunding: null }, errors: [{ message: 'boom' }] } }),
  });
  assert.equal(state.submittingMutation, false);
  assert.equal(mutationWasRefused(state.mutation), true);
});

test('ACT-CLOSE-0928-01: an accepted or unresolved allocation is not refused, so the page refetches', async () => {
  const ok = await stateAfter(allocateFunding(ALLOCATION, 'Ajouter source'), {
    respond: accepted,
    mutationLog: () => ({ status: MUTATION_STATUS.SUCCESS, error: null }),
  });
  assert.equal(ok.submittingMutation, false);
  assert.equal(mutationWasRefused(ok.mutation), false);

  const pending = await stateAfter(allocateFunding(ALLOCATION, 'Ajouter source'), {
    respond: accepted,
    mutationLog: () => ({ status: MUTATION_STATUS.RECEIVED }),
  });
  assert.equal(mutationWasRefused(pending.mutation), false);
});

test('ACT-CLOSE-0928-01: the next mutation request drops the previous refusal', async () => {
  const refused = await stateAfter(allocateFunding(ALLOCATION, 'Ajouter source'), {
    respond: accepted,
    mutationLog: () => ({ status: MUTATION_STATUS.ERROR, error: REFUSAL }),
  });
  const next = reducer(refused, {
    type: `${ACTION_TYPE.MUTATION}_REQ`,
    meta: { actionType: ACTION_TYPE.ALLOCATE_FUNDING, clientMutationId: 'y' },
  });
  assert.equal(mutationWasRefused(next.mutation), false);
});
