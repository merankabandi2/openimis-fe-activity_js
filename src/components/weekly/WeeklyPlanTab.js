import React, { useState, useEffect, useRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  Tooltip,
  CircularProgress,
  IconButton,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/styles';

import {
  useModulesManager,
  useTranslations,
  journalize,
  coreConfirm,
  clearConfirm,
} from '@openimis/fe-core';
import {
  fetchWeeklyPlanEntries,
  createWeeklyPlanEntry,
  updateWeeklyPlanEntry,
  deleteWeeklyPlanEntry,
} from '../../actions';
import { MODULE_NAME } from '../../constants';
import { useOwnedConfirm } from '../../utils/useOwnedConfirm';
import WeeklyStatusBadge from '../lifecycle/WeeklyStatusBadge';
import WeeklyPlanForm from './WeeklyPlanForm';
import { ptbaQuarterOf, ptbaYearLabel, weeksOfPtbaQuarter } from '../../utils/ptba-quarters';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    minWidth: 1000,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: '0.75rem',
    padding: '6px 10px',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: 120,
  },
  sousActiviteCell: {
    padding: '4px 8px',
    fontSize: '0.8rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    position: 'sticky',
    left: 0,
    backgroundColor: '#fff',
    zIndex: 1,
    minWidth: 200,
  },
  weekCell: {
    padding: '4px 6px',
    fontSize: '0.75rem',
    minWidth: 140,
    cursor: 'pointer',
    verticalAlign: 'top',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  weekDescription: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    marginTop: 2,
    maxWidth: 130,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
}));

function WeeklyPlanTab({
  journalize,
  activiteId,
  sousActivites,
  fiscalYearStart,
  permissions,
  weeklyPlanEntries,
  fetchingWeeklyPlan,
  submittingMutation,
  mutation,
  fetchWeeklyPlanEntries,
  createWeeklyPlanEntry,
  updateWeeklyPlanEntry,
  deleteWeeklyPlanEntry,
  confirm,
  confirmed,
  coreConfirm,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const prevSubmittingMutationRef = useRef();
  const askConfirm = useOwnedConfirm(confirm, confirmed, coreConfirm, clearConfirm);
  const canCreate = !!permissions?.canCreateWeekly;
  const canUpdate = !!permissions?.canUpdateWeekly;
  const canDelete = !!permissions?.canDeleteWeekly;

  // The PTBA quarter of today, counted from the PTBA's fiscal_year_start.
  const { quarter, year } = ptbaQuarterOf(new Date(), fiscalYearStart);
  const weeks = weeksOfPtbaQuarter(quarter, year, fiscalYearStart);

  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingSousActiviteName, setEditingSousActiviteName] = useState('');

  useEffect(() => {
    if (activiteId) {
      fetchWeeklyPlanEntries(modulesManager, [`sousActivite_Activite_Id: "${activiteId}"`]);
    }
  }, [activiteId]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (activiteId) {
        fetchWeeklyPlanEntries(modulesManager, [`sousActivite_Activite_Id: "${activiteId}"`]);
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const entryMap = {};
  (weeklyPlanEntries || []).forEach((entry) => {
    const saId = entry.sousActivite?.id;
    const key = `${saId}_${entry.weekStart}`;
    entryMap[key] = entry;
  });

  const handleCellClick = (sa, week, existingEntry) => {
    if (!canCreate && !existingEntry) return;
    setEditingSousActiviteName(sa.name);
    setEditingEntry(existingEntry || {
      sousActiviteId: sa.id,
      weekStart: week.start,
      weekEnd: week.end,
    });
    setFormOpen(true);
  };

  const handleFormSave = (data) => {
    if (data.id) {
      updateWeeklyPlanEntry(data, formatMessage('weeklyPlan.mutation.updateLabel'));
    } else {
      createWeeklyPlanEntry(data, formatMessage('weeklyPlan.mutation.createLabel'));
    }
    setFormOpen(false);
    setEditingEntry(null);
  };

  const confirmDeleteEntry = (entry, onDeleted) => {
    askConfirm(
      formatMessage('weeklyPlan.delete.confirm.title'),
      formatMessage('weeklyPlan.delete.confirm.message'),
      () => {
        deleteWeeklyPlanEntry(entry, formatMessage('weeklyPlan.mutation.deleteLabel'));
        if (onDeleted) onDeleted();
      },
    );
  };

  const handleDeleteEntry = (entry, e) => {
    e.stopPropagation();
    if (entry?.id) confirmDeleteEntry(entry);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEntry(null);
  };

  if (fetchingWeeklyPlan) {
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <CircularProgress />
      </div>
    );
  }

  if (!sousActivites || sousActivites.length === 0) {
    return (
      <div className={classes.emptyState}>
        <Typography color="textSecondary">
          {formatMessage('execution.noSousActivites')}
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography variant="subtitle2" gutterBottom>
        {formatMessage('weeklyPlan.title')} - T{quarter} {ptbaYearLabel(year, fiscalYearStart)}
      </Typography>
      <TableContainer className={classes.tableContainer}>
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell
                className={classes.headerCell}
                style={{
                  position: 'sticky',
                  left: 0,
                  backgroundColor: '#fff',
                  zIndex: 2,
                  minWidth: 200,
                  textAlign: 'left',
                }}
              >
                {formatMessage('sousActivite')}
              </TableCell>
              {weeks.map((week) => (
                <TableCell key={week.weekNum} className={classes.headerCell}>
                  <div>{week.label}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 'normal' }}>
                    {week.dateRange}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sousActivites.map((sa) => (
              <TableRow key={sa.id}>
                <TableCell className={classes.sousActiviteCell}>
                  {sa.name}
                </TableCell>
                {weeks.map((week) => {
                  const key = `${sa.id}_${week.start}`;
                  const entry = entryMap[key];
                  return (
                    <TableCell
                      key={week.weekNum}
                      className={classes.weekCell}
                      onClick={() => handleCellClick(sa, week, entry)}
                    >
                      {entry ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <WeeklyStatusBadge status={entry.status} size="small" />
                            {canDelete && (
                              <Tooltip title={formatMessage('tooltip.delete')}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleDeleteEntry(entry, e)}
                                  style={{ padding: 2 }}
                                >
                                  <DeleteIcon style={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                          {entry.plannedDescription && (
                            <Tooltip title={entry.plannedDescription}>
                              <div className={classes.weekDescription}>
                                {entry.plannedDescription}
                              </div>
                            </Tooltip>
                          )}
                        </div>
                      ) : (
                        canCreate && (
                          <Tooltip title={formatMessage('tooltip.createButton')}>
                            <AddIcon
                              fontSize="small"
                              style={{ color: '#bbb', display: 'block', margin: '0 auto' }}
                            />
                          </Tooltip>
                        )
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {formOpen && (
        <WeeklyPlanForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingEntry(null); }}
          onSave={handleFormSave}
          onDelete={canDelete ? (entry) => {
            if (entry?.id) confirmDeleteEntry(entry, closeForm);
            else closeForm();
          } : null}
          entry={editingEntry}
          sousActiviteName={editingSousActiviteName}
          readOnly={editingEntry?.id ? !canUpdate : !canCreate}
        />
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  weeklyPlanEntries: state.activity.weeklyPlanEntries,
  fetchingWeeklyPlan: state.activity.fetchingWeeklyPlan,
  submittingMutation: state.activity.submittingMutation,
  mutation: state.activity.mutation,
  confirm: state.core.confirm,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWeeklyPlanEntries,
  createWeeklyPlanEntry,
  updateWeeklyPlanEntry,
  deleteWeeklyPlanEntry,
  journalize,
  coreConfirm,
  clearConfirm,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WeeklyPlanTab);
