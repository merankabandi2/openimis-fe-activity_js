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

const FUNDING_COLORS = ['#1976d2', '#ff9800', '#4caf50', '#9c27b0', '#f44336', '#607d8b'];

function FundingSourceBreakdown({ fundingBreakdown }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!fundingBreakdown || fundingBreakdown.length === 0) {
    return (
      <Paper className={classes.root} elevation={1}>
        <Typography className={classes.title}>
          {formatMessage('dashboard.funding.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {formatMessage('dashboard.noData')}
        </Typography>
      </Paper>
    );
  }

  const labels = fundingBreakdown.map(
    (f) => `${f.sourceCode} - ${f.sourceName}`,
  );
  const values = fundingBreakdown.map((f) => parseFloat(f.amount) || 0);

  const options = {
    chart: { type: 'donut' },
    labels,
    colors: FUNDING_COLORS.slice(0, labels.length),
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              fontSize: '14px',
              fontWeight: 600,
              label: formatMessage('dashboard.funding.total'),
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `${formatBIFAmount(total)} BIF`;
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (val) => `${formatBIFAmount(val)} BIF`,
      },
    },
  };

  return (
    <Paper className={classes.root} elevation={1}>
      <Typography className={classes.title}>
        {formatMessage('dashboard.funding.title')}
      </Typography>
      <ReactApexChart
        options={options}
        series={values}
        type="donut"
        height={350}
      />
    </Paper>
  );
}

export default FundingSourceBreakdown;
