import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import WarningIcon from '@material-ui/icons/Warning';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  warningIcon: {
    color: '#ff9800',
  },
  headerCell: {
    fontWeight: 600,
    backgroundColor: '#f5f5f5',
    fontSize: '0.8rem',
  },
  lowRate: {
    color: '#c62828',
    fontWeight: 600,
  },
  mediumRate: {
    color: '#e65100',
    fontWeight: 600,
  },
}));

function TopDelayedTable({ topDelayedActivities }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!topDelayedActivities || topDelayedActivities.length === 0) {
    return (
      <Paper className={classes.root} elevation={1}>
        <div className={classes.titleRow}>
          <WarningIcon className={classes.warningIcon} />
          <Typography className={classes.title}>
            {formatMessage('dashboard.delayed.title')}
          </Typography>
        </div>
        <Typography variant="body2" color="textSecondary">
          {formatMessage('dashboard.delayed.none')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper className={classes.root} elevation={1}>
      <div className={classes.titleRow}>
        <WarningIcon className={classes.warningIcon} />
        <Typography className={classes.title}>
          {formatMessage('dashboard.delayed.title')}
        </Typography>
      </div>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell}>
                {formatMessage('dashboard.delayed.activity')}
              </TableCell>
              <TableCell className={classes.headerCell}>
                {formatMessage('dashboard.delayed.composante')}
              </TableCell>
              <TableCell className={classes.headerCell} align="right">
                {formatMessage('dashboard.delayed.taux')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topDelayedActivities.map((activity) => {
              const rate = parseFloat(activity.tauxRealisation) || 0;
              return (
                <TableRow key={activity.activiteId}>
                  <TableCell>{activity.activiteName}</TableCell>
                  <TableCell>
                    <Chip
                      label={activity.composanteName}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    className={rate < 25 ? classes.lowRate : classes.mediumRate}
                  >
                    {rate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default TopDelayedTable;
