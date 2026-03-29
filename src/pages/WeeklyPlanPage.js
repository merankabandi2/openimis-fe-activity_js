import React, { useState, useEffect, useRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Paper,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/styles';

import {
  Helmet,
  useModulesManager,
  useTranslations,
  journalize,
} from '@openimis/fe-core';
import {
  fetchPtbas,
  fetchActivites,
  fetchActivite,
  fetchWeeklyPlanEntries,
  createWeeklyPlanEntry,
  updateWeeklyPlanEntry,
  deleteWeeklyPlanEntry,
} from '../actions';
import { MODULE_NAME, RIGHT_ACTIVITY_SEARCH } from '../constants';
import WeeklyStatusBadge from '../components/lifecycle/WeeklyStatusBadge';
import WeeklyPlanForm from '../components/weekly/WeeklyPlanForm';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  filterPaper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    minWidth: 1200,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: '0.75rem',
    padding: '6px 10px',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    minWidth: 120,
  },
  cell: {
    padding: '4px 8px',
    fontSize: '0.8rem',
    verticalAlign: 'top',
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
  responsableCell: {
    padding: '4px 8px',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    position: 'sticky',
    left: 200,
    backgroundColor: '#fff',
    zIndex: 1,
    minWidth: 120,
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
  actionButtons: {
    display: 'flex',
    gap: 2,
  },
}));

function getWeeksInRange(startDate, endDate) {
  const weeks = [];
  if (!startDate || !endDate) return weeks;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Find the Monday of the week containing startDate
  const dayOfWeek = start.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(start);
  currentMonday.setDate(start.getDate() + diff);

  let weekNum = 1;
  while (currentMonday <= end) {
    const friday = new Date(currentMonday);
    friday.setDate(currentMonday.getDate() + 4);

    weeks.push({
      weekNum,
      start: currentMonday.toISOString().split('T')[0],
      end: friday.toISOString().split('T')[0],
      label: `Sem ${weekNum}`,
      dateRange: `${formatShortDate(currentMonday)} - ${formatShortDate(friday)}`,
    });

    weekNum += 1;
    currentMonday.setDate(currentMonday.getDate() + 7);
  }

  return weeks;
}

function formatShortDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function WeeklyPlanPage({
  rights,
  ptbas,
  fetchingPtbas,
  activites,
  fetchingActivites,
  activite,
  fetchingActivite,
  weeklyPlanEntries,
  fetchingWeeklyPlan,
  submittingMutation,
  mutation,
  fetchPtbas,
  fetchActivites,
  fetchActivite,
  fetchWeeklyPlanEntries,
  createWeeklyPlanEntry,
  updateWeeklyPlanEntry,
  deleteWeeklyPlanEntry,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const [selectedPtbaId, setSelectedPtbaId] = useState('');
  const [selectedActiviteId, setSelectedActiviteId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingSousActiviteId, setEditingSousActiviteId] = useState(null);
  const [editingSousActiviteName, setEditingSousActiviteName] = useState('');
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    fetchPtbas(modulesManager, ['first: 100']);
  }, []);

  useEffect(() => {
    if (selectedPtbaId) {
      fetchActivites(modulesManager, [`sousComposante_Composante_Ptba_Id: "${selectedPtbaId}"`, 'first: 500']);
    }
  }, [selectedPtbaId]);

  useEffect(() => {
    if (selectedActiviteId) {
      fetchActivite(modulesManager, [`id: "${selectedActiviteId}"`]);
      fetchWeeklyPlanEntries(modulesManager, [`sousActivite_Activite_Id: "${selectedActiviteId}"`, 'first: 500']);
    }
  }, [selectedActiviteId]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (selectedActiviteId) {
        fetchWeeklyPlanEntries(modulesManager, [`sousActivite_Activite_Id: "${selectedActiviteId}"`, 'first: 500']);
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  if (!rights.includes(RIGHT_ACTIVITY_SEARCH)) {
    return (
      <div className={classes.page}>
        <Typography>{formatMessage('error.insufficientPermissions')}</Typography>
      </div>
    );
  }

  // Use the full activite fetched with ACTIVITE_FULL_PROJECTION (includes sousActivites)
  // rather than the list item which uses ACTIVITE_LIST_PROJECTION (no sousActivites).
  const selectedActiviteFull = (activite && activite.id === selectedActiviteId) ? activite : null;
  const sousActivites = selectedActiviteFull?.sousActivites?.edges?.map((e) => e.node) || [];

  // Determine date range from the selected PTBA
  const selectedPtba = ptbas?.find((p) => p.id === selectedPtbaId);
  const dateRangeStart = selectedPtba?.fiscalYearStart || '';
  const dateRangeEnd = selectedPtba?.fiscalYearEnd || '';
  const weeks = getWeeksInRange(dateRangeStart, dateRangeEnd);

  // Build a lookup: sousActiviteId + weekStart -> entry
  const entryMap = {};
  (weeklyPlanEntries || []).forEach((entry) => {
    const saId = entry.sousActivite?.id;
    const key = `${saId}_${entry.weekStart}`;
    entryMap[key] = entry;
  });

  const handleCellClick = (sousActivite, week, existingEntry) => {
    setEditingSousActiviteId(sousActivite.id);
    setEditingSousActiviteName(sousActivite.name);
    setEditingEntry(existingEntry || {
      sousActiviteId: sousActivite.id,
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

  const handleDelete = (entry) => {
    deleteWeeklyPlanEntry(entry, formatMessage('weeklyPlan.mutation.deleteLabel'));
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('weeklyPlan.title')} />

      <Paper className={classes.filterPaper}>
        <Typography variant="h6" gutterBottom>
          {formatMessage('weeklyPlan.title')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              select
              label="PTBA"
              value={selectedPtbaId}
              onChange={(e) => {
                setSelectedPtbaId(e.target.value);
                setSelectedActiviteId('');
              }}
              fullWidth
              size="small"
              variant="outlined"
            >
              {(ptbas || []).map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField
              select
              label={formatMessage('activite')}
              value={selectedActiviteId}
              onChange={(e) => setSelectedActiviteId(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              disabled={!selectedPtbaId || fetchingActivites}
            >
              {(activites || []).map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.code} - {a.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {fetchingWeeklyPlan && (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <CircularProgress />
        </div>
      )}

      {selectedActiviteId && !fetchingWeeklyPlan && sousActivites.length === 0 && (
        <Paper className={classes.emptyState}>
          <Typography color="textSecondary">
            {formatMessage('execution.noSousActivites')}
          </Typography>
        </Paper>
      )}

      {selectedActiviteId && sousActivites.length > 0 && weeks.length > 0 && (
        <Paper>
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
                    }}
                  >
                    {formatMessage('sousActivite')}
                  </TableCell>
                  <TableCell
                    className={classes.headerCell}
                    style={{
                      position: 'sticky',
                      left: 200,
                      backgroundColor: '#fff',
                      zIndex: 2,
                      minWidth: 120,
                    }}
                  >
                    {formatMessage('field.responsible')}
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
                    <TableCell className={classes.responsableCell}>
                      {sa.responsible || '-'}
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
                              <WeeklyStatusBadge status={entry.status} size="small" />
                              {entry.plannedDescription && (
                                <Tooltip title={entry.plannedDescription}>
                                  <div className={classes.weekDescription}>
                                    {entry.plannedDescription}
                                  </div>
                                </Tooltip>
                              )}
                            </div>
                          ) : (
                            <Tooltip title={formatMessage('tooltip.createButton')}>
                              <AddIcon
                                fontSize="small"
                                style={{ color: '#bbb', display: 'block', margin: '0 auto' }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {formOpen && (
        <WeeklyPlanForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingEntry(null); }}
          onSave={handleFormSave}
          entry={editingEntry}
          sousActiviteName={editingSousActiviteName}
          readOnly={false}
        />
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  ptbas: state.activity.ptbas,
  fetchingPtbas: state.activity.fetchingPtbas,
  activites: state.activity.activites,
  fetchingActivites: state.activity.fetchingActivites,
  activite: state.activity.activite,
  fetchingActivite: state.activity.fetchingActivite,
  weeklyPlanEntries: state.activity.weeklyPlanEntries,
  fetchingWeeklyPlan: state.activity.fetchingWeeklyPlan,
  submittingMutation: state.activity.submittingMutation,
  mutation: state.activity.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchPtbas,
  fetchActivites,
  fetchActivite,
  fetchWeeklyPlanEntries,
  createWeeklyPlanEntry,
  updateWeeklyPlanEntry,
  deleteWeeklyPlanEntry,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WeeklyPlanPage);
