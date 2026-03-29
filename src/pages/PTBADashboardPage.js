import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Grid,
  Typography,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import DashboardIcon from '@material-ui/icons/Dashboard';
import RefreshIcon from '@material-ui/icons/Refresh';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import {
  Helmet,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import {
  MODULE_NAME,
  RIGHT_DASHBOARD_VIEW,
  QUARTERS,
} from '../constants';
import { fetchPtbas, fetchPtbaDashboard } from '../actions';
import { formatBIFAmount } from '../utils/string-utils';

import BudgetExecutionGauges from '../components/dashboard/BudgetExecutionGauges';
import BudgetExecutionChart from '../components/dashboard/BudgetExecutionChart';
import PhysicalProgressChart from '../components/dashboard/PhysicalProgressChart';
import FundingSourceBreakdown from '../components/dashboard/FundingSourceBreakdown';
import ActivityStatusDistribution from '../components/dashboard/ActivityStatusDistribution';
import QuarterlyTrendChart from '../components/dashboard/QuarterlyTrendChart';
import PerformanceHeatmap from '../components/dashboard/PerformanceHeatmap';
import TopDelayedTable from '../components/dashboard/TopDelayedTable';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  pageHeader: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: '1.8rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  titleIcon: {
    fontSize: '2rem',
    color: theme.palette.primary?.main || '#1976d2',
  },
  filtersRow: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  summaryCard: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(1.5),
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: '#fff',
    marginBottom: theme.spacing(3),
  },
  summaryTitle: {
    fontSize: '0.9rem',
    fontWeight: 500,
    opacity: 0.9,
    marginBottom: theme.spacing(0.5),
  },
  summaryValue: {
    fontSize: '1.8rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  summarySubtitle: {
    fontSize: '0.8rem',
    opacity: 0.8,
  },
  chartSection: {
    marginTop: theme.spacing(2),
  },
  alertsCard: {
    padding: theme.spacing(2),
  },
  alertIcon: {
    color: '#ff9800',
  },
  alertIconHigh: {
    color: '#f44336',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
}));

function PTBADashboardPage({
  rights,
  ptbas,
  fetchPtbas,
  fetchPtbaDashboard,
  ptbaDashboard,
  fetchingPtbaDashboard,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const [selectedPtbaId, setSelectedPtbaId] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState(null);

  useEffect(() => {
    fetchPtbas(modulesManager, ['first: 50']);
  }, []);

  useEffect(() => {
    if (ptbas && ptbas.length > 0 && !selectedPtbaId) {
      setSelectedPtbaId(ptbas[0].id);
    }
  }, [ptbas]);

  useEffect(() => {
    if (selectedPtbaId) {
      const params = [`ptbaId: "${selectedPtbaId}"`];
      if (selectedQuarter) {
        params.push(`quarter: ${selectedQuarter}`);
      }
      fetchPtbaDashboard(modulesManager, params);
    }
  }, [selectedPtbaId, selectedQuarter]);

  const handleRefresh = () => {
    if (selectedPtbaId) {
      const params = [`ptbaId: "${selectedPtbaId}"`];
      if (selectedQuarter) {
        params.push(`quarter: ${selectedQuarter}`);
      }
      fetchPtbaDashboard(modulesManager, params);
    }
  };

  if (!rights.includes(RIGHT_DASHBOARD_VIEW)) {
    return (
      <div className={classes.page}>
        <Typography>{formatMessage('dashboard.noPermission')}</Typography>
      </div>
    );
  }

  const dashboard = ptbaDashboard;

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('dashboard.page.title')} />

      <div className={classes.pageHeader}>
        <Typography className={classes.pageTitle}>
          <DashboardIcon className={classes.titleIcon} />
          {formatMessage('dashboard.page.title')}
        </Typography>
        <Tooltip title={formatMessage('dashboard.refresh')}>
          <IconButton onClick={handleRefresh} disabled={fetchingPtbaDashboard}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      <div className={classes.filtersRow}>
        <FormControl style={{ minWidth: 250 }}>
          <InputLabel>{formatMessage('dashboard.filter.ptba')}</InputLabel>
          <Select
            value={selectedPtbaId}
            onChange={(e) => setSelectedPtbaId(e.target.value)}
          >
            {(ptbas || []).map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.code} - {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ minWidth: 120 }}>
          <InputLabel>{formatMessage('dashboard.filter.quarter')}</InputLabel>
          <Select
            value={selectedQuarter || ''}
            onChange={(e) => setSelectedQuarter(e.target.value || null)}
          >
            <MenuItem value="">{formatMessage('dashboard.filter.allQuarters')}</MenuItem>
            {QUARTERS.map((q) => (
              <MenuItem key={q.value} value={q.value}>{q.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {fetchingPtbaDashboard ? (
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      ) : dashboard ? (
        <>
          {/* Summary Card */}
          <Paper className={classes.summaryCard}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography className={classes.summaryTitle}>
                  {formatMessage('dashboard.summary.budgetPrevu')}
                </Typography>
                <Typography className={classes.summaryValue}>
                  {formatBIFAmount(dashboard.budgetPrevu)} BIF
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography className={classes.summaryTitle}>
                  {formatMessage('dashboard.summary.budgetEngage')}
                </Typography>
                <Typography className={classes.summaryValue}>
                  {formatBIFAmount(dashboard.budgetEngage)} BIF
                </Typography>
                <Typography className={classes.summarySubtitle}>
                  {parseFloat(dashboard.tauxEngagement || 0).toFixed(1)}% {formatMessage('dashboard.summary.engaged')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography className={classes.summaryTitle}>
                  {formatMessage('dashboard.summary.budgetDecaisse')}
                </Typography>
                <Typography className={classes.summaryValue}>
                  {formatBIFAmount(dashboard.budgetDecaisse)} BIF
                </Typography>
                <Typography className={classes.summarySubtitle}>
                  {parseFloat(dashboard.tauxDecaissement || 0).toFixed(1)}% {formatMessage('dashboard.summary.disbursed')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography className={classes.summaryTitle}>
                  {formatMessage('dashboard.summary.tauxRealisation')}
                </Typography>
                <Typography className={classes.summaryValue}>
                  {parseFloat(dashboard.tauxRealisation || 0).toFixed(1)}%
                </Typography>
                <Typography className={classes.summarySubtitle}>
                  {formatMessage('dashboard.summary.physicalProgress')}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Gauges */}
          <BudgetExecutionGauges
            tauxEngagement={dashboard.tauxEngagement}
            tauxDecaissement={dashboard.tauxDecaissement}
            tauxRealisation={dashboard.tauxRealisation}
          />

          {/* Charts Row 1 */}
          <Grid container spacing={3} className={classes.chartSection}>
            <Grid item xs={12} md={8}>
              <BudgetExecutionChart
                composantePerformance={dashboard.composantePerformance}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ActivityStatusDistribution
                activitiesByStatus={dashboard.activitiesByStatus}
              />
            </Grid>
          </Grid>

          {/* Charts Row 2 */}
          <Grid container spacing={3} className={classes.chartSection}>
            <Grid item xs={12} md={6}>
              <PhysicalProgressChart
                composantePerformance={dashboard.composantePerformance}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FundingSourceBreakdown
                fundingBreakdown={dashboard.fundingBreakdown}
              />
            </Grid>
          </Grid>

          {/* Charts Row 3 */}
          <Grid container spacing={3} className={classes.chartSection}>
            <Grid item xs={12} md={6}>
              <QuarterlyTrendChart
                quarterlyTrend={dashboard.quarterlyTrend}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PerformanceHeatmap
                composantePerformance={dashboard.composantePerformance}
                quarterlyTrend={dashboard.quarterlyTrend}
              />
            </Grid>
          </Grid>

          {/* Bottom Row */}
          <Grid container spacing={3} className={classes.chartSection}>
            <Grid item xs={12} md={7}>
              <TopDelayedTable
                topDelayedActivities={dashboard.topDelayedActivities}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              {dashboard.alerts && dashboard.alerts.length > 0 && (
                <Paper className={classes.alertsCard} elevation={1}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <WarningIcon className={classes.alertIcon} />
                    {formatMessage('dashboard.alerts.title')}
                  </Typography>
                  <List dense>
                    {dashboard.alerts.map((alert, idx) => (
                      <ListItem key={`${alert.activiteId}-${idx}`}>
                        <ListItemIcon>
                          {alert.severity === 'HIGH' ? (
                            <ErrorIcon className={classes.alertIconHigh} />
                          ) : (
                            <WarningIcon className={classes.alertIcon} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.activiteName}
                          secondary={alert.message}
                        />
                        <Chip
                          label={alert.severity}
                          size="small"
                          color={alert.severity === 'HIGH' ? 'secondary' : 'default'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
          </Grid>
        </>
      ) : (
        <div className={classes.loadingContainer}>
          <Typography variant="body2" color="textSecondary">
            {formatMessage('dashboard.selectPtba')}
          </Typography>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  ptbas: state.activity.ptbas,
  ptbaDashboard: state.activity.ptbaDashboard,
  fetchingPtbaDashboard: state.activity.fetchingPtbaDashboard,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchPtbas,
  fetchPtbaDashboard,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PTBADashboardPage);
