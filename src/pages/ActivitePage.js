import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';

import {
  Helmet,
  useHistory,
  useModulesManager,
  useTranslations,
  journalize,
  coreConfirm,
  clearConfirm,
} from '@openimis/fe-core';
import {
  fetchActivite,
  clearActivite,
  transitionActivity,
  updateActivite,
  deleteActivite,
} from '../actions';
import { ACTION_TYPE } from '../actions';
import {
  MODULE_NAME,
  RIGHT_ACTIVITY_UPDATE,
  ROUTE_PTBA,
} from '../constants';
import SousActiviteTable from '../components/hierarchy/SousActiviteTable';
import FundingAllocationTable from '../components/funding/FundingAllocationTable';
import StatusBadge from '../components/lifecycle/StatusBadge';
import TransitionButton from '../components/lifecycle/TransitionButton';
import TransitionHistory from '../components/lifecycle/TransitionHistory';
import QuarterlyExecutionForm from '../components/execution/QuarterlyExecutionForm';
import IndicatorLinkPanel from '../components/link/IndicatorLinkPanel';
import WeeklyPlanTab from '../components/weekly/WeeklyPlanTab';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  header: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
  },
  metaGrid: {
    marginTop: theme.spacing(1),
  },
  metaLabel: {
    fontWeight: 'bold',
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
  },
  metaValue: {
    fontSize: '0.9rem',
  },
  tabContent: {
    padding: theme.spacing(2),
  },
}));

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box>{children}</Box>;
}

function ActivitePage({
  activiteId,
  fetchActivite,
  clearActivite,
  transitionActivity,
  updateActivite,
  deleteActivite,
  activite,
  fetchingActivite,
  rights,
  submittingMutation,
  mutation,
  confirmed,
  coreConfirm,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (activiteId) {
      fetchActivite(modulesManager, [`id: "${activiteId}"`]);
    }
    return () => clearActivite();
  }, [activiteId]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_ACTIVITE) {
        // Navigate back to PTBA page
        const ptbaId = activite?.sousComposante?.composante?.ptba?.id;
        if (ptbaId) {
          history.push(`/${ROUTE_PTBA}/${ptbaId}`);
        } else {
          history.goBack();
        }
      } else if (activiteId) {
        fetchActivite(modulesManager, [`id: "${activiteId}"`]);
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => {
    if (confirmed && confirmedAction) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  if (!activiteId) {
    return (
      <div className={classes.page}>
        <Typography>{formatMessage('activite.noIdProvided')}</Typography>
      </div>
    );
  }

  const readOnly = !rights.includes(RIGHT_ACTIVITY_UPDATE)
    || activite?.status === 'CLOTURE';

  const sousActivites = activite?.sousActivites?.edges?.map((e) => e.node) || [];

  const handleTransition = (toStatus, comment) => {
    transitionActivity(
      activite,
      toStatus,
      comment,
      formatMessage('transition.mutation.label'),
    );
  };

  // Edit mode
  const handleStartEdit = () => {
    setEditData({
      name: activite?.name || '',
      code: activite?.code || '',
      implementingStructure: activite?.implementingStructure || '',
      procurementMethod: activite?.procurementMethod || '',
      province: activite?.province || '',
      indicatorDescription: activite?.indicatorDescription || '',
      observations: activite?.observations || '',
      revisionStatus: activite?.revisionStatus || '',
      revisionComment: activite?.revisionComment || '',
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData({});
  };

  const handleSaveEdit = () => {
    updateActivite(
      {
        id: activite.id,
        sousComposanteId: activite.sousComposante?.id,
        ...editData,
      },
      formatMessageWithValues('activite.mutation.updateLabel', { id: activite.id }),
    );
    setEditMode(false);
  };

  // Delete
  const handleDelete = () => {
    setConfirmedAction(() => () => {
      deleteActivite(
        activite,
        formatMessageWithValues('activite.mutation.deleteLabel', { id: activite.id }),
      );
    });
    coreConfirm(
      formatMessage('activite.delete.confirm.title'),
      formatMessage('activite.delete.confirm.message'),
    );
  };

  const totalBudget = sousActivites.reduce(
    (sum, sa) => sum + parseFloat(sa.budgetTotal || 0),
    0,
  );

  const breadcrumb = activite?.sousComposante
    ? `${activite.sousComposante.composante?.ptba?.code || ''} > ${activite.sousComposante.composante?.code || ''} > ${activite.sousComposante.code || ''}`
    : '';

  // Indicators from activite (if available from GQL)
  const indicators = activite?.indicators?.edges?.map((e) => e.node) || [];

  const renderMetaField = (key, value) => {
    if (editMode) {
      return (
        <Grid item xs={3}>
          <TextField
            label={formatMessage(`activite.${key}`)}
            value={editData[key] || ''}
            onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
            fullWidth
            size="small"
          />
        </Grid>
      );
    }
    if (!value) return null;
    return (
      <Grid item xs={3}>
        <Typography className={classes.metaLabel}>
          {formatMessage(`activite.${key}`)}
        </Typography>
        <Typography className={classes.metaValue}>
          {value}
        </Typography>
      </Grid>
    );
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessageWithValues('ActivitePage.title', { name: activite?.name || '' })} />

      <Paper className={classes.header}>
        <div className={classes.headerRow}>
          <IconButton onClick={() => history.goBack()} size="small">
            <ArrowBackIcon />
          </IconButton>
          {activite && <StatusBadge status={activite.status} />}
          {editMode ? (
            <>
              <TextField
                value={editData.code}
                onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                size="small"
                label={formatMessage('activite.code')}
                style={{ width: 120 }}
              />
              <TextField
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                size="small"
                label={formatMessage('activite.name')}
                style={{ flexGrow: 1 }}
              />
            </>
          ) : (
            <Typography variant="h6" className={classes.title}>
              {activite?.code ? `${activite.code} - ` : ''}{activite?.name || ''}
            </Typography>
          )}
          {!readOnly && !editMode && (
            <>
              <IconButton size="small" onClick={handleStartEdit}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </>
          )}
          {editMode && (
            <>
              <IconButton size="small" onClick={handleSaveEdit}>
                <SaveIcon />
              </IconButton>
              <IconButton size="small" onClick={handleCancelEdit}>
                <CancelIcon />
              </IconButton>
            </>
          )}
          {activite && !editMode && (
            <TransitionButton
              activite={activite}
              rights={rights}
              onTransition={handleTransition}
            />
          )}
        </div>
        {breadcrumb && (
          <Typography variant="body2" color="textSecondary">
            {breadcrumb}
          </Typography>
        )}
        <Grid container spacing={2} className={classes.metaGrid}>
          {renderMetaField('implementingStructure', activite?.implementingStructure)}
          {renderMetaField('procurementMethod', activite?.procurementMethod)}
          {renderMetaField('province', activite?.province)}
          {renderMetaField('indicatorDescription', activite?.indicatorDescription)}
        </Grid>
        {editMode ? (
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <TextField
                label={formatMessage('activite.observations')}
                value={editData.observations || ''}
                onChange={(e) => setEditData({ ...editData, observations: e.target.value })}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={formatMessage('revision.status')}
                value={editData.revisionStatus || ''}
                onChange={(e) => setEditData({ ...editData, revisionStatus: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={formatMessage('revision.comment')}
                value={editData.revisionComment || ''}
                onChange={(e) => setEditData({ ...editData, revisionComment: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        ) : (
          activite?.observations && (
            <div style={{ marginTop: 8 }}>
              <Typography className={classes.metaLabel}>
                {formatMessage('activite.observations')}
              </Typography>
              <Typography className={classes.metaValue}>
                {activite.observations}
              </Typography>
            </div>
          )
        )}
      </Paper>

      <Paper>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={formatMessage('activite.sousActivites')} />
          <Tab label={formatMessage('activite.tab.execution')} />
          <Tab label={formatMessage('activite.funding')} />
          <Tab label={formatMessage('activite.tab.indicators')} />
          <Tab label={formatMessage('activite.tab.history')} />
          <Tab label={formatMessage('activite.tab.weeklyPlan')} />
        </Tabs>

        <div className={classes.tabContent}>
          <TabPanel value={tabValue} index={0}>
            <SousActiviteTable
              activiteId={activiteId}
              sousActivites={sousActivites}
              readOnly={readOnly}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <QuarterlyExecutionForm
              activiteId={activiteId}
              sousActivites={sousActivites}
              readOnly={readOnly || activite?.status !== 'EN_COURS'}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {sousActivites.map((sa) => {
              const saAllocations = sa.fundingAllocations?.edges?.map((e) => e.node) || [];
              return (
                <div key={sa.id} style={{ marginBottom: 24 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {sa.name}
                  </Typography>
                  <FundingAllocationTable
                    sousActiviteId={sa.id}
                    allocations={saAllocations}
                    budgetTotal={sa.budgetTotal}
                    readOnly={readOnly}
                  />
                </div>
              );
            })}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <IndicatorLinkPanel
              activiteId={activiteId}
              indicators={indicators}
              readOnly={readOnly}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <TransitionHistory activiteId={activiteId} />
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <WeeklyPlanTab
              activiteId={activiteId}
              sousActivites={sousActivites}
              readOnly={readOnly}
            />
          </TabPanel>
        </div>
      </Paper>
    </div>
  );
}

const mapStateToProps = (state, props) => ({
  activiteId: props.match.params.activite_uuid,
  rights: state.core?.user?.i_user?.rights ?? [],
  activite: state.activity.activite,
  fetchingActivite: state.activity.fetchingActivite,
  submittingMutation: state.activity.submittingMutation,
  mutation: state.activity.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchActivite,
  clearActivite,
  transitionActivity,
  updateActivite,
  deleteActivite,
  journalize,
  coreConfirm,
  clearConfirm,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ActivitePage);
