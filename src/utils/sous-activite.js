const QUANTITY_FIELDS = ['quantityT1', 'quantityT2', 'quantityT3', 'quantityT4', 'unitCost'];

const EDITABLE_TEXT_FIELDS = ['code', 'name', 'unit', 'dateStart', 'dateEnd', 'responsible', 'revisionComment'];

const EDITABLE_NUMBER_FIELDS = [
  'quantityInitial', 'quantityRevised', 'unitCostInitial', 'unitCostRevised',
  'budgetInitial', 'budgetRevised',
];

const num = (value) => parseFloat(value) || 0;

/**
 * Row added from « Ajouter une sous-activite ». The revised budget stays
 * empty (null) until a revision sets it.
 */
export const emptySousActiviteRow = () => ({
  id: null,
  code: '',
  name: '',
  unit: '',
  quantityT1: 0,
  quantityT2: 0,
  quantityT3: 0,
  quantityT4: 0,
  unitCost: 0,
  quantityInitial: 0,
  quantityRevised: 0,
  unitCostInitial: 0,
  unitCostRevised: 0,
  budgetInitial: 0,
  budgetRevised: null,
  dateStart: '',
  dateEnd: '',
  responsible: '',
  revisionStatus: 'INITIAL',
  revisionComment: '',
});

const sameNumber = (a, b) => num(a) === num(b);

/** True when a quarterly quantity or the unit cost differs from the stored line. */
export const quantitiesChanged = (row, original) => (
  !original || QUANTITY_FIELDS.some((f) => !sameNumber(row[f], original[f]))
);

/** Quarterly budgets and totals derived from quantities x unit cost. */
export function computedBudgets(row) {
  const uc = num(row.unitCost);
  const q = [1, 2, 3, 4].map((i) => num(row[`quantityT${i}`]));
  const b = q.map((qi) => qi * uc);
  return {
    quantityTotal: q.reduce((s, v) => s + v, 0),
    budgetT1: b[0],
    budgetT2: b[1],
    budgetT3: b[2],
    budgetT4: b[3],
    budgetTotal: b.reduce((s, v) => s + v, 0),
  };
}

/**
 * Budgets shown for a line: the stored values while its quantities and unit
 * cost are untouched (an imported line keeps its imported budget), the
 * values computed from quantities x unit cost once one of them is edited.
 */
export function displayedBudgets(row, original) {
  if (original && !quantitiesChanged(row, original)) {
    return {
      budgetT1: num(original.budgetT1),
      budgetT2: num(original.budgetT2),
      budgetT3: num(original.budgetT3),
      budgetT4: num(original.budgetT4),
      budgetTotal: num(original.budgetTotal),
    };
  }
  return computedBudgets(row);
}

/**
 * Update input for an existing line: its id and name (required by the
 * mutation input) plus the fields the user changed. Budget fields are
 * recomputed and sent only when a quarterly quantity or the unit cost
 * changed, so editing a label never rewrites the stored budget.
 */
export function sousActiviteUpdatePayload(row, original) {
  const payload = { id: row.id, name: row.name ?? original?.name ?? '' };
  EDITABLE_TEXT_FIELDS.forEach((f) => {
    if ((row[f] ?? '') !== (original?.[f] ?? '')) payload[f] = row[f] ?? '';
  });
  EDITABLE_NUMBER_FIELDS.forEach((f) => {
    if (row[f] !== '' && row[f] != null && !sameNumber(row[f], original?.[f])) payload[f] = String(num(row[f]));
  });
  if (quantitiesChanged(row, original)) {
    const budgets = computedBudgets(row);
    QUANTITY_FIELDS.forEach((f) => { payload[f] = String(num(row[f])); });
    Object.keys(budgets).forEach((f) => { payload[f] = String(budgets[f]); });
  }
  return payload;
}
