import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ptbaPermissions, activityPermissions, canDeletePtbaFromList, ptbaDatesValid,
} from '../src/utils/permissions.js';

// Right sets of the UAT PTBA roles; the PTBA rights are 170014-170017.
const LECTURE = [170014, 170005, 170012];
const SAISIE = [170014, 170015, 170016, 170005, 170006, 170007];
const EXECUTION = [170014, 170005, 170009];
const ALL = Array.from({ length: 13 }, (_, i) => 170005 + i);
// Social_protection beneficiary rights only (e.g. « Responsable Transferts Monétaires »).
const BENEFICIARY = [170001, 170002, 170003, 170004];

test('ACT-S9: a search-only account can open an existing PTBA read-only', () => {
  const p = ptbaPermissions(LECTURE, { status: 'DRAFT' });
  assert.equal(p.canView, true);
  assert.equal(p.canSave, false);
  assert.equal(p.canDelete, false);
  assert.equal(p.canAddComposante, false);
  assert.equal(ptbaPermissions(LECTURE, null, true).canView, false);
});

test('ACT-S10 / ACT-B-D2 / ACT-B-D3: PTBA actions follow their own rights and a CLOSED PTBA is locked', () => {
  const draft = ptbaPermissions(SAISIE, { status: 'DRAFT' });
  assert.equal(draft.canSave, true);
  assert.equal(draft.canDelete, false);
  assert.equal(draft.canDeleteHierarchy, false);
  assert.equal(draft.canAddComposante, true);
  const closed = ptbaPermissions(ALL, { status: 'CLOSED' });
  assert.equal(closed.locked, true);
  for (const flag of ['canSave', 'canDelete', 'canTransition', 'canAddComposante', 'canEditHierarchy', 'canDeleteHierarchy', 'canAddActivite']) {
    assert.equal(closed[flag], false, flag);
  }
  assert.equal(canDeletePtbaFromList(ALL, { status: 'CLOSED' }), false);
  assert.equal(canDeletePtbaFromList(ALL, { status: 'DRAFT' }), true);
  assert.equal(canDeletePtbaFromList(SAISIE, { status: 'DRAFT' }), false);
});

test('ACT-S10: activity actions follow the rights the backend checks', () => {
  const saisie = activityPermissions(SAISIE, { status: 'EN_COURS' });
  assert.equal(saisie.canUpdateSousActivite, true);
  assert.equal(saisie.canDeleteSousActivite, false);
  assert.equal(saisie.canDecideRevision, false);
  assert.equal(saisie.canReportExecution, false);
  assert.equal(saisie.canManageFunding, false);
  const exec = activityPermissions(EXECUTION, { status: 'EN_COURS' });
  assert.equal(exec.canReportExecution, true);
  assert.equal(exec.canUpdateSousActivite, false);
  assert.equal(activityPermissions(EXECUTION, { status: 'BUDGETISE' }).canReportExecution, false);
  const cloture = activityPermissions(ALL, { status: 'CLOTURE' });
  assert.equal(cloture.canEdit, false);
  assert.equal(cloture.canManageFunding, false);
});

test('ACT-B-D5: a fiscal year may not end before it starts', () => {
  assert.equal(ptbaDatesValid('2026-12-31', '2026-01-01'), false);
  assert.equal(ptbaDatesValid('2026-01-01', '2026-12-31'), true);
  assert.equal(ptbaDatesValid('2026-01-01', '2026-01-01'), true);
  assert.equal(ptbaDatesValid('', '2026-01-01'), true);
});

test('ACT-S3: social_protection beneficiary rights 170001-170004 grant no PTBA action', () => {
  const p = ptbaPermissions(BENEFICIARY, { status: 'DRAFT' });
  for (const flag of ['canView', 'canSave', 'canDelete', 'canTransition', 'canAddComposante', 'canEditHierarchy', 'canDeleteHierarchy']) {
    assert.equal(p[flag], false, flag);
  }
  assert.equal(canDeletePtbaFromList(BENEFICIARY, { status: 'DRAFT' }), false);
  assert.equal(ptbaPermissions(BENEFICIARY, null, true).canView, false);
});

test('ACT-B-R3: an activity of a CLOSED PTBA cannot be edited, deleted or given sous-activites', () => {
  const underPtba = (status) => ({
    status: 'PLANIFIE',
    sousComposante: { composante: { ptba: { status } } },
  });
  const closed = activityPermissions(ALL, underPtba('CLOSED'));
  for (const flag of ['canEdit', 'canDelete', 'canCreateSousActivite', 'canUpdateSousActivite', 'canDeleteSousActivite']) {
    assert.equal(closed[flag], false, flag);
  }
  const active = activityPermissions(ALL, underPtba('ACTIVE'));
  for (const flag of ['canEdit', 'canDelete', 'canCreateSousActivite', 'canUpdateSousActivite', 'canDeleteSousActivite']) {
    assert.equal(active[flag], true, flag);
  }
});
