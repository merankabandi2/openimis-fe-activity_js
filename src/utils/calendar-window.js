const shiftYears = (date, years) => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
};

/**
 * Fiscal-year window of a PTBA that contains `anchor`: the PTBA's own
 * fiscal year (offset 0) or the same span shifted by whole years, so the
 * timeline can be moved year by year from the PTBA.
 */
export function fiscalWindow(fiscalYearStart, fiscalYearEnd, anchor) {
  const start = new Date(fiscalYearStart);
  const end = new Date(fiscalYearEnd);
  const at = new Date(anchor);
  let offset = at.getFullYear() - start.getFullYear();
  if (shiftYears(start, offset) > at) offset -= 1;
  return { start: shiftYears(start, offset), end: shiftYears(end, offset), offset };
}
