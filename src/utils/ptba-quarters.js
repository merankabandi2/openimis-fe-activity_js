// Quarters of a PTBA, as the backend counts them (activity.signals.ptba_quarter_end):
// T1 starts on the first day of the month of fiscal_year_start, so for a
// July-June PTBA T1 = July to September. A PTBA year is named by the calendar
// year it starts in, the `year` of a quarterly execution. Without a
// fiscal_year_start the year runs from January.

const pad = (n) => String(n).padStart(2, '0');

// YYYY-MM-DD of a local date; toISOString() would shift it through UTC.
export const localDateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 0-based month in which the PTBA year starts.
function startMonth(fiscalYearStart) {
  if (!fiscalYearStart) return 0;
  return Number(String(fiscalYearStart).split('-')[1]) - 1;
}

/** { quarter (1-4), year } of the PTBA quarter containing `date`. */
export function ptbaQuarterOf(date, fiscalYearStart) {
  const months = date.getFullYear() * 12 + date.getMonth() - startMonth(fiscalYearStart);
  return { quarter: Math.floor((months % 12) / 3) + 1, year: Math.floor(months / 12) };
}

/** First and last day (local dates) of quarter 1-4 of the PTBA year `year`. */
export function ptbaQuarterRange(quarter, year, fiscalYearStart) {
  const first = startMonth(fiscalYearStart) + 3 * (quarter - 1);
  return { start: new Date(year, first, 1), end: new Date(year, first + 3, 0) };
}

/**
 * Period the execution form opens on: the PTBA's own year (today's year
 * without a fiscal_year_start) and, when today falls in it, today's quarter,
 * else T1.
 */
export function defaultExecutionPeriod(today, fiscalYearStart) {
  const year = fiscalYearStart ? Number(String(fiscalYearStart).split('-')[0]) : today.getFullYear();
  const current = ptbaQuarterOf(today, fiscalYearStart);
  return { year, quarter: current.year === year ? current.quarter : 1 };
}

/** "2026-2027" for a PTBA year across two calendar years, "2026" for one starting in January. */
export function ptbaYearLabel(year, fiscalYearStart) {
  return startMonth(fiscalYearStart) === 0 ? String(year) : `${year}-${year + 1}`;
}

/**
 * Working weeks (Monday to Friday) of a PTBA quarter, the first one holding
 * the quarter's first day: { weekNum, start, end, label, dateRange }.
 */
export function weeksOfPtbaQuarter(quarter, year, fiscalYearStart) {
  const weeks = [];
  if (!quarter || !year) return weeks;
  const { start, end } = ptbaQuarterRange(quarter, year, fiscalYearStart);
  const monday = new Date(start);
  const dayOfWeek = start.getDay();
  monday.setDate(start.getDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek));

  let weekNum = 1;
  while (monday <= end) {
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    weeks.push({
      weekNum,
      start: localDateString(monday),
      end: localDateString(friday),
      label: `Sem ${weekNum}`,
      dateRange: `${pad(monday.getDate())}/${pad(monday.getMonth() + 1)} - ${pad(friday.getDate())}/${pad(friday.getMonth() + 1)}`,
    });
    weekNum += 1;
    monday.setDate(monday.getDate() + 7);
  }
  return weeks;
}
