const storedRow = (a) => ({
  id: a.id,
  fundingSource: a.fundingSource,
  amount: parseFloat(a.amount || 0),
});

/**
 * Rows of the funding allocation table each time `allocations` is passed in
 * (every render of the parent page): one row per stored allocation, except
 * that a stored row the user typed into (`_edited`) or whose last save was
 * refused (`_error`) keeps the values the user typed, followed by the rows
 * not yet stored (`_isNew`: unsaved, being saved, or refused).
 */
export function mergeAllocationRows(allocations, previousRows) {
  const previous = previousRows || [];
  const typed = {};
  previous.forEach((r) => { if (r.id && (r._edited || r._error)) typed[r.id] = r; });
  const rows = (allocations || []).map((a) => typed[a.id] || storedRow(a));
  return [...rows, ...previous.filter((r) => r._isNew)];
}
