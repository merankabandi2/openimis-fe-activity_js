import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  Button,
  TableContainer,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { makeStyles } from '@material-ui/styles';

import {
  useModulesManager,
  useTranslations,
  journalize,
  coreConfirm,
  clearConfirm,
} from '@openimis/fe-core';
import {
  createSousActivite,
  updateSousActivite,
  deleteSousActivite,
  beginRevision,
  approveRevision,
  rejectRevision,
} from '../../actions';
import { MODULE_NAME } from '../../constants';
import { formatBIFAmount } from '../../utils/string-utils';
import { displayedBudgets, sousActiviteUpdatePayload } from '../../utils/sous-activite';
import RevisionStatusBadge from '../lifecycle/RevisionStatusBadge';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    overflowX: 'auto',
    marginTop: theme.spacing(1),
  },
  table: {
    minWidth: 1600,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: '0.75rem',
    padding: '4px 8px',
    whiteSpace: 'nowrap',
  },
  cell: {
    padding: '4px 8px',
    fontSize: '0.8rem',
  },
  editableCell: {
    padding: '2px 4px',
  },
  input: {
    fontSize: '0.8rem',
    padding: '4px',
  },
  totalRow: {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: theme.spacing(1),
  },
  ecartPositive: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  ecartNegative: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  ecartZero: {
    color: theme.palette.text.secondary,
  },
}));

const EMPTY_ROW = {
  id: null,
  name: '',
  unit: '',
  quantityT1: 0,
  quantityT2: 0,
  quantityT3: 0,
  quantityT4: 0,
  unitCost: 0,
  quantityInitial: 0,
  quantityRevised: 0,
  unitCostInitial: 0,
  unitCostRevised: 0,
  budgetInitial: 0,
  budgetRevised: 0,
  dateStart: '',
  dateEnd: '',
  responsible: '',
  revisionStatus: 'INITIAL',
  revisionComment: '',
};

function SousActiviteTable({
  activiteId,
  sousActivites,
  permissions,
  confirmed,
  createSousActivite,
  updateSousActivite,
  deleteSousActivite,
  beginRevision,
  approveRevision,
  rejectRevision,
  coreConfirm,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [rows, setRows] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [confirmedAction, setConfirmedAction] = useState(() => null);

  const canCreate = !!permissions?.canCreateSousActivite;
  const canUpdate = !!permissions?.canUpdateSousActivite;
  const canDelete = !!permissions?.canDeleteSousActivite;
  const canBeginRevision = !!permissions?.canBeginRevision;
  const canDecideRevision = !!permissions?.canDecideRevision;
  const readOnly = !(canCreate || canUpdate || canDelete || canBeginRevision || canDecideRevision);
  const originals = {};
  (sousActivites || []).forEach((sa) => { originals[sa.id] = sa; });
  const canEditRow = (row) => (row._isNew ? canCreate : canUpdate);

  // Only the table that opened the shared confirm dialog holds a callback.
  useEffect(() => {
    if (confirmed && confirmedAction) {
      confirmedAction();
      setConfirmedAction(() => null);
    }
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    const sorted = [...(sousActivites || [])].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
    );
    setRows(sorted);
  }, [sousActivites]);

  const handleCellChange = (rowIndex, field, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
    setRows(newRows);
  };

  const handleAddRow = () => {
    const newRow = {
      ...EMPTY_ROW,
      _isNew: true,
      _tempId: `new-${Date.now()}`,
      sortOrder: rows.length,
    };
    setRows([...rows, newRow]);
    setEditingRowId(newRow._tempId);
  };

  const handleSaveRow = (row, rowIndex) => {
    if (!row._isNew) {
      updateSousActivite(
        sousActiviteUpdatePayload(row, originals[row.id]),
        formatMessageWithValues('sousActivite.mutation.updateLabel', { id: row.id }),
      );
      setEditingRowId(null);
      return;
    }
    const uc = parseFloat(row.unitCost) || 0;
    const q1 = parseFloat(row.quantityT1) || 0;
    const q2 = parseFloat(row.quantityT2) || 0;
    const q3 = parseFloat(row.quantityT3) || 0;
    const q4 = parseFloat(row.quantityT4) || 0;

    const sousActiviteData = {
      ...row,
      activiteId,
      quantityTotal: String(q1 + q2 + q3 + q4),
      quantityT1: String(q1),
      quantityT2: String(q2),
      quantityT3: String(q3),
      quantityT4: String(q4),
      unitCost: String(uc),
      budgetT1: String(q1 * uc),
      budgetT2: String(q2 * uc),
      budgetT3: String(q3 * uc),
      budgetT4: String(q4 * uc),
      budgetTotal: String((q1 + q2 + q3 + q4) * uc),
      sortOrder: rowIndex,
    };

    createSousActivite(
      sousActiviteData,
      formatMessage('sousActivite.mutation.createLabel'),
    );
    setEditingRowId(null);
  };

  const handleDeleteRow = (row) => {
    if (row._isNew) {
      setRows(rows.filter((r) => r._tempId !== row._tempId));
    } else {
      setConfirmedAction(() => () => deleteSousActivite(
        row,
        formatMessageWithValues('sousActivite.mutation.deleteLabel', { id: row.id }),
      ));
      coreConfirm(
        formatMessage('sousActivite.delete.confirm.title'),
        formatMessage('sousActivite.delete.confirm.message'),
      );
    }
  };

  const handleBeginRevision = (row) => {
    beginRevision(
      row.id,
      formatMessageWithValues('revision.mutation.beginLabel', { id: row.id }),
    );
  };

  const handleApproveRevision = (row) => {
    approveRevision(
      row.id,
      '',
      formatMessageWithValues('revision.mutation.approveLabel', { id: row.id }),
    );
  };

  const handleRejectRevision = (row) => {
    rejectRevision(
      row.id,
      '',
      formatMessageWithValues('revision.mutation.rejectLabel', { id: row.id }),
    );
  };

  const grandTotal = rows.reduce(
    (sum, row) => sum + displayedBudgets(row, originals[row.id]).budgetTotal,
    0,
  );

  const isEditing = (row) => {
    if (row._isNew) return editingRowId === row._tempId;
    return editingRowId === row.id;
  };

  const renderEditableCell = (row, rowIndex, field, type) => {
    if (!canEditRow(row) || !isEditing(row)) {
      const val = row[field];
      if (type === 'number') {
        return <Typography variant="body2">{formatBIFAmount(val)}</Typography>;
      }
      return <Typography variant="body2">{val}</Typography>;
    }
    return (
      <TextField
        value={row[field] ?? ''}
        onChange={(e) => handleCellChange(rowIndex, field, e.target.value)}
        type={type || 'text'}
        inputProps={{ className: classes.input }}
        size="small"
        fullWidth
      />
    );
  };

  const computeEcart = (row) => {
    const budgetRevised = parseFloat(row.budgetRevised) || 0;
    const budgetInitial = parseFloat(row.budgetInitial) || 0;
    return budgetRevised - budgetInitial;
  };

  const getEcartClass = (ecart) => {
    if (ecart > 0) return classes.ecartPositive;
    if (ecart < 0) return classes.ecartNegative;
    return classes.ecartZero;
  };

  return (
    <div>
      <TableContainer className={classes.tableContainer}>
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell}>{formatMessage('sousActivite.name')}</TableCell>
              <TableCell className={classes.headerCell}>{formatMessage('sousActivite.unit')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('field.quantityInitial')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('field.quantityRevised')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('field.unitCostInitial')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('field.unitCostRevised')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('field.budgetInitial')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('field.budgetRevised')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('field.budgetEcart')}</TableCell>
              <TableCell className={classes.headerCell}>{formatMessage('field.dateStart')}</TableCell>
              <TableCell className={classes.headerCell}>{formatMessage('field.dateEnd')}</TableCell>
              <TableCell className={classes.headerCell}>{formatMessage('field.responsible')}</TableCell>
              <TableCell className={classes.headerCell}>{formatMessage('revision.status')}</TableCell>
              <TableCell className={classes.headerCell}>{formatMessage('revision.comment')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('sousActivite.quantityT1')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('sousActivite.quantityT2')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('sousActivite.quantityT3')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('sousActivite.quantityT4')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('sousActivite.unitCost')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('sousActivite.budgetT1')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('sousActivite.budgetT2')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('sousActivite.budgetT3')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('sousActivite.budgetT4')}</TableCell>
              <TableCell className={classes.headerCell} align="right">{formatMessage('sousActivite.budgetTotal')}</TableCell>
              {!readOnly && (
                <TableCell className={classes.headerCell} align="center" />
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => {
              const {
                budgetT1: b1, budgetT2: b2, budgetT3: b3, budgetT4: b4, budgetTotal: total,
              } = displayedBudgets(row, originals[row.id]);
              const ecart = computeEcart(row);

              return (
                <TableRow
                  key={row.id || row._tempId}
                  hover
                  onClick={() => canEditRow(row) && setEditingRowId(row.id || row._tempId)}
                >
                  <TableCell className={classes.cell}>
                    {renderEditableCell(row, idx, 'name', 'text')}
                  </TableCell>
                  <TableCell className={classes.cell}>
                    {renderEditableCell(row, idx, 'unit', 'text')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'quantityInitial', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'quantityRevised', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'unitCostInitial', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'unitCostRevised', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'budgetInitial', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'budgetRevised', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="body2" className={getEcartClass(ecart)}>
                      {formatBIFAmount(ecart)}
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.cell}>
                    {renderEditableCell(row, idx, 'dateStart', 'date')}
                  </TableCell>
                  <TableCell className={classes.cell}>
                    {renderEditableCell(row, idx, 'dateEnd', 'date')}
                  </TableCell>
                  <TableCell className={classes.cell}>
                    {renderEditableCell(row, idx, 'responsible', 'text')}
                  </TableCell>
                  <TableCell className={classes.cell}>
                    <RevisionStatusBadge status={row.revisionStatus} />
                  </TableCell>
                  <TableCell className={classes.cell}>
                    {renderEditableCell(row, idx, 'revisionComment', 'text')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'quantityT1', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'quantityT2', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'quantityT3', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'quantityT4', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {renderEditableCell(row, idx, 'unitCost', 'number')}
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="body2">{formatBIFAmount(b1)}</Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="body2">{formatBIFAmount(b2)}</Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="body2">{formatBIFAmount(b3)}</Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="body2">{formatBIFAmount(b4)}</Typography>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                      {formatBIFAmount(total)}
                    </Typography>
                  </TableCell>
                  {!readOnly && (
                    <TableCell className={classes.cell} align="center">
                      {isEditing(row) && (
                        <Tooltip title={formatMessage('tooltip.save')}>
                          <IconButton size="small" onClick={() => handleSaveRow(row, idx)}>
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {!row._isNew && canBeginRevision && row.revisionStatus !== 'REVISE' && (
                        <Tooltip title={formatMessage('revision.begin')}>
                          <IconButton size="small" onClick={() => handleBeginRevision(row)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {!row._isNew && canDecideRevision && row.revisionStatus === 'REVISE' && (
                        <Tooltip title={formatMessage('revision.approve')}>
                          <IconButton size="small" onClick={() => handleApproveRevision(row)}>
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {!row._isNew && canDecideRevision && row.revisionStatus === 'REVISE' && (
                        <Tooltip title={formatMessage('revision.reject')}>
                          <IconButton size="small" onClick={() => handleRejectRevision(row)}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(row._isNew || canDelete) && (
                        <Tooltip title={formatMessage('tooltip.delete')}>
                          <IconButton size="small" onClick={() => handleDeleteRow(row)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            <TableRow className={classes.totalRow}>
              {/* colSpan must match the number of data columns before budgetTotal (columns 1-23) */}
              <TableCell className={classes.cell} colSpan={23}>
                <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                  {formatMessage('total')}
                </Typography>
              </TableCell>
              <TableCell className={classes.cell} align="right">
                <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                  {formatBIFAmount(grandTotal)}
                </Typography>
              </TableCell>
              {!readOnly && <TableCell />}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {canCreate && (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          className={classes.addButton}
        >
          {formatMessage('sousActivite.addRow')}
        </Button>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  createSousActivite,
  updateSousActivite,
  deleteSousActivite,
  beginRevision,
  approveRevision,
  rejectRevision,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SousActiviteTable);
