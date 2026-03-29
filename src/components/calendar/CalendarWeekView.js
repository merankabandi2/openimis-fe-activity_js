import React, { useMemo } from 'react';
import { Paper, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import CalendarEventChip from './CalendarEventChip';

const DAY_NAMES_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

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
    padding: theme.spacing(0.5, 1),
    textAlign: 'center',
    borderRight: '1px solid #e0e0e0',
    '&:last-child': {
      borderRight: 'none',
    },
  },
  headerDayName: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#333',
  },
  headerDate: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#666',
  },
  headerDateToday: {
    color: '#f44336',
    fontWeight: 700,
  },
  bodyRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    minHeight: 400,
  },
  dayColumn: {
    borderRight: '1px solid #f0f0f0',
    padding: theme.spacing(0.5),
    '&:last-child': {
      borderRight: 'none',
    },
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  dayColumnToday: {
    backgroundColor: '#fff3e0',
  },
  emptyMessage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    color: theme.palette.text?.secondary || '#999',
  },
}));

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
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

function CalendarWeekView({
  activities,
  weekStart,
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

  const days = useMemo(() => {
    const monday = getMonday(weekStart);
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      result.push(d);
    }
    return result;
  }, [weekStart]);

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
      {/* Header */}
      <Box className={classes.headerRow}>
        {days.map((date, idx) => {
          const isToday = isSameDay(date, today);
          return (
            <Box key={idx} className={classes.headerCell}>
              <Typography className={classes.headerDayName}>
                {DAY_NAMES_FR[idx]}
              </Typography>
              <Typography
                className={`${classes.headerDate} ${isToday ? classes.headerDateToday : ''}`}
              >
                {date.getDate()}/{date.getMonth() + 1}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Body */}
      <Box className={classes.bodyRow}>
        {days.map((date, idx) => {
          const isToday = isSameDay(date, today);
          const events = getEventsForDay(date);

          return (
            <Box
              key={idx}
              className={`${classes.dayColumn} ${isToday ? classes.dayColumnToday : ''}`}
            >
              {events.map((evt, eIdx) => (
                <CalendarEventChip
                  key={eIdx}
                  item={evt}
                  color={getColor(evt)}
                  onClick={() => onItemClick && onItemClick(evt)}
                />
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default CalendarWeekView;
