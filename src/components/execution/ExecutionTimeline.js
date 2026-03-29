import React from 'react';
import {
  Typography,
  Grid,
  Paper,
  Chip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, QUARTERS } from '../../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  quarterCard: {
    padding: theme.spacing(2),
    textAlign: 'center',
    position: 'relative',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,.1)',
    },
  },
  done: {
    borderLeft: '3px solid #4caf50',
  },
  inProgress: {
    borderLeft: '3px solid #ff9800',
  },
  pending: {
    borderLeft: '3px solid #e0e0e0',
  },
  quarterLabel: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  statusChip: {
    marginTop: theme.spacing(1),
  },
  rateText: {
    fontSize: '0.8rem',
    marginTop: theme.spacing(0.5),
  },
}));

function ExecutionTimeline({ executions, currentQuarter }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const getQuarterExecution = (quarterNum) => {
    if (!executions) return null;
    return executions.find((e) => e.quarter === quarterNum);
  };

  const getQuarterStatus = (quarterNum) => {
    const exec = getQuarterExecution(quarterNum);
    if (exec && exec.reportedDate) return 'done';
    if (quarterNum === currentQuarter) return 'inProgress';
    return 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return <CheckCircleIcon style={{ color: '#4caf50' }} />;
      case 'inProgress':
        return <HourglassEmptyIcon style={{ color: '#ff9800' }} />;
      default:
        return <RadioButtonUncheckedIcon style={{ color: '#e0e0e0' }} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'done':
        return formatMessage('execution.timeline.done');
      case 'inProgress':
        return formatMessage('execution.timeline.inProgress');
      default:
        return formatMessage('execution.timeline.pending');
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        {QUARTERS.map((q) => {
          const status = getQuarterStatus(q.value);
          const exec = getQuarterExecution(q.value);
          return (
            <Grid item xs={3} key={q.value}>
              <Paper className={`${classes.quarterCard} ${classes[status]}`}>
                {getStatusIcon(status)}
                <Typography className={classes.quarterLabel}>
                  {q.label}
                </Typography>
                <Chip
                  label={getStatusLabel(status)}
                  size="small"
                  color={status === 'done' ? 'primary' : 'default'}
                  variant={status === 'pending' ? 'outlined' : 'default'}
                  className={classes.statusChip}
                />
                {exec && (
                  <>
                    <Typography className={classes.rateText}>
                      {formatMessage('execution.engagement')}: {parseFloat(exec.tauxEngagement || 0).toFixed(1)}%
                    </Typography>
                    <Typography className={classes.rateText}>
                      {formatMessage('execution.decaissement')}: {parseFloat(exec.tauxDecaissement || 0).toFixed(1)}%
                    </Typography>
                    <Typography className={classes.rateText}>
                      {formatMessage('execution.realisation')}: {parseFloat(exec.tauxRealisation || 0).toFixed(1)}%
                    </Typography>
                  </>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}

export default ExecutionTimeline;
