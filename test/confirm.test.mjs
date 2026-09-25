import test from 'node:test';
import assert from 'node:assert/strict';

import { confirmStep, newConfirmToken } from '../src/utils/confirm.js';

// CORE_CONFIRM / CORE_CONFIRM_CLEAR cases of the fe-core core reducer.
function core(state, action) {
  switch (action.type) {
    case 'CORE_CONFIRM':
      return { ...state, confirm: action.payload, confirmed: null };
    case 'CORE_CONFIRM_CLEAR': {
      const s = { ...state, confirmed: action.payload };
      delete s.confirm;
      return s;
    }
    default:
      return state;
  }
}

// A page whose components each open delete confirmations the way
// useOwnedConfirm does; every store change is followed by one confirmStep per
// component, as its effect on [confirm, confirmed] does.
function page(names) {
  let state = { confirmed: null };
  const deleted = [];
  const owners = Object.fromEntries(names.map((n) => [n, { token: newConfirmToken(), pending: null }]));
  const settle = () => Object.values(owners).forEach((o) => settleOne(o));
  const dispatch = (action) => { state = core(state, action); settle(); };
  function settleOne(o) {
    const step = confirmStep(o.pending, state.confirm, state.confirmed);
    o.pending = step.pending;
    if (step.run) step.run();
    if (step.answered) dispatch({ type: 'CORE_CONFIRM_CLEAR', payload: null });
  }
  return {
    deleted,
    state: () => state,
    askDelete(owner, item) {
      const o = owners[owner];
      o.pending = { token: o.token, action: () => deleted.push(item), opened: false };
      dispatch({ type: 'CORE_CONFIRM', payload: { title: 't', message: 'm', intent: o.token } });
    },
    answer: (ok) => dispatch({ type: 'CORE_CONFIRM_CLEAR', payload: ok }),
    otherConfirm: (intent) => dispatch({ type: 'CORE_CONFIRM', payload: { title: 't', message: 'm', intent } }),
  };
}

test('ACT-S15: a cancelled activite delete does not run when a sous-activite delete is confirmed', () => {
  const p = page(['activitePage', 'sousActiviteTable']);
  p.askDelete('activitePage', 'ACTIVITE');
  p.answer(false);
  p.askDelete('sousActiviteTable', 'sa:1');
  p.answer(true);
  assert.deepEqual(p.deleted, ['sa:1']);
});

test('ACT-S15: a cancelled allocation delete in one table does not run with another table\'s OK', () => {
  const p = page(['fundA', 'fundB']);
  p.askDelete('fundA', 'fundA:1');
  p.answer(false);
  p.askDelete('fundB', 'fundB:1');
  p.answer(true);
  assert.deepEqual(p.deleted, ['fundB:1']);
});

test('ACT-S15: a delete left pending is dropped when another component opens a confirm', () => {
  const p = page(['activitePage', 'sousActiviteTable']);
  p.askDelete('activitePage', 'ACTIVITE');
  p.askDelete('sousActiviteTable', 'sa:2');
  p.answer(true);
  assert.deepEqual(p.deleted, ['sa:2']);
});

test('ACT-S15: a delete is dropped when the session-expiry confirm replaces its dialog', () => {
  const p = page(['sousActiviteTable']);
  p.askDelete('sousActiviteTable', 'sa:1');
  p.otherConfirm('csrf_logout');
  p.answer(true);
  assert.deepEqual(p.deleted, []);
});

test('ACT-S15: after a confirmed delete the next confirm dialog stays open and runs once', () => {
  const p = page(['sousActiviteTable']);
  p.askDelete('sousActiviteTable', 'sa:1');
  p.answer(true);
  p.askDelete('sousActiviteTable', 'sa:2');
  assert.ok(p.state().confirm, 'second dialog is open');
  p.answer(true);
  assert.deepEqual(p.deleted, ['sa:1', 'sa:2']);
});

test('confirmStep keeps an action whose dialog is not shown yet', () => {
  const pending = { token: 'x', action: () => {}, opened: false };
  assert.deepEqual(confirmStep(pending, undefined, true), { pending, run: null, answered: false });
});

test('confirmStep drops an opened action closed by clearConfirm(null)', () => {
  const pending = { token: 'x', action: () => {}, opened: true };
  assert.deepEqual(confirmStep(pending, undefined, null), { pending: null, run: null, answered: true });
});

test('ACT-S15: an answered dialog leaves state.core.confirmed at null', () => {
  const ok = page(['sousActiviteTable']);
  ok.askDelete('sousActiviteTable', 'sa:1');
  ok.answer(true);
  assert.equal(ok.state().confirmed, null);
  const cancel = page(['sousActiviteTable']);
  cancel.askDelete('sousActiviteTable', 'sa:1');
  cancel.answer(false);
  assert.equal(cancel.state().confirmed, null);
});

test('confirmStep runs an opened action answered OK', () => {
  const action = () => {};
  assert.deepEqual(
    confirmStep({ token: 'x', action, opened: true }, undefined, true),
    { pending: null, run: action, answered: true },
  );
});

test('newConfirmToken gives each component instance its own intent', () => {
  assert.notEqual(newConfirmToken(), newConfirmToken());
});
