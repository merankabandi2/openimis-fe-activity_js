import React from 'react';
import { Tooltip, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import { formatBIFAmount } from '../../utils/string-utils';

const useStyles = makeStyles(() => ({
  bar: {
    position: 'absolute',
    height: 24,
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 6,
    paddingRight: 6,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: '0.7rem',
    color: '#fff',
    fontWeight: 500,
    transition: 'opacity 0.15s',
    '&:hover': {
      opacity: 0.85,
      zIndex: 20,
    },
  },
  barLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.7rem',
    lineHeight: '24px',
  },
  tooltipContent: {
    padding: 4,
  },
  tooltipRow: {
    fontSize: '0.75rem',
    lineHeight: 1.6,
  },
  tooltipTitle: {
    fontWeight: 600,
    fontSize: '0.8rem',
    marginBottom: 4,
  },
}));

function CalendarEventBar({ item, color, left, width, onClick }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const activite = item.activite;
  const composante = activite?.sousComposante?.composante;
  const status = activite?.status || '';
  const source = item.source || '';

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR');
  };

  const tooltipContent = (
    <Box className={classes.tooltipContent}>
      <Typography className={classes.tooltipTitle}>
        {item.name || item.code}
      </Typography>
      {composante && (
        <Typography className={classes.tooltipRow}>
          {composante.name}
        </Typography>
      )}
      <Typography className={classes.tooltipRow}>
        {formatMessage(`status.${status}`)} | {source || '-'}
      </Typography>
      <Typography className={classes.tooltipRow}>
        {formatDate(item.dateStart)} - {formatDate(item.dateEnd)}
      </Typography>
      {item.responsible && (
        <Typography className={classes.tooltipRow}>
          {formatMessage('field.responsible')}: {item.responsible}
        </Typography>
      )}
      {(item.budgetTotal || item.budgetRevised) && (
        <Typography className={classes.tooltipRow}>
          Budget: {formatBIFAmount(item.budgetRevised || item.budgetTotal)} BIF
        </Typography>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow placement="top" interactive>
      <div
        className={classes.bar}
        style={{
          left,
          width,
          backgroundColor: color,
          top: 6,
        }}
        onClick={onClick}
      >
        <span className={classes.barLabel}>{item.name || item.code}</span>
      </div>
    </Tooltip>
  );
}

export default CalendarEventBar;
