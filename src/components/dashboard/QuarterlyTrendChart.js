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

function QuarterlyTrendChart({ quarterlyTrend }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!quarterlyTrend || quarterlyTrend.length === 0) {
    return (
      <Paper className={classes.root} elevation={1}>
        <Typography className={classes.title}>
          {formatMessage('dashboard.quarterlyTrend.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {formatMessage('dashboard.noData')}
        </Typography>
      </Paper>
    );
  }

  const categories = quarterlyTrend.map((q) => `T${q.quarter}`);

  const options = {
    chart: {
      type: 'line',
      toolbar: { show: true, tools: { download: true } },
      zoom: { enabled: false },
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      hover: { size: 8 },
    },
    xaxis: {
      categories,
      title: { text: formatMessage('dashboard.quarterlyTrend.xaxis') },
    },
    yaxis: {
      min: 0,
      max: 100,
      title: { text: '%' },
      labels: {
        formatter: (val) => `${val.toFixed(0)}%`,
      },
    },
    colors: ['#1976d2', '#ff9800', '#4caf50'],
    legend: { position: 'top' },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(1)}%`,
      },
    },
    grid: {
      borderColor: '#f0f0f0',
    },
  };

  const series = [
    {
      name: formatMessage('dashboard.quarterlyTrend.engagement'),
      data: quarterlyTrend.map((q) => parseFloat(q.tauxEngagement) || 0),
    },
    {
      name: formatMessage('dashboard.quarterlyTrend.decaissement'),
      data: quarterlyTrend.map((q) => parseFloat(q.tauxDecaissement) || 0),
    },
    {
      name: formatMessage('dashboard.quarterlyTrend.realisation'),
      data: quarterlyTrend.map((q) => parseFloat(q.tauxRealisation) || 0),
    },
  ];

  return (
    <Paper className={classes.root} elevation={1}>
      <Typography className={classes.title}>
        {formatMessage('dashboard.quarterlyTrend.title')}
      </Typography>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </Paper>
  );
}

export default QuarterlyTrendChart;
