import { quarterNumber } from './gql-values';

const num = (value) => parseFloat(value) || 0;
const rate = (actual, planned) => (planned ? (actual / planned) * 100 : 0);

/**
 * Filters of the execution tab query: every quarter of one year of an
 * activity. The quarter is selected client-side, because the backend types
 * the `quarter` filter as the QuarterlyExecutionQuarter enum.
 */
export const executionYearFilters = (activiteId, year) => [
  `sousActivite_Activite_Id: "${activiteId}"`,
  `year: ${year}`,
];

/** Executions of one quarter (1-4); `quarter` comes back as "A_<n>". */
export const executionsOfQuarter = (executions, quarter) => (
  (executions || []).filter((e) => quarterNumber(e.quarter) === quarter)
);

/**
 * One entry per reported quarter, aggregated over the sous-activites:
 * { quarter, reportedDate, tauxEngagement, tauxDecaissement, tauxRealisation },
 * the rates computed from the summed amounts and quantities.
 */
export function quarterSummaries(executions) {
  const byQuarter = {};
  (executions || []).forEach((e) => {
    const q = quarterNumber(e.quarter);
    if (!q) return;
    const s = byQuarter[q] || {
      quarter: q, reportedDate: null, prevu: 0, engage: 0, decaisse: 0, attendus: 0, realises: 0,
    };
    s.prevu += num(e.budgetPrevu);
    s.engage += num(e.budgetEngage);
    s.decaisse += num(e.budgetDecaisse);
    s.attendus += num(e.resultatsAttendus);
    s.realises += num(e.resultatsRealises);
    if (e.reportedDate && (!s.reportedDate || e.reportedDate > s.reportedDate)) s.reportedDate = e.reportedDate;
    byQuarter[q] = s;
  });
  return Object.values(byQuarter).map((s) => ({
    quarter: s.quarter,
    reportedDate: s.reportedDate,
    tauxEngagement: rate(s.engage, s.prevu),
    tauxDecaissement: rate(s.decaisse, s.prevu),
    tauxRealisation: rate(s.realises, s.attendus),
  }));
}

/** Current calendar quarter (1-4) of `date`. */
export const quarterOf = (date) => Math.floor(date.getMonth() / 3) + 1;
