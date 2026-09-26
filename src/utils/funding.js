const storedRow = (a) => ({
  id: a.id,
  fundingSource: a.fundingSource,
  amount: parseFloat(a.amount || 0),
});

/**
 * Rows of the funding allocation table after the allocations are (re)loaded:
 * one row per stored allocation, except that a stored row whose last save was
 * refused (`_error`) keeps the values the user typed, followed by the rows
 * not yet stored (`_isNew`: unsaved, being saved, or refused).
 */
export function mergeAllocationRows(allocations, previousRows) {
  const previous = previousRows || [];
  const refused = {};
  previous.forEach((r) => { if (r.id && r._error) refused[r.id] = r; });
  const rows = (allocations || []).map((a) => refused[a.id] || storedRow(a));
  return [...rows, ...previous.filter((r) => r._isNew)];
}
