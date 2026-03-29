import React from 'react';
import { useSelector } from 'react-redux';

import {
  Grid,
  Paper,
  Typography,
  Chip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import { formatBIFAmount } from '../../utils/string-utils';

const PTBA_STATUS_COLORS = {
  DRAFT: '#9e9e9e',
  APPROVED: '#1976d2',
  ACTIVE: '#388e3c',
  CLOSED: '#616161',
};

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  statusChip: {
    fontWeight: 'bold',
    marginLeft: theme.spacing(2),
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  kpiContainer: {
    display: 'flex',
    gap: theme.spacing(3),
    marginTop: theme.spacing(1),
  },
  kpiItem: {
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  kpiLabel: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
}));

function PTBAHeadPanel({ ptba }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!ptba) return null;

  const computeTotalBudget = () => {
    let total = 0;
    const composantes = ptba.composantes?.edges || [];
    composantes.forEach((compEdge) => {
      const comp = compEdge.node;
      const sousComposantes = comp.sousComposantes?.edges || [];
      sousComposantes.forEach((scEdge) => {
        const sc = scEdge.node;
        const activites = sc.activites?.edges || [];
        activites.forEach((actEdge) => {
          const act = actEdge.node;
          const sousActivites = act.sousActivites?.edges || [];
          sousActivites.forEach((saEdge) => {
            const sa = saEdge.node;
            total += parseFloat(sa.budgetTotal || 0);
          });
        });
      });
    });
    return total;
  };

  const totalBudget = computeTotalBudget();
  const statusColor = PTBA_STATUS_COLORS[ptba.status] || '#9e9e9e';

  return (
    <Paper className={classes.paper}>
      <div className={classes.headerRow}>
        <Typography variant="h5">
          {ptba.code} - {ptba.name}
        </Typography>
        <Chip
          label={formatMessage(`ptba.status.${ptba.status}`)}
          className={classes.statusChip}
          style={{ backgroundColor: statusColor, color: '#fff' }}
          size="small"
        />
      </div>
      <Typography variant="body2" color="textSecondary">
        {ptba.fiscalYearStart} - {ptba.fiscalYearEnd}
      </Typography>
      <div className={classes.kpiContainer}>
        <div className={classes.kpiItem}>
          <Typography className={classes.kpiValue}>
            {formatBIFAmount(totalBudget)} BIF
          </Typography>
          <Typography className={classes.kpiLabel}>
            {formatMessage('ptba.budgetTotal')}
          </Typography>
        </div>
        <div className={classes.kpiItem}>
          <Typography className={classes.kpiValue}>
            {(ptba.composantes?.edges || []).length}
          </Typography>
          <Typography className={classes.kpiLabel}>
            {formatMessage('ptba.composantes')}
          </Typography>
        </div>
      </div>
    </Paper>
  );
}

export default PTBAHeadPanel;
