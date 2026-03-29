import React from 'react';
import { Paper, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import {
  MODULE_NAME,
  STATUS_COLORS,
  SOURCE_COLORS,
  REVISION_STATUS_COLORS,
  CALENDAR_COLOR_BY,
} from '../../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1, 2),
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.text?.secondary || '#666',
    marginRight: theme.spacing(1),
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 3,
    flexShrink: 0,
  },
  label: {
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
  },
}));

function CalendarLegend({ colorBy, colorMap }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const getLegendItems = () => {
    switch (colorBy) {
      case CALENDAR_COLOR_BY.STATUS:
        return Object.entries(STATUS_COLORS).map(([key, color]) => ({
          color,
          label: formatMessage(`status.${key}`),
        }));
      case CALENDAR_COLOR_BY.SOURCE:
        return Object.entries(SOURCE_COLORS).map(([key, color]) => ({
          color,
          label: key,
        }));
      case CALENDAR_COLOR_BY.REVISION:
        return Object.entries(REVISION_STATUS_COLORS).map(([key, color]) => ({
          color,
          label: formatMessage(`revision.${key}`),
        }));
      case CALENDAR_COLOR_BY.COMPOSANTE:
      case CALENDAR_COLOR_BY.RESPONSIBLE:
        return Object.entries(colorMap || {}).map(([key, color]) => ({
          color,
          label: key,
        }));
      default:
        return [];
    }
  };

  const items = getLegendItems();
  if (items.length === 0) return null;

  return (
    <Paper className={classes.root} variant="outlined">
      <Typography className={classes.title}>
        {formatMessage('calendar.legend')}
      </Typography>
      {items.map((item, idx) => (
        <Box key={idx} className={classes.item}>
          <div className={classes.swatch} style={{ backgroundColor: item.color }} />
          <Typography className={classes.label}>{item.label}</Typography>
        </Box>
      ))}
    </Paper>
  );
}

export default CalendarLegend;
