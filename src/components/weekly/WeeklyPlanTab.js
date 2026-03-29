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
} from '@openimis/fe-core';
import {
  fetchWeeklyPlanEntries,
  createWeeklyPlanEntry,
  updateWeeklyPlanEntry,
  deleteWeeklyPlanEntry,
} from '../../actions';
import { MODULE_NAME } from '../../constants';
import WeeklyStatusBadge from '../lifecycle/WeeklyStatusBadge';
import WeeklyPlanForm from './WeeklyPlanForm';

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

function getWeeksForQuarter(quarter, year) {
  const weeks = [];
  if (!quarter || !year) return weeks;

  const quarterStartMonth = (quarter - 1) * 3;
  const start = new Date(year, quarterStartMonth, 1);
  const end = new Date(year, quarterStartMonth + 3, 0);

  const dayOfWeek = start.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(start);
  currentMonday.setDate(start.getDate() + diff);

  let weekNum = 1;
  while (currentMonday <= end) {
    const friday = new Date(currentMonday);
    friday.setDate(currentMonday.getDate() + 4);

    const day1 = String(currentMonday.getDate()).padStart(2, '0');
    const mon1 = String(currentMonday.getMonth() + 1).padStart(2, '0');
    const day2 = String(friday.getDate()).padStart(2, '0');
    const mon2 = String(friday.getMonth() + 1).padStart(2, '0');

    weeks.push({
      weekNum,
      start: currentMonday.toISOString().split('T')[0],
      end: friday.toISOString().split('T')[0],
      label: `Sem ${weekNum}`,
      dateRange: `${day1}/${mon1} - ${day2}/${mon2}`,
    });

    weekNum += 1;
    currentMonday.setDate(currentMonday.getDate() + 7);
  }

  return weeks;
}

function getCurrentQuarterAndYear() {
  const now = new Date();
  const month = now.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return { quarter, year: now.getFullYear() };
}

function WeeklyPlanTab({
  activiteId,
  sousActivites,
  readOnly,
  weeklyPlanEntries,
  fetchingWeeklyPlan,
  submittingMutation,
  mutation,
  fetchWeeklyPlanEntries,
  createWeeklyPlanEntry,
  updateWeeklyPlanEntry,
  deleteWeeklyPlanEntry,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const prevSubmittingMutationRef = useRef();

  const { quarter, year } = getCurrentQuarterAndYear();
  const weeks = getWeeksForQuarter(quarter, year);

  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingSousActiviteName, setEditingSousActiviteName] = useState('');

  useEffect(() => {
    if (activiteId) {
      fetchWeeklyPlanEntries(modulesManager, [`sousActivite_Activite_Id: "${activiteId}"`, 'first: 500']);
    }
  }, [activiteId]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (activiteId) {
        fetchWeeklyPlanEntries(modulesManager, [`sousActivite_Activite_Id: "${activiteId}"`, 'first: 500']);
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
    if (readOnly && !existingEntry) return;
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

  const handleDeleteEntry = (entry, e) => {
    e.stopPropagation();
    if (entry?.id) {
      deleteWeeklyPlanEntry(entry, formatMessage('weeklyPlan.mutation.deleteLabel'));
    }
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
        {formatMessage('weeklyPlan.title')} - T{quarter} {year}
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
                            {!readOnly && (
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
                        !readOnly && (
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
          onDelete={(entry) => {
            if (entry?.id) {
              deleteWeeklyPlanEntry(entry, formatMessage('weeklyPlan.mutation.deleteLabel'));
            }
            setFormOpen(false);
            setEditingEntry(null);
          }}
          entry={editingEntry}
          sousActiviteName={editingSousActiviteName}
          readOnly={readOnly}
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
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWeeklyPlanEntries,
  createWeeklyPlanEntry,
  updateWeeklyPlanEntry,
  deleteWeeklyPlanEntry,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WeeklyPlanTab);
