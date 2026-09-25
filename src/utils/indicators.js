const achievementTime = (a) => `${a.date || ''}|${a.timestamp || ''}`;

/**
 * Current value of an indicator: the `achieved` value of its most recent
 * achievement by date, then by timestamp (the rule the results-framework
 * service applies to manual achievements). 0 when there is none.
 */
export function currentIndicatorValue(indicator) {
  const achievements = (indicator?.achievements?.edges || []).map((e) => e.node).filter(Boolean);
  if (!achievements.length) return 0;
  const latest = achievements.reduce((best, a) => (achievementTime(a) > achievementTime(best) ? a : best));
  return parseFloat(latest.achieved) || 0;
}
