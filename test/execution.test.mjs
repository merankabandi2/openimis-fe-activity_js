import test from 'node:test';
import assert from 'node:assert/strict';

import {
  executionYearFilters, executionsOfQuarter, quarterSummaries, quarterOf,
} from '../src/utils/execution.js';

const UUID = '00000000-0000-4000-8000-000000000001';

test('ACT-D-N2: the execution tab query sends no bare Int for the QuarterlyExecutionQuarter enum filter', () => {
  const filters = executionYearFilters(UUID, 2026);
  assert.deepEqual(filters, [`sousActivite_Activite_Id: "${UUID}"`, 'year: 2026']);
  assert.ok(!filters.some((f) => /quarter:\s*\d/.test(f)));
});

test('ACT-D-N2: executions are selected by quarter from the enum value the backend returns', () => {
  const rows = [{ id: 'a', quarter: 'A_1' }, { id: 'b', quarter: 'A_2' }, { id: 'c', quarter: 'A_1' }];
  assert.deepEqual(executionsOfQuarter(rows, 1).map((r) => r.id), ['a', 'c']);
  assert.deepEqual(executionsOfQuarter(null, 1), []);
});

test('ACT-D-N5: the timeline gets one summary per reported quarter, rates from summed amounts', () => {
  const rows = [
    { quarter: 'A_1', budgetPrevu: '1000', budgetEngage: '500', budgetDecaisse: '250', resultatsAttendus: '4', resultatsRealises: '1', reportedDate: '2026-04-01' },
    { quarter: 'A_1', budgetPrevu: '3000', budgetEngage: '1500', budgetDecaisse: '750', resultatsAttendus: '4', resultatsRealises: '3', reportedDate: '2026-04-03' },
    { quarter: 'A_3', budgetPrevu: '0', budgetEngage: '10', budgetDecaisse: '0', resultatsAttendus: '0', resultatsRealises: '0', reportedDate: null },
  ];
  const summaries = quarterSummaries(rows);
  const t1 = summaries.find((s) => s.quarter === 1);
  assert.equal(t1.tauxEngagement, 50);
  assert.equal(t1.tauxDecaissement, 25);
  assert.equal(t1.tauxRealisation, 50);
  assert.equal(t1.reportedDate, '2026-04-03');
  const t3 = summaries.find((s) => s.quarter === 3);
  assert.equal(t3.tauxEngagement, 0);
  assert.equal(summaries.length, 2);
});

test('quarterOf returns the calendar quarter', () => {
  assert.equal(quarterOf(new Date(2026, 0, 15)), 1);
  assert.equal(quarterOf(new Date(2026, 8, 25)), 3);
  assert.equal(quarterOf(new Date(2026, 11, 31)), 4);
});
