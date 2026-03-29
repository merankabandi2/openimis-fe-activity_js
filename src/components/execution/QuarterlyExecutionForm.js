import React, { useState, useEffect, useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SaveIcon from '@material-ui/icons/Save';
import {
  useModulesManager,
  useTranslations,
  journalize,
} from '@openimis/fe-core';
import { MODULE_NAME, QUARTERS } from '../../constants';
import {
  fetchQuarterlyExecutions,
  reportQuarterlyExecution,
} from '../../actions';
import { formatBIFAmount } from '../../utils/string-utils';
import ExecutionProgressBar from './ExecutionProgressBar';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  filterRow: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
  },
  table: {
    minWidth: 800,
  },
  headerCell: {
    fontWeight: 600,
    backgroundColor: '#f5f5f5',
    fontSize: '0.8rem',
  },
  inputCell: {
    padding: theme.spacing(0.5),
  },
  readOnlyCell: {
    backgroundColor: '#fafafa',
  },
  computedCell: {
    fontWeight: 500,
    color: '#1976d2',
  },
  sectionTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 600,
  },
  saveButton: {
    marginTop: theme.spacing(2),
  },
  progressSection: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: '#f5f7fa',
    borderRadius: theme.spacing(1),
  },
}));

function QuarterlyExecutionForm({
  activiteId,
  sousActivites,
  readOnly,
  fetchQuarterlyExecutions,
  reportQuarterlyExecution,
  quarterlyExecutions,
  fetchingQuarterlyExecutions,
  submittingMutation,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const currentYear = new Date().getFullYear();
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (activiteId && selectedQuarter && selectedYear) {
      fetchQuarterlyExecutions(modulesManager, [
        `sousActivite_Activite_Id: "${activiteId}"`,
        `quarter: ${selectedQuarter}`,
        `year: ${selectedYear}`,
      ]);
    }
  }, [activiteId, selectedQuarter, selectedYear]);

  useEffect(() => {
    const newFormData = {};
    if (quarterlyExecutions && quarterlyExecutions.length > 0) {
      quarterlyExecutions.forEach((exec) => {
        const saId = exec.sousActivite?.id;
        if (saId) {
          newFormData[saId] = {
            budgetEngage: exec.budgetEngage || 0,
            budgetDecaisse: exec.budgetDecaisse || 0,
            resultatsRealises: exec.resultatsRealises || 0,
            observations: exec.observations || '',
          };
        }
      });
    }
    setFormData(newFormData);
  }, [quarterlyExecutions]);

  const handleFieldChange = (saId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [saId]: {
        ...(prev[saId] || {}),
        [field]: value,
      },
    }));
  };

  const getPlannedBudget = (sa) => {
    const key = `budgetT${selectedQuarter}`;
    return parseFloat(sa[key]) || 0;
  };

  const getPlannedQuantity = (sa) => {
    const key = `quantityT${selectedQuarter}`;
    return parseFloat(sa[key]) || 0;
  };

  const computeRate = (actual, planned) => {
    if (!planned || planned === 0) return 0;
    return ((parseFloat(actual) || 0) / planned) * 100;
  };

  const handleSave = (saId) => {
    const sa = sousActivites.find((s) => s.id === saId);
    if (!sa) return;
    const data = formData[saId] || {};
    reportQuarterlyExecution(
      {
        sousActiviteId: saId,
        quarter: selectedQuarter,
        year: selectedYear,
        budgetEngage: data.budgetEngage || 0,
        budgetDecaisse: data.budgetDecaisse || 0,
        resultatsRealises: data.resultatsRealises || 0,
        observations: data.observations || '',
      },
      formatMessage('execution.mutation.reportLabel'),
    );
  };

  const handleSaveAll = () => {
    sousActivites.forEach((sa) => {
      if (formData[sa.id]) {
        handleSave(sa.id);
      }
    });
  };

  const aggregatedRates = useMemo(() => {
    let totalPrevu = 0;
    let totalEngage = 0;
    let totalDecaisse = 0;
    let totalAttendus = 0;
    let totalRealises = 0;

    (sousActivites || []).forEach((sa) => {
      const data = formData[sa.id] || {};
      totalPrevu += getPlannedBudget(sa);
      totalEngage += parseFloat(data.budgetEngage) || 0;
      totalDecaisse += parseFloat(data.budgetDecaisse) || 0;
      totalAttendus += getPlannedQuantity(sa);
      totalRealises += parseFloat(data.resultatsRealises) || 0;
    });

    return {
      tauxEngagement: totalPrevu ? (totalEngage / totalPrevu) * 100 : 0,
      tauxDecaissement: totalPrevu ? (totalDecaisse / totalPrevu) * 100 : 0,
      tauxRealisation: totalAttendus ? (totalRealises / totalAttendus) * 100 : 0,
    };
  }, [sousActivites, formData, selectedQuarter]);

  if (!sousActivites || sousActivites.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        {formatMessage('execution.noSousActivites')}
      </Typography>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.filterRow}>
        <FormControl style={{ minWidth: 120 }}>
          <InputLabel>{formatMessage('execution.quarter')}</InputLabel>
          <Select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
          >
            {QUARTERS.map((q) => (
              <MenuItem key={q.value} value={q.value}>{q.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ minWidth: 120 }}>
          <InputLabel>{formatMessage('execution.year')}</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className={classes.progressSection}>
        <Typography variant="subtitle2" gutterBottom>
          {formatMessage('execution.aggregatedProgress')}
        </Typography>
        <ExecutionProgressBar
          tauxEngagement={aggregatedRates.tauxEngagement}
          tauxDecaissement={aggregatedRates.tauxDecaissement}
          tauxRealisation={aggregatedRates.tauxRealisation}
        />
      </div>

      {fetchingQuarterlyExecutions ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <CircularProgress size={24} />
        </div>
      ) : (
        <TableContainer component={Paper} style={{ marginTop: 16 }}>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell className={classes.headerCell}>
                  {formatMessage('sousActivite.name')}
                </TableCell>
                <TableCell className={classes.headerCell} align="right">
                  {formatMessage('execution.budgetPrevu')}
                </TableCell>
                <TableCell className={classes.headerCell} align="right">
                  {formatMessage('execution.budgetEngage')}
                </TableCell>
                <TableCell className={classes.headerCell} align="right">
                  {formatMessage('execution.budgetDecaisse')}
                </TableCell>
                <TableCell className={classes.headerCell} align="right">
                  {formatMessage('execution.tauxEngagement')}
                </TableCell>
                <TableCell className={classes.headerCell} align="right">
                  {formatMessage('execution.tauxDecaissement')}
                </TableCell>
                <TableCell className={classes.headerCell} align="right">
                  {formatMessage('execution.resultatsAttendus')}
                </TableCell>
                <TableCell className={classes.headerCell} align="right">
                  {formatMessage('execution.resultatsRealises')}
                </TableCell>
                <TableCell className={classes.headerCell} align="right">
                  {formatMessage('execution.tauxRealisation')}
                </TableCell>
                <TableCell className={classes.headerCell}>
                  {formatMessage('execution.observations')}
                </TableCell>
                {!readOnly && (
                  <TableCell className={classes.headerCell} />
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {sousActivites.map((sa) => {
                const data = formData[sa.id] || {};
                const budgetPrevu = getPlannedBudget(sa);
                const resultatsAttendus = getPlannedQuantity(sa);
                const tauxEng = computeRate(data.budgetEngage, budgetPrevu);
                const tauxDec = computeRate(data.budgetDecaisse, budgetPrevu);
                const tauxReal = computeRate(data.resultatsRealises, resultatsAttendus);

                return (
                  <TableRow key={sa.id}>
                    <TableCell>{sa.name}</TableCell>
                    <TableCell align="right" className={classes.readOnlyCell}>
                      {formatBIFAmount(budgetPrevu)}
                    </TableCell>
                    <TableCell align="right" className={classes.inputCell}>
                      {readOnly ? (
                        formatBIFAmount(data.budgetEngage)
                      ) : (
                        <TextField
                          type="number"
                          size="small"
                          variant="outlined"
                          value={data.budgetEngage || ''}
                          onChange={(e) => handleFieldChange(sa.id, 'budgetEngage', e.target.value)}
                          inputProps={{ style: { textAlign: 'right', padding: '6px 8px' } }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right" className={classes.inputCell}>
                      {readOnly ? (
                        formatBIFAmount(data.budgetDecaisse)
                      ) : (
                        <TextField
                          type="number"
                          size="small"
                          variant="outlined"
                          value={data.budgetDecaisse || ''}
                          onChange={(e) => handleFieldChange(sa.id, 'budgetDecaisse', e.target.value)}
                          inputProps={{ style: { textAlign: 'right', padding: '6px 8px' } }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right" className={classes.computedCell}>
                      {tauxEng.toFixed(1)}%
                    </TableCell>
                    <TableCell align="right" className={classes.computedCell}>
                      {tauxDec.toFixed(1)}%
                    </TableCell>
                    <TableCell align="right" className={classes.readOnlyCell}>
                      {resultatsAttendus}
                    </TableCell>
                    <TableCell align="right" className={classes.inputCell}>
                      {readOnly ? (
                        data.resultatsRealises || 0
                      ) : (
                        <TextField
                          type="number"
                          size="small"
                          variant="outlined"
                          value={data.resultatsRealises || ''}
                          onChange={(e) => handleFieldChange(sa.id, 'resultatsRealises', e.target.value)}
                          inputProps={{ style: { textAlign: 'right', padding: '6px 8px' } }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right" className={classes.computedCell}>
                      {tauxReal.toFixed(1)}%
                    </TableCell>
                    <TableCell className={classes.inputCell}>
                      {readOnly ? (
                        data.observations || ''
                      ) : (
                        <TextField
                          size="small"
                          variant="outlined"
                          value={data.observations || ''}
                          onChange={(e) => handleFieldChange(sa.id, 'observations', e.target.value)}
                          inputProps={{ style: { padding: '6px 8px' } }}
                          fullWidth
                        />
                      )}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleSave(sa.id)}
                          disabled={submittingMutation}
                        >
                          <SaveIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!readOnly && sousActivites.length > 1 && (
        <Button
          variant="contained"
          color="primary"
          className={classes.saveButton}
          onClick={handleSaveAll}
          disabled={submittingMutation}
          startIcon={<SaveIcon />}
        >
          {formatMessage('execution.saveAll')}
        </Button>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  quarterlyExecutions: state.activity.quarterlyExecutions,
  fetchingQuarterlyExecutions: state.activity.fetchingQuarterlyExecutions,
  submittingMutation: state.activity.submittingMutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchQuarterlyExecutions,
  reportQuarterlyExecution,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(QuarterlyExecutionForm);
