import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ReactApexChart from 'react-apexcharts';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, STATUS_COLORS, ACTIVITY_STATUS_LIST } from '../../constants';

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

function ActivityStatusDistribution({ activitiesByStatus }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  if (!activitiesByStatus || activitiesByStatus.length === 0) {
    return (
      <Paper className={classes.root} elevation={1}>
        <Typography className={classes.title}>
          {formatMessage('dashboard.statusDistribution.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {formatMessage('dashboard.noData')}
        </Typography>
      </Paper>
    );
  }

  const statusMap = {};
  activitiesByStatus.forEach((item) => {
    statusMap[item.status] = item.count || 0;
  });

  const orderedStatuses = ACTIVITY_STATUS_LIST.filter(
    (s) => statusMap[s] !== undefined && statusMap[s] > 0,
  );

  const labels = orderedStatuses.map((s) => formatMessage(`status.${s}`));
  const values = orderedStatuses.map((s) => statusMap[s]);
  const colors = orderedStatuses.map((s) => STATUS_COLORS[s] || '#9e9e9e');

  const options = {
    chart: { type: 'pie' },
    labels,
    colors,
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => {
        const count = opts.w.globals.series[opts.seriesIndex];
        return `${count} (${val.toFixed(0)}%)`;
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} activites`,
      },
    },
  };

  return (
    <Paper className={classes.root} elevation={1}>
      <Typography className={classes.title}>
        {formatMessage('dashboard.statusDistribution.title')}
      </Typography>
      <ReactApexChart
        options={options}
        series={values}
        type="pie"
        height={350}
      />
    </Paper>
  );
}

export default ActivityStatusDistribution;
