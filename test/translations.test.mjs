import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Right names the backend module declares (openimis-be-activity_py activity/apps.py DEFAULT_CONFIG).
const PERMS = [
  'gql_ptba_search_perms', 'gql_ptba_create_perms', 'gql_ptba_update_perms', 'gql_ptba_delete_perms',
  'gql_activity_search_perms', 'gql_activity_create_perms', 'gql_activity_update_perms',
  'gql_activity_delete_perms', 'gql_execution_report_perms', 'gql_execution_approve_perms',
  'gql_transition_perms', 'gql_dashboard_view_perms', 'gql_funding_manage_perms',
];

for (const lang of ['fr', 'en']) {
  test(`ACT-A-N6: ${lang} labels every activity right shown on the role screen`, () => {
    const messages = JSON.parse(readFileSync(new URL(`../src/translations/${lang}.json`, import.meta.url)));
    for (const perm of PERMS) {
      assert.ok(messages[`activity.${perm}`], `activity.${perm}`);
    }
  });
}
