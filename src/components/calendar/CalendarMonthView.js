import React, { useMemo } from 'react';
import { Paper, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import CalendarEventChip from './CalendarEventChip';

const DAY_NAMES_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const useStyles = makeStyles((theme) => ({
  root: {
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #e0e0e0',
  },
  headerCell: {
    padding: theme.spacing(0.5),
    textAlign: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#333',
  },
  weekRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    minHeight: 80,
  },
  dayCell: {
    borderRight: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    padding: 3,
    minHeight: 80,
    overflow: 'hidden',
    '&:last-child': {
      borderRight: 'none',
    },
  },
  dayCellOutside: {
    backgroundColor: '#fafafa',
  },
  dayCellToday: {
    backgroundColor: '#fff3e0',
  },
  dayNumber: {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: '#666',
    marginBottom: 2,
  },
  dayNumberToday: {
    color: '#f44336',
    fontWeight: 700,
  },
  eventsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    maxHeight: 60,
    overflow: 'hidden',
  },
  moreLabel: {
    fontSize: '0.6rem',
    color: '#999',
    paddingLeft: 2,
  },
  emptyMessage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    color: theme.palette.text?.secondary || '#999',
  },
}));

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0 in our grid
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const weeks = [];
  let currentDate = new Date(firstDay);
  currentDate.setDate(currentDate.getDate() - startDow);

  while (currentDate <= lastDay || weeks.length < 6) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
    if (currentDate > lastDay && weeks.length >= 4) break;
  }
  return weeks;
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}

function dateInRange(date, start, end) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  return d >= s && d <= e;
}

const MAX_VISIBLE_EVENTS = 3;

function CalendarMonthView({
  activities,
  year,
  month,
  getColor,
  onItemClick,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weeks = useMemo(() => getMonthGrid(year, month), [year, month]);

  const getEventsForDay = (date) => {
    if (!activities) return [];
    return activities.filter((a) => {
      if (!a.dateStart || !a.dateEnd) return false;
      return dateInRange(date, a.dateStart, a.dateEnd);
    });
  };

  if (!activities || activities.length === 0) {
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
    <Box className={classes.root}>
      {/* Day name headers */}
      <Box className={classes.headerRow}>
        {DAY_NAMES_FR.map((name) => (
          <Box key={name} className={classes.headerCell}>
            {name}
          </Box>
        ))}
      </Box>

      {/* Week rows */}
      {weeks.map((week, wIdx) => (
        <Box key={wIdx} className={classes.weekRow}>
          {week.map((date, dIdx) => {
            const isCurrentMonth = date.getMonth() === month;
            const isToday = isSameDay(date, today);
            const events = getEventsForDay(date);
            const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS);
            const moreCount = events.length - MAX_VISIBLE_EVENTS;

            return (
              <Box
                key={dIdx}
                className={`${classes.dayCell} ${!isCurrentMonth ? classes.dayCellOutside : ''} ${isToday ? classes.dayCellToday : ''}`}
              >
                <Typography
                  className={`${classes.dayNumber} ${isToday ? classes.dayNumberToday : ''}`}
                >
                  {date.getDate()}
                </Typography>
                <Box className={classes.eventsContainer}>
                  {visibleEvents.map((evt, idx) => (
                    <CalendarEventChip
                      key={idx}
                      item={evt}
                      color={getColor(evt)}
                      onClick={() => onItemClick && onItemClick(evt)}
                    />
                  ))}
                  {moreCount > 0 && (
                    <Typography className={classes.moreLabel}>
                      +{moreCount}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

export default CalendarMonthView;
