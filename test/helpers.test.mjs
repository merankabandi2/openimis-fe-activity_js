import test from 'node:test';
import assert from 'node:assert/strict';

import { collectAllPages } from '../src/utils/pagination.js';
import { enumLiteral, quarterNumber } from '../src/utils/gql-values.js';
import { currentIndicatorValue } from '../src/utils/indicators.js';
import { fiscalWindow } from '../src/utils/calendar-window.js';

test('collectAllPages stops on an error payload and returns it', async () => {
  const errorPayload = { errors: [{ message: 'x' }], data: { ptba: null } };
  assert.equal(await collectAllPages('ptba', async () => errorPayload), errorPayload);
});

test('ACT-B-D1 / ACT-D-N2: choice filters are sent as unquoted enum literals', () => {
  assert.equal(enumLiteral('DRAFT'), 'DRAFT');
  assert.equal(enumLiteral(1), 'A_1');
  assert.equal(enumLiteral('3'), 'A_3');
  assert.equal(quarterNumber('A_2'), 2);
  assert.equal(quarterNumber(4), 4);
  assert.equal(quarterNumber(null), null);
});

test('ACT-S2: the current indicator value is the latest achievement by date then timestamp', () => {
  const indicator = {
    achievements: { edges: [
      { node: { achieved: '10.00', date: '2026-03-31', timestamp: '2026-04-02T10:00:00' } },
      { node: { achieved: '25.00', date: '2026-06-30', timestamp: '2026-07-01T10:00:00' } },
      { node: { achieved: '30.00', date: '2026-06-30', timestamp: '2026-07-05T10:00:00' } },
      { node: { achieved: '5.00', date: '2025-12-31', timestamp: '2026-08-01T10:00:00' } },
    ] },
  };
  assert.equal(currentIndicatorValue(indicator), 30);
  assert.equal(currentIndicatorValue({ achievements: { edges: [] } }), 0);
  assert.equal(currentIndicatorValue({}), 0);
});

test('DEF-E-05: the timeline window follows the anchor date year by year from the PTBA fiscal year', () => {
  const w0 = fiscalWindow('2026-07-01', '2027-06-30', new Date('2026-07-01'));
  assert.equal(w0.offset, 0);
  const next = fiscalWindow('2026-07-01', '2027-06-30', new Date('2027-08-15'));
  assert.equal(next.offset, 1);
  assert.equal(next.start.getUTCFullYear(), 2027);
  const prev = fiscalWindow('2026-07-01', '2027-06-30', new Date('2026-03-01'));
  assert.equal(prev.offset, -1);
  assert.equal(prev.end.getUTCFullYear(), 2026);
});
