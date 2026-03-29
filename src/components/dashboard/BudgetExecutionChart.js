import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ReactApexChart from 'react-apexcharts';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import { formatBIFAmount } from '../../utils/string-utils';

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

function BudgetExecutionChart({ composantePerformance }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!composantePerformance || composantePerformance.length === 0) {
    return (
      <Paper className={classes.root} elevation={1}>
        <Typography className={classes.title}>
          {formatMessage('dashboard.budgetExecution.title')}
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
        horizontal: false,
        columnWidth: '70%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      title: { text: formatMessage('dashboard.budgetExecution.xaxis') },
    },
    yaxis: {
      title: { text: formatMessage('dashboard.budgetExecution.yaxis') },
      labels: {
        formatter: (val) => formatBIFAmount(val),
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${formatBIFAmount(val)} BIF`,
      },
    },
    colors: ['#1976d2', '#ff9800', '#4caf50'],
    legend: { position: 'top' },
  };

  const series = [
    {
      name: formatMessage('dashboard.budgetExecution.prevu'),
      data: composantePerformance.map((c) => parseFloat(c.budgetPrevu) || 0),
    },
    {
      name: formatMessage('dashboard.budgetExecution.engage'),
      data: composantePerformance.map((c) => parseFloat(c.budgetEngage) || 0),
    },
    {
      name: formatMessage('dashboard.budgetExecution.decaisse'),
      data: composantePerformance.map((c) => parseFloat(c.budgetDecaisse) || 0),
    },
  ];

  return (
    <Paper className={classes.root} elevation={1}>
      <Typography className={classes.title}>
        {formatMessage('dashboard.budgetExecution.title')}
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

export default BudgetExecutionChart;
