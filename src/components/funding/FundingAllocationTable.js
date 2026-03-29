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
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/styles';

import {
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import { allocateFunding, deallocateFunding, fetchFundingSources } from '../../actions';
import { MODULE_NAME } from '../../constants';
import { formatBIFAmount } from '../../utils/string-utils';
import FundingSourcePicker from '../../pickers/FundingSourcePicker';

const useStyles = makeStyles((theme) => ({
  table: {
    marginTop: theme.spacing(1),
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: '0.8rem',
    padding: '6px 12px',
  },
  cell: {
    padding: '6px 12px',
    fontSize: '0.85rem',
  },
  totalRow: {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: theme.spacing(1),
  },
}));

function FundingAllocationTable({
  sousActiviteId,
  allocations,
  budgetTotal,
  readOnly,
  allocateFunding,
  deallocateFunding,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    const allocs = (allocations || []).map((a) => ({
      id: a.id,
      fundingSource: a.fundingSource,
      amount: parseFloat(a.amount || 0),
    }));
    setRows(allocs);
  }, [allocations]);

  const totalAllocated = rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const totalBudget = parseFloat(budgetTotal) || 0;

  const handleAddRow = () => {
    setRows([...rows, { id: null, fundingSource: null, amount: 0, _isNew: true, _tempId: `new-${Date.now()}` }]);
  };

  const handleCellChange = (rowIndex, field, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
    setRows(newRows);
  };

  const handleSaveRow = (row) => {
    if (!row.fundingSource || !row.amount) return;
    allocateFunding(
      {
        id: row.id,
        sousActiviteId,
        fundingSourceId: row.fundingSource.id,
        amount: row.amount,
      },
      formatMessage('fundingSource.addSource'),
    );
  };

  const handleDeleteRow = (row) => {
    if (row._isNew) {
      setRows(rows.filter((r) => r._tempId !== row._tempId));
    } else {
      deallocateFunding(
        row,
        formatMessageWithValues('fundingSource.mutation.deallocateLabel', { id: row.id }),
      );
    }
  };

  return (
    <div className={classes.table}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.headerCell}>{formatMessage('fundingSource')}</TableCell>
            <TableCell className={classes.headerCell} align="right">{formatMessage('fundingSource.amount')}</TableCell>
            <TableCell className={classes.headerCell} align="right">{formatMessage('fundingSource.percentage')}</TableCell>
            {!readOnly && <TableCell className={classes.headerCell} align="center" />}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => {
            const pct = totalBudget > 0
              ? ((parseFloat(row.amount) || 0) / totalBudget * 100).toFixed(1)
              : '0.0';
            return (
              <TableRow key={row.id || row._tempId}>
                <TableCell className={classes.cell}>
                  {row._isNew && !readOnly ? (
                    <FundingSourcePicker
                      value={row.fundingSource?.id}
                      onChange={(fs) => handleCellChange(idx, 'fundingSource', fs)}
                    />
                  ) : (
                    <Typography variant="body2">
                      {row.fundingSource?.code} - {row.fundingSource?.name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell className={classes.cell} align="right">
                  {!readOnly ? (
                    <TextField
                      value={row.amount}
                      onChange={(e) => handleCellChange(idx, 'amount', e.target.value)}
                      type="number"
                      size="small"
                    />
                  ) : (
                    <Typography variant="body2">{formatBIFAmount(row.amount)}</Typography>
                  )}
                </TableCell>
                <TableCell className={classes.cell} align="right">
                  <Typography variant="body2">{pct}%</Typography>
                </TableCell>
                {!readOnly && (
                  <TableCell className={classes.cell} align="center">
                    <Tooltip title={formatMessage('tooltip.save')}>
                      <IconButton size="small" onClick={() => handleSaveRow(row)}>
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={formatMessage('tooltip.delete')}>
                      <IconButton size="small" onClick={() => handleDeleteRow(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          <TableRow className={classes.totalRow}>
            <TableCell className={classes.cell}>
              <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                {formatMessage('fundingSource.total')}
              </Typography>
            </TableCell>
            <TableCell className={classes.cell} align="right">
              <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                {formatBIFAmount(totalAllocated)}
              </Typography>
            </TableCell>
            <TableCell className={classes.cell} align="right">
              <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                {totalBudget > 0 ? (totalAllocated / totalBudget * 100).toFixed(1) : '0.0'}%
              </Typography>
            </TableCell>
            {!readOnly && <TableCell />}
          </TableRow>
        </TableBody>
      </Table>
      {!readOnly && (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          className={classes.addButton}
        >
          {formatMessage('fundingSource.addSource')}
        </Button>
      )}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  allocateFunding,
  deallocateFunding,
}, dispatch);

export default connect(null, mapDispatchToProps)(FundingAllocationTable);
