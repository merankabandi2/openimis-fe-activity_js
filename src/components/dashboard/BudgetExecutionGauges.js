import React from 'react';
import { Grid, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ReactApexChart from 'react-apexcharts';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

const useStyles = makeStyles((theme) => ({
  gaugeCard: {
    padding: theme.spacing(2),
    textAlign: 'center',
    height: '100%',
  },
  gaugeTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
}));

function BudgetExecutionGauges({ tauxEngagement, tauxDecaissement, tauxRealisation }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const safeVal = (v) => Math.min(Math.max(parseFloat(v) || 0, 0), 100);

  const createGaugeOptions = (label, color) => ({
    chart: { type: 'radialBar', sparkline: { enabled: false } },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: '60%' },
        track: {
          background: '#f0f0f0',
          strokeWidth: '100%',
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '12px',
            offsetY: -5,
            color: '#666',
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 700,
            color,
            offsetY: 5,
            formatter: (val) => `${val.toFixed(1)}%`,
          },
        },
      },
    },
    fill: { colors: [color] },
    stroke: { lineCap: 'round' },
    labels: [label],
  });

  const gauges = [
    {
      label: formatMessage('dashboard.gauge.engagement'),
      value: safeVal(tauxEngagement),
      color: '#1976d2',
    },
    {
      label: formatMessage('dashboard.gauge.decaissement'),
      value: safeVal(tauxDecaissement),
      color: '#ff9800',
    },
    {
      label: formatMessage('dashboard.gauge.realisation'),
      value: safeVal(tauxRealisation),
      color: '#4caf50',
    },
  ];

  return (
    <Grid container spacing={2}>
      {gauges.map((gauge) => (
        <Grid item xs={12} md={4} key={gauge.label}>
          <Paper className={classes.gaugeCard} elevation={1}>
            <Typography className={classes.gaugeTitle}>
              {gauge.label}
            </Typography>
            <ReactApexChart
              options={createGaugeOptions(gauge.label, gauge.color)}
              series={[gauge.value]}
              type="radialBar"
              height={220}
            />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default BudgetExecutionGauges;
