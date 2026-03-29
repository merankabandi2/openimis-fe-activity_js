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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, QUARTERS } from '../../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  headerCell: {
    fontWeight: 600,
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
  },
  cell: {
    textAlign: 'center',
    fontWeight: 500,
    padding: theme.spacing(1),
    borderRadius: 4,
    minWidth: 80,
  },
  composanteCell: {
    fontWeight: 500,
    maxWidth: 250,
  },
}));

function getHeatmapColor(value) {
  const v = parseFloat(value) || 0;
  if (v >= 75) return { backgroundColor: '#c8e6c9', color: '#2e7d32' };
  if (v >= 50) return { backgroundColor: '#fff9c4', color: '#f57f17' };
  if (v >= 25) return { backgroundColor: '#ffe0b2', color: '#e65100' };
  return { backgroundColor: '#ffcdd2', color: '#c62828' };
}

function PerformanceHeatmap({ composantePerformance, quarterlyTrend }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!composantePerformance || composantePerformance.length === 0) {
    return (
      <Paper className={classes.root} elevation={1}>
        <Typography className={classes.title}>
          {formatMessage('dashboard.heatmap.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {formatMessage('dashboard.noData')}
        </Typography>
      </Paper>
    );
  }

  const quarterTrends = {};
  if (quarterlyTrend) {
    quarterlyTrend.forEach((qt) => {
      quarterTrends[qt.quarter] = qt.tauxRealisation || 0;
    });
  }

  return (
    <Paper className={classes.root} elevation={1}>
      <Typography className={classes.title}>
        {formatMessage('dashboard.heatmap.title')}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell}>
                {formatMessage('composante')}
              </TableCell>
              {QUARTERS.map((q) => (
                <TableCell key={q.value} className={classes.headerCell}>
                  {q.label}
                </TableCell>
              ))}
              <TableCell className={classes.headerCell}>
                {formatMessage('dashboard.heatmap.overall')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {composantePerformance.map((comp) => {
              const overallRate = parseFloat(comp.tauxRealisation) || 0;
              return (
                <TableRow key={comp.composanteId || comp.composanteCode}>
                  <TableCell className={classes.composanteCell}>
                    {comp.composanteCode} - {comp.composanteName}
                  </TableCell>
                  {QUARTERS.map((q) => {
                    const ptbaRate = quarterTrends[q.value];
                    const hasData = ptbaRate !== undefined && ptbaRate !== null;
                    const colorStyle = hasData ? getHeatmapColor(ptbaRate) : {};
                    return (
                      <TableCell key={q.value}>
                        <div className={classes.cell} style={colorStyle}>
                          {hasData ? `${parseFloat(ptbaRate).toFixed(0)}%` : '—'}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <div
                      className={classes.cell}
                      style={getHeatmapColor(overallRate)}
                    >
                      {overallRate.toFixed(0)}%
                    </div>
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

export default PerformanceHeatmap;
