import test from 'node:test';
import assert from 'node:assert/strict';

import { allocateFunding, createSousActivite, transitionActivity } from '../src/actions.js';
import reducer from '../src/reducer.js';
import { formatBIFAmount, formatDecimal } from '../src/utils/string-utils.js';
import { budgetEcart, effectiveBudget } from '../src/utils/budget.js';
import { emptySousActiviteRow, sousActiviteUpdatePayload } from '../src/utils/sous-activite.js';
import { mergeAllocationRows } from '../src/utils/funding.js';
import { mutationErrorMessages } from '../src/utils/mutation-outcome.js';
import { stopRowClick } from '../src/utils/events.js';
import { mutationDispatch, mutationDocument } from './support/mutation-dispatch.mjs';

const UUID = '00000000-0000-4000-8000-000000000001';
const spaces = (s) => s.replace(/\s/g, ' ');

const REFUSAL = JSON.stringify([{
  message: 'Failed to process AllocateFundingMutation mutation',
  detail: "['Total funding (99999.00) exceeds budget total (40000.00) for ']",
}]);

test('ACT-C-R1 / ACT-D-R4: a refused mutation opens the fe-core alert with the refusal detail', async () => {
  const log = [];
  const dispatch = mutationDispatch({
    respond: () => ({ payload: { data: { allocateFunding: { clientMutationId: 'x', internalId: null } } } }),
    mutationLog: () => ({ status: 1, error: REFUSAL }),
  }, log);
  const outcome = await dispatch(allocateFunding({ sousActiviteId: UUID, fundingSourceId: UUID, amount: 99999 }, 'Ajouter source'));
  assert.equal(outcome.status, 1);
  assert.deepEqual(outcome.messages, ["['Total funding (99999.00) exceeds budget total (40000.00) for ']"]);
  const alert = log.find((a) => a.type === 'CORE_ALERT');
  assert.ok(alert, 'no CORE_ALERT dispatched');
  assert.equal(alert.payload.title, 'Ajouter source');
  assert.deepEqual(alert.payload.message, outcome.messages);
});

test('ACT-D-R4: the page sees the mutation end only once its MutationLog outcome is read', async () => {
  const log = [];
  let polls = 0;
  const dispatch = mutationDispatch({
    respond: () => ({ payload: { data: { transitionActivity: { clientMutationId: 'x', internalId: null } } } }),
    mutationLog: () => { polls += 1; return polls < 3 ? { status: 0 } : { status: 1, error: '[{"message": "m", "detail": "Activity must have at least one sous-activite to be budgetised."}]' }; },
  }, log);
  const outcome = await dispatch(transitionActivity({ id: UUID }, 'BUDGETISE', 'c', 'Transition'));
  assert.equal(outcome.status, 1);
  assert.equal(polls, 3);
  const types = log.map((a) => a.type);
  const done = types.indexOf('ACTIVITY_TRANSITION_ACTIVITY_RESP');
  assert.ok(done > 0, 'no RESP dispatched');
  const lastPoll = log.map((a, i) => (typeof a.payload === 'string' && /mutationLogs/.test(a.payload) ? i : -1)).filter((i) => i >= 0).pop();
  assert.ok(done > lastPoll, 'RESP dispatched before the outcome was read');
  assert.ok(log.find((a) => a.type === 'CORE_ALERT'));
});

test('ACT-D-R4: an accepted mutation opens no alert', async () => {
  const log = [];
  const dispatch = mutationDispatch({
    respond: () => ({ payload: { data: { allocateFunding: { clientMutationId: 'x', internalId: null } } } }),
    mutationLog: () => ({ status: 2, error: null }),
  }, log);
  const outcome = await dispatch(allocateFunding({ sousActiviteId: UUID, fundingSourceId: UUID, amount: 1 }, 'Ajouter source'));
  assert.equal(outcome.status, 2);
  assert.equal(log.find((a) => a.type === 'CORE_ALERT'), undefined);
  assert.ok(log.find((a) => a.type === 'ACTIVITY_ALLOCATE_FUNDING_RESP'));
});

test('ACT-D-R4: a GraphQL-level error ends the mutation and is shown', async () => {
  const log = [];
  const dispatch = mutationDispatch({
    respond: () => ({ payload: { errors: [{ message: 'Unknown argument' }], data: { allocateFunding: null } } }),
  }, log);
  const outcome = await dispatch(allocateFunding({ sousActiviteId: UUID, fundingSourceId: UUID, amount: 1 }, 'Ajouter source'));
  assert.equal(outcome.status, 1);
  assert.deepEqual(log.find((a) => a.type === 'CORE_ALERT').payload.message, ['Unknown argument']);
  const failed = log.find((a) => a.type === 'ACTIVITY_MUTATION_FAILED');
  assert.ok(failed);
  const submitting = reducer(undefined, { type: 'ACTIVITY_MUTATION_REQ', meta: { clientMutationId: 'x' } });
  assert.equal(submitting.submittingMutation, true);
  assert.equal(reducer(submitting, failed).submittingMutation, false);
});

test('mutationErrorMessages reads the MutationLog error list, detail first', () => {
  assert.deepEqual(mutationErrorMessages(REFUSAL), ["['Total funding (99999.00) exceeds budget total (40000.00) for ']"]);
  assert.deepEqual(mutationErrorMessages('[{"message": "only message"}]'), ['only message']);
  assert.deepEqual(mutationErrorMessages('not json'), ['not json']);
  assert.deepEqual(mutationErrorMessages(null), []);
});

test('ACT-C-R1: a refused new allocation row survives the activity refetch with its typed values', () => {
  const stored = [{ id: 'a1', fundingSource: { id: 'fs1' }, amount: '1000.00' }];
  const prev = [
    { id: 'a1', fundingSource: { id: 'fs1' }, amount: 1000 },
    { id: null, fundingSource: { id: 'fs2' }, amount: '99999', _isNew: true, _tempId: 'new-1', _error: 'refused' },
  ];
  const rows = mergeAllocationRows(stored, prev);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[1], prev[1]);
});

test('ACT-C-R1: a refused edit of a stored allocation keeps the typed amount after the refetch', () => {
  const stored = [{ id: 'a1', fundingSource: { id: 'fs1' }, amount: '1000.00' }];
  const prev = [{ id: 'a1', fundingSource: { id: 'fs1' }, amount: '50000', _error: 'refused' }];
  const rows = mergeAllocationRows(stored, prev);
  assert.equal(rows[0].amount, '50000');
  assert.equal(rows[0]._error, 'refused');
});

test('ACT-C-R1: rows without a pending failure are rebuilt from the stored allocations', () => {
  const stored = [{ id: 'a1', fundingSource: { id: 'fs1' }, amount: '1500.00' }];
  const rows = mergeAllocationRows(stored, [{ id: 'a1', fundingSource: { id: 'fs1' }, amount: 1000 }]);
  assert.deepEqual(rows, [{ id: 'a1', fundingSource: { id: 'fs1' }, amount: 1500 }]);
  assert.deepEqual(mergeAllocationRows(null, undefined), []);
});

test('ACT-C-R2 / DEF-F-R04: amounts and quantities keep their two stored decimals', () => {
  assert.equal(formatBIFAmount('0.10'), '0,1');
  assert.equal(formatBIFAmount('0.30'), '0,3');
  assert.equal(spaces(formatBIFAmount('1234.56')), '1 234,56');
  assert.equal(spaces(formatBIFAmount('40000.00')), '40 000');
  assert.equal(formatDecimal('0.75'), '0,75');
  assert.equal(formatDecimal('0.25'), '0,25');
  assert.equal(formatDecimal('2.50'), '2,5');
  assert.equal(formatDecimal(null), '');
  assert.equal(formatDecimal('abc'), '');
});

test('ACT-C-R3: a row action handler stops the click from reaching the row', () => {
  let stopped = 0;
  let ran = 0;
  stopRowClick(() => { ran += 1; })({ stopPropagation: () => { stopped += 1; } });
  assert.equal(stopped, 1);
  assert.equal(ran, 1);
});

test('ACT-D-R5: a new sous-activite row carries a code, and create sends it', async () => {
  const row = emptySousActiviteRow();
  assert.equal(row.code, '');
  const payload = await mutationDocument(createSousActivite({ ...row, code: 'SA-R0926', name: 'Atelier', activiteId: UUID }, 'x'));
  assert.match(payload, /code: "SA-R0926"/);
});

test('ACT-D-R5: editing the code of a stored line sends it', () => {
  const stored = { id: 'sa-1', name: 'Atelier', code: '' };
  assert.equal(sousActiviteUpdatePayload({ ...stored, code: 'SA-1' }, stored).code, 'SA-1');
});

test('DEF-E-R-01: a new sous-activite row sends no revised budget', async () => {
  const row = emptySousActiviteRow();
  assert.equal(row.budgetRevised, null);
  const payload = await mutationDocument(createSousActivite({ ...row, name: 'Atelier', activiteId: UUID }, 'x'));
  assert.doesNotMatch(payload, /budgetRevised/);
});

test('DEF-E-R-01: the calendar budget falls back to the total when the revised budget is 0 or missing', () => {
  assert.equal(effectiveBudget({ budgetRevised: '0.00', budgetTotal: '20000.00' }), 20000);
  assert.equal(effectiveBudget({ budgetRevised: null, budgetTotal: '6000.00' }), 6000);
  assert.equal(effectiveBudget({ budgetRevised: '15000.00', budgetTotal: '20000.00' }), 15000);
  assert.equal(effectiveBudget({ budgetRevised: '0.00', budgetTotal: '0.00' }), 0);
  assert.equal(effectiveBudget({}), 0);
});

test('DEF-F-R03: the Ecart of a line never revised is 0; a revision to 0 still shows minus the initial budget', () => {
  assert.equal(budgetEcart({ budgetRevised: null, budgetInitial: '5000.00' }), 0);
  assert.equal(budgetEcart({ budgetRevised: '', budgetInitial: '5000.00' }), 0);
  assert.equal(budgetEcart({ budgetRevised: '0.00', budgetInitial: '3000.00' }), -3000);
  assert.equal(budgetEcart({ budgetRevised: '6000.00', budgetInitial: '5000.00' }), 1000);
  assert.equal(budgetEcart({ budgetRevised: '0.00', budgetInitial: '0.00' }), 0);
});
