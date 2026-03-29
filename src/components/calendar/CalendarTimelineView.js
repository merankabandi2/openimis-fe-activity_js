import React, { useMemo, useState, useRef } from 'react';
import { Paper, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import CalendarEventBar from './CalendarEventBar';
import CalendarGroupHeader from './CalendarGroupHeader';

const ROW_HEIGHT = 36;
const LABEL_WIDTH = 250;

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    minHeight: 400,
    position: 'relative',
  },
  labelColumn: {
    width: LABEL_WIDTH,
    flexShrink: 0,
    borderRight: '1px solid #e0e0e0',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  labelRow: {
    height: ROW_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px 0 12px',
    borderBottom: '1px solid #f0f0f0',
    overflow: 'hidden',
  },
  labelText: {
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  timelineArea: {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
  },
  headerRow: {
    display: 'flex',
    borderBottom: '2px solid #e0e0e0',
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff',
    zIndex: 5,
  },
  monthHeader: {
    textAlign: 'center',
    borderRight: '1px solid #e0e0e0',
    padding: '4px 0',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#333',
    backgroundColor: '#f5f5f5',
  },
  weekHeader: {
    textAlign: 'center',
    borderRight: '1px solid #f0f0f0',
    padding: '2px 0',
    fontSize: '0.65rem',
    color: '#999',
  },
  bodyWrapper: {
    position: 'relative',
  },
  row: {
    height: ROW_HEIGHT,
    position: 'relative',
    borderBottom: '1px solid #f0f0f0',
  },
  todayLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#f44336',
    zIndex: 10,
    pointerEvents: 'none',
  },
  weekGridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#f0f0f0',
    pointerEvents: 'none',
  },
  monthGridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#e0e0e0',
    pointerEvents: 'none',
  },
  emptyMessage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    color: theme.palette.text?.secondary || '#999',
  },
  headerContainer: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    backgroundColor: '#fff',
  },
}));

function daysBetween(d1, d2) {
  const ms = d2.getTime() - d1.getTime();
  return Math.max(ms / (1000 * 60 * 60 * 24), 0);
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function generateWeeks(start, end) {
  const weeks = [];
  let current = getMonday(start);
  while (current < end) {
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weeks.push({
      start: new Date(current),
      end: weekEnd > end ? new Date(end) : weekEnd,
    });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

function generateMonths(start, end) {
  const months = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current < end) {
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const displayStart = current < start ? start : current;
    const displayEnd = monthEnd > end ? end : monthEnd;
    const days = daysBetween(displayStart, displayEnd) + 1;
    months.push({
      date: new Date(current),
      label: current.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      days,
    });
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }
  return months;
}

const PIXELS_PER_DAY = 8;

function CalendarTimelineView({
  groups,
  timelineStart,
  timelineEnd,
  getColor,
  onItemClick,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const bodyRef = useRef(null);
  const labelRef = useRef(null);

  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    (groups || []).forEach((g) => {
      initial[g.key] = true;
    });
    return initial;
  });

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalDays = useMemo(
    () => daysBetween(timelineStart, timelineEnd),
    [timelineStart, timelineEnd],
  );
  const timelineWidth = useMemo(
    () => Math.max(totalDays * PIXELS_PER_DAY, 800),
    [totalDays],
  );

  const months = useMemo(
    () => generateMonths(timelineStart, timelineEnd),
    [timelineStart, timelineEnd],
  );
  const weeks = useMemo(
    () => generateWeeks(timelineStart, timelineEnd),
    [timelineStart, timelineEnd],
  );

  const todayOffset = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today < timelineStart || today > timelineEnd) return null;
    return (daysBetween(timelineStart, today) / totalDays) * timelineWidth;
  }, [timelineStart, timelineEnd, totalDays, timelineWidth]);

  // Build flat list of visible rows
  const visibleRows = useMemo(() => {
    const rows = [];
    if (!groups || groups.length === 0) return rows;

    groups.forEach((group) => {
      rows.push({ type: 'group', ...group });
      if (expandedGroups[group.key] !== false) {
        (group.items || []).forEach((item) => {
          rows.push({ type: 'item', item });
        });
      }
    });
    return rows;
  }, [groups, expandedGroups]);

  const handleScroll = (e) => {
    if (labelRef.current) {
      labelRef.current.scrollTop = e.target.scrollTop;
    }
  };

  if (!groups || groups.length === 0) {
    return (
      <Paper variant="outlined">
        <Box className={classes.emptyMessage}>
          <Typography variant="body2">
            {formatMessage('calendar.noData')}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box className={classes.container}>
      {/* Label column */}
      <Box
        className={classes.labelColumn}
        ref={labelRef}
        style={{ overflow: 'hidden' }}
      >
        {/* Header spacer for month+week headers */}
        <Box style={{ height: 48, borderBottom: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' }} />
        {visibleRows.map((row, idx) => {
          if (row.type === 'group') {
            return (
              <CalendarGroupHeader
                key={`g-${row.key}`}
                label={row.label}
                count={(row.items || []).length}
                expanded={expandedGroups[row.key] !== false}
                onToggle={() => toggleGroup(row.key)}
              />
            );
          }
          return (
            <Box key={`r-${idx}`} className={classes.labelRow}>
              <Typography className={classes.labelText}>
                {row.item.name || row.item.code}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Timeline area */}
      <Box
        className={classes.timelineArea}
        onScroll={handleScroll}
      >
        {/* Month + Week headers */}
        <Box className={classes.headerContainer} style={{ width: timelineWidth }}>
          {/* Month row */}
          <Box style={{ display: 'flex' }}>
            {months.map((m, idx) => {
              const widthPx = (m.days / totalDays) * timelineWidth;
              return (
                <Box
                  key={idx}
                  className={classes.monthHeader}
                  style={{ width: widthPx, minWidth: widthPx }}
                >
                  {widthPx > 40 ? m.label : ''}
                </Box>
              );
            })}
          </Box>
          {/* Week row */}
          <Box style={{ display: 'flex', borderBottom: '2px solid #e0e0e0' }}>
            {weeks.map((w, idx) => {
              const startDay = daysBetween(timelineStart, w.start);
              const endDay = daysBetween(timelineStart, w.end) + 1;
              const widthPx = ((endDay - startDay) / totalDays) * timelineWidth;
              const weekNum = Math.ceil(
                (w.start.getTime() - new Date(w.start.getFullYear(), 0, 1).getTime())
                / (7 * 24 * 60 * 60 * 1000),
              ) + 1;
              return (
                <Box
                  key={idx}
                  className={classes.weekHeader}
                  style={{ width: widthPx, minWidth: widthPx }}
                >
                  {widthPx > 20 ? `S${weekNum}` : ''}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Body */}
        <Box className={classes.bodyWrapper} style={{ width: timelineWidth }}>
          {/* Grid lines for months */}
          {(() => {
            let cumDays = 0;
            return months.map((m, idx) => {
              cumDays += m.days;
              if (idx === months.length - 1) return null;
              const leftPx = (cumDays / totalDays) * timelineWidth;
              return (
                <Box
                  key={`ml-${idx}`}
                  className={classes.monthGridLine}
                  style={{ left: leftPx }}
                />
              );
            });
          })()}

          {/* Today line */}
          {todayOffset !== null && (
            <Box className={classes.todayLine} style={{ left: todayOffset }} />
          )}

          {/* Rows */}
          {visibleRows.map((row, idx) => {
            if (row.type === 'group') {
              return (
                <CalendarGroupHeader
                  key={`tg-${row.key}`}
                  label={row.label}
                  count={(row.items || []).length}
                  expanded={expandedGroups[row.key] !== false}
                  onToggle={() => toggleGroup(row.key)}
                />
              );
            }

            const item = row.item;
            const startDate = item.dateStart ? new Date(item.dateStart) : null;
            const endDate = item.dateEnd ? new Date(item.dateEnd) : null;

            if (!startDate || !endDate) return (
              <Box key={`tr-${idx}`} className={classes.row} />
            );

            const startOffset = daysBetween(timelineStart, startDate);
            const duration = Math.max(daysBetween(startDate, endDate), 1);
            const leftPx = (startOffset / totalDays) * timelineWidth;
            const widthPx = Math.max((duration / totalDays) * timelineWidth, 4);
            const color = getColor(item);

            return (
              <Box key={`tr-${idx}`} className={classes.row}>
                <CalendarEventBar
                  item={item}
                  color={color}
                  left={leftPx}
                  width={widthPx}
                  onClick={() => onItemClick && onItemClick(item)}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default CalendarTimelineView;
