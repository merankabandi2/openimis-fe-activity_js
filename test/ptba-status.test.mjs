import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { MODULE_NAME, PTBA_STATUS_LIST } from '../src/constants.js';
import { ptbaStatusMessageKey } from '../src/utils/ptba-status.js';

const messages = (lang) => JSON.parse(readFileSync(new URL(`../src/translations/${lang}.json`, import.meta.url)));

test('ACT-F-A-01: every PTBA status has a label in fr and en', () => {
  for (const lang of ['fr', 'en']) {
    const m = messages(lang);
    for (const status of PTBA_STATUS_LIST) {
      assert.ok(m[`${MODULE_NAME}.${ptbaStatusMessageKey(status)}`], `${lang} ${status}`);
    }
  }
});

test('ACT-F-A-01: the « Statut » field reads the French label, not the enum code', () => {
  const fr = messages('fr');
  const label = (status) => fr[`${MODULE_NAME}.${ptbaStatusMessageKey(status)}`];
  assert.equal(label('DRAFT'), 'Brouillon');
  assert.equal(label('CLOSED'), 'Cloture');
  assert.equal(label(undefined), 'Brouillon');
  assert.equal(label(null), 'Brouillon');
});
