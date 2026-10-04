import test from 'node:test';
import assert from 'node:assert/strict';

import {
  defaultExecutionPeriod, ptbaQuarterOf, ptbaQuarterRange, ptbaYearLabel, weeksOfPtbaQuarter,
} from '../src/utils/ptba-quarters.js';
import { fetchActivite } from '../src/actions.js';

const JULY = '2026-07-01';
const day = (y, m, d) => new Date(y, m - 1, d);
const iso = ({ start, end }) => [start, end].map((d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);

// mis#448: the quarters are those of the PTBA, T1 starting in the month of
// fiscal_year_start, as the backend dates the achievement (ptba_quarter_end).
test('the quarter of a date is counted from the PTBA fiscal_year_start', () => {
  assert.deepEqual(ptbaQuarterOf(day(2026, 10, 4), JULY), { quarter: 2, year: 2026 });
  assert.deepEqual(ptbaQuarterOf(day(2026, 7, 1), JULY), { quarter: 1, year: 2026 });
  assert.deepEqual(ptbaQuarterOf(day(2027, 3, 31), JULY), { quarter: 3, year: 2026 });
  assert.deepEqual(ptbaQuarterOf(day(2027, 6, 30), JULY), { quarter: 4, year: 2026 });
  assert.deepEqual(ptbaQuarterOf(day(2026, 6, 30), JULY), { quarter: 4, year: 2025 });
  assert.deepEqual(ptbaQuarterOf(day(2026, 10, 4), '2026-01-01'), { quarter: 4, year: 2026 });
  assert.deepEqual(ptbaQuarterOf(day(2026, 10, 4), null), { quarter: 4, year: 2026 });
});

test('a quarter covers three months from its PTBA start', () => {
  assert.deepEqual(iso(ptbaQuarterRange(2, 2026, JULY)), ['2026-10-1', '2026-12-31']);
  assert.deepEqual(iso(ptbaQuarterRange(3, 2026, JULY)), ['2027-1-1', '2027-3-31']);
  assert.deepEqual(iso(ptbaQuarterRange(1, 2026, '2026-02-01')), ['2026-2-1', '2026-4-30']);
});

test('the execution form opens on the PTBA year and today\'s PTBA quarter', () => {
  assert.deepEqual(defaultExecutionPeriod(day(2026, 10, 4), JULY), { year: 2026, quarter: 2 });
  assert.deepEqual(defaultExecutionPeriod(day(2027, 2, 1), JULY), { year: 2026, quarter: 3 });
  // A PTBA of another year opens on its T1.
  assert.deepEqual(defaultExecutionPeriod(day(2027, 10, 4), JULY), { year: 2026, quarter: 1 });
});

test('the PTBA year is labelled by its calendar years', () => {
  assert.equal(ptbaYearLabel(2026, JULY), '2026-2027');
  assert.equal(ptbaYearLabel(2026, '2026-01-01'), '2026');
});

test('the weeks of a PTBA quarter start on the Monday of its first day', () => {
  const weeks = weeksOfPtbaQuarter(1, 2026, '2026-02-01');
  assert.deepEqual([weeks[0].start, weeks[0].end], ['2026-01-26', '2026-01-30']);
  assert.equal(weeks[0].dateRange, '26/01 - 30/01');
  assert.deepEqual([weeks.at(-1).start, weeks.at(-1).end], ['2026-04-27', '2026-05-01']);
  const october = weeksOfPtbaQuarter(2, 2026, JULY);
  assert.deepEqual([october[0].start, october.at(-1).start], ['2026-09-28', '2026-12-28']);
  assert.equal(october.length, 14);
});

test('the activity query reads the PTBA fiscal year', () => {
  const { payload } = fetchActivite(null, ['id: "00000000-0000-4000-8000-000000000001"']);
  assert.match(payload, /ptba \{[^}]*fiscalYearStart[^}]*\}/);
});
