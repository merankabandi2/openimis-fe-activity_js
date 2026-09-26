const isBlank = (value) => value === null || value === undefined || value === '';

/**
 * Budget of a sous-activite: the revised budget when it is above 0, the
 * total budget otherwise. Stored lines created from the sous-activite table
 * can carry a revised budget of 0.00 that is not a revision.
 */
export function effectiveBudget(item) {
  const revised = parseFloat(item?.budgetRevised);
  if (revised > 0) return revised;
  return parseFloat(item?.budgetTotal) || 0;
}

/**
 * Revised minus initial budget. A line with no revised budget (null or
 * empty, e.g. imported by import_ptba_revised without a revision) keeps its
 * initial budget, so its Ecart is 0; a revised budget of 0 is a revision.
 */
export function budgetEcart(row) {
  const initial = parseFloat(row?.budgetInitial) || 0;
  if (isBlank(row?.budgetRevised)) return 0;
  return (parseFloat(row.budgetRevised) || 0) - initial;
}
