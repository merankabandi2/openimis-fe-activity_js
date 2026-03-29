import React from 'react';
import {
  Typography,
  LinearProgress,
  Grid,
  Box,
} from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

const EngagementProgress = withStyles({
  root: { height: 10, borderRadius: 5 },
  colorPrimary: { backgroundColor: '#e3f2fd' },
  bar: { borderRadius: 5, backgroundColor: '#1976d2' },
})(LinearProgress);

const DecaissementProgress = withStyles({
  root: { height: 10, borderRadius: 5 },
  colorPrimary: { backgroundColor: '#fff3e0' },
  bar: { borderRadius: 5, backgroundColor: '#ff9800' },
})(LinearProgress);

const RealisationProgress = withStyles({
  root: { height: 10, borderRadius: 5 },
  colorPrimary: { backgroundColor: '#e8f5e9' },
  bar: { borderRadius: 5, backgroundColor: '#4caf50' },
})(LinearProgress);

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  progressRow: {
    marginBottom: theme.spacing(1.5),
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5),
  },
  labelText: {
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  percentText: {
    fontSize: '0.8rem',
    fontWeight: 600,
  },
}));

function ExecutionProgressBar({
  tauxEngagement,
  tauxDecaissement,
  tauxRealisation,
  compact,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const safePercent = (val) => {
    const num = parseFloat(val) || 0;
    return Math.min(Math.max(num, 0), 100);
  };

  const formatPercent = (val) => `${safePercent(val).toFixed(1)}%`;

  if (compact) {
    return (
      <Box className={classes.root}>
        <div className={classes.progressLabel}>
          <Typography className={classes.labelText}>
            {formatMessage('execution.budget')}
          </Typography>
          <Typography className={classes.percentText}>
            {formatPercent(tauxEngagement)} {formatMessage('execution.engage')} / {formatPercent(tauxDecaissement)} {formatMessage('execution.decaisse')}
          </Typography>
        </div>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <EngagementProgress variant="determinate" value={safePercent(tauxEngagement)} />
          </Grid>
          <Grid item xs={6}>
            <DecaissementProgress variant="determinate" value={safePercent(tauxDecaissement)} />
          </Grid>
        </Grid>
        <div className={classes.progressLabel} style={{ marginTop: 8 }}>
          <Typography className={classes.labelText}>
            {formatMessage('execution.physique')}
          </Typography>
          <Typography className={classes.percentText}>
            {formatPercent(tauxRealisation)} {formatMessage('execution.realise')}
          </Typography>
        </div>
        <RealisationProgress variant="determinate" value={safePercent(tauxRealisation)} />
      </Box>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.progressRow}>
        <div className={classes.progressLabel}>
          <Typography className={classes.labelText}>
            {formatMessage('execution.tauxEngagement')}
          </Typography>
          <Typography className={classes.percentText} style={{ color: '#1976d2' }}>
            {formatPercent(tauxEngagement)}
          </Typography>
        </div>
        <EngagementProgress variant="determinate" value={safePercent(tauxEngagement)} />
      </div>

      <div className={classes.progressRow}>
        <div className={classes.progressLabel}>
          <Typography className={classes.labelText}>
            {formatMessage('execution.tauxDecaissement')}
          </Typography>
          <Typography className={classes.percentText} style={{ color: '#ff9800' }}>
            {formatPercent(tauxDecaissement)}
          </Typography>
        </div>
        <DecaissementProgress variant="determinate" value={safePercent(tauxDecaissement)} />
      </div>

      <div className={classes.progressRow}>
        <div className={classes.progressLabel}>
          <Typography className={classes.labelText}>
            {formatMessage('execution.tauxRealisation')}
          </Typography>
          <Typography className={classes.percentText} style={{ color: '#4caf50' }}>
            {formatPercent(tauxRealisation)}
          </Typography>
        </div>
        <RealisationProgress variant="determinate" value={safePercent(tauxRealisation)} />
      </div>
    </div>
  );
}

export default ExecutionProgressBar;
