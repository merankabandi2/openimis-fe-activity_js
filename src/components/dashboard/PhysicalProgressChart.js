import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ReactApexChart from 'react-apexcharts';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    height: '100%',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
}));

function PhysicalProgressChart({ composantePerformance }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!composantePerformance || composantePerformance.length === 0) {
    return (
      <Paper className={classes.root} elevation={1}>
        <Typography className={classes.title}>
          {formatMessage('dashboard.physicalProgress.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {formatMessage('dashboard.noData')}
        </Typography>
      </Paper>
    );
  }

  const categories = composantePerformance.map(
    (c) => c.composanteCode || c.composanteName || '',
  );

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: true, tools: { download: true } },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '60%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
      style: { fontSize: '11px' },
    },
    xaxis: {
      categories,
      max: 100,
      labels: {
        formatter: (val) => `${val}%`,
      },
      title: { text: formatMessage('dashboard.physicalProgress.xaxis') },
    },
    colors: ['#4caf50', '#e0e0e0'],
    legend: { position: 'top' },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(1)}%`,
      },
    },
  };

  const series = [
    {
      name: formatMessage('dashboard.physicalProgress.realise'),
      data: composantePerformance.map((c) => parseFloat(c.tauxRealisation) || 0),
    },
  ];

  return (
    <Paper className={classes.root} elevation={1}>
      <Typography className={classes.title}>
        {formatMessage('dashboard.physicalProgress.title')}
      </Typography>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </Paper>
  );
}

export default PhysicalProgressChart;
