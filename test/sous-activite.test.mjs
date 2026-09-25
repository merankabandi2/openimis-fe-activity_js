import test from 'node:test';
import assert from 'node:assert/strict';

import { displayedBudgets, sousActiviteUpdatePayload } from '../src/utils/sous-activite.js';

// Line as stored by import_ptba_revised: totals set, quarters left at 0.
const imported = {
  id: 'sa-1', name: 'Atelier', unit: 'atelier', responsible: '',
  quantityT1: '0.00', quantityT2: '0.00', quantityT3: '0.00', quantityT4: '0.00', unitCost: '1200.00',
  budgetT1: '0.00', budgetT2: '0.00', budgetT3: '0.00', budgetT4: '0.00', budgetTotal: '3600.00', quantityTotal: '3.00',
};

test('DEF-F-02: editing a label of an imported line sends no budget field', () => {
  const payload = sousActiviteUpdatePayload({ ...imported, responsible: 'Coordinateur' }, imported);
  assert.deepEqual(payload, { id: 'sa-1', name: 'Atelier', responsible: 'Coordinateur' });
});

test('DEF-F-02: editing a quarterly quantity recomputes and sends the budgets', () => {
  const payload = sousActiviteUpdatePayload({ ...imported, quantityT1: '3' }, imported);
  assert.equal(payload.quantityT1, '3');
  assert.equal(payload.budgetT1, '3600');
  assert.equal(payload.budgetTotal, '3600');
  assert.equal(payload.quantityTotal, '3');
});

test('DEF-F-02: an untouched imported line shows its stored budget, not quantities x unit cost', () => {
  assert.equal(displayedBudgets(imported, imported).budgetTotal, 3600);
  assert.equal(displayedBudgets({ ...imported, quantityT2: '1' }, imported).budgetTotal, 1200);
});
