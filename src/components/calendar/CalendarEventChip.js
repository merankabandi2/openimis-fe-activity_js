import React from 'react';
import { Tooltip, Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import { formatBIFAmount } from '../../utils/string-utils';

const useStyles = makeStyles(() => ({
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '1px 6px',
    borderRadius: 8,
    fontSize: '0.65rem',
    fontWeight: 500,
    color: '#fff',
    cursor: 'pointer',
    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    marginBottom: 1,
    '&:hover': {
      opacity: 0.85,
    },
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
  tooltipContent: {
    padding: 4,
  },
  tooltipTitle: {
    fontWeight: 600,
    fontSize: '0.8rem',
    marginBottom: 4,
  },
  tooltipRow: {
    fontSize: '0.75rem',
    lineHeight: 1.6,
  },
}));

function CalendarEventChip({ item, color, onClick, compact }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const activite = item.activite;
  const status = activite?.status || '';

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
      <Typography className={classes.tooltipRow}>
        {formatMessage(`status.${status}`)} | {item.source || '-'}
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

  if (compact) {
    return (
      <Tooltip title={tooltipContent} arrow placement="top" interactive>
        <span
          className={classes.dot}
          style={{ backgroundColor: color }}
          onClick={onClick}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltipContent} arrow placement="top" interactive>
      <div
        className={classes.chip}
        style={{ backgroundColor: color }}
        onClick={onClick}
      >
        {item.name || item.code}
      </div>
    </Tooltip>
  );
}

export default CalendarEventChip;
