import React, { useState, useEffect, useRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import CancelIcon from '@material-ui/icons/Cancel';
import { makeStyles } from '@material-ui/styles';

import {
  Helmet,
  useModulesManager,
  useTranslations,
  journalize,
  coreConfirm,
  clearConfirm,
} from '@openimis/fe-core';
import {
  fetchFundingSources,
  createFundingSource,
  updateFundingSource,
  deleteFundingSource,
} from '../actions';
import {
  MODULE_NAME,
  RIGHT_FUNDING_MANAGE,
} from '../constants';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  paper: {
    padding: theme.spacing(2),
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  cell: {
    fontSize: '0.85rem',
  },
}));

const EMPTY_SOURCE = {
  id: null,
  code: '',
  name: '',
  isActive: true,
  _isNew: true,
};

function FundingSourcesPage({
  rights,
  fundingSources,
  fetchingFundingSources,
  submittingMutation,
  mutation,
  fetchFundingSources,
  createFundingSource,
  updateFundingSource,
  deleteFundingSource,
  confirmed,
  coreConfirm,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [addingNew, setAddingNew] = useState(false);
  const [newSource, setNewSource] = useState({ ...EMPTY_SOURCE });
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingRef = useRef();

  useEffect(() => {
    fetchFundingSources(modulesManager, ['first: 100']);
  }, []);

  useEffect(() => {
    if (prevSubmittingRef.current && !submittingMutation) {
      journalize(mutation);
      fetchFundingSources(modulesManager, ['first: 100']);
      setEditingId(null);
      setAddingNew(false);
      setNewSource({ ...EMPTY_SOURCE });
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingRef.current = submittingMutation;
  });

  useEffect(() => {
    if (confirmed && confirmedAction) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  const canManage = rights.includes(RIGHT_FUNDING_MANAGE);

  const handleEdit = (fs) => {
    setEditingId(fs.id);
    setEditingData({ ...fs });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSaveEdit = () => {
    updateFundingSource(
      editingData,
      formatMessageWithValues('fundingSource.mutation.updateLabel', { id: editingData.id }),
    );
  };

  const handleDelete = (fs) => {
    setConfirmedAction(() => () => {
      deleteFundingSource(
        fs,
        formatMessageWithValues('fundingSource.mutation.deleteLabel', { id: fs.id }),
      );
    });
    coreConfirm(
      formatMessage('fundingSource.delete.confirm.title'),
      formatMessage('fundingSource.delete.confirm.message'),
    );
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setNewSource({ ...EMPTY_SOURCE });
  };

  const handleSaveNew = () => {
    createFundingSource(
      newSource,
      formatMessage('fundingSource.mutation.createLabel'),
    );
  };

  const handleCancelNew = () => {
    setAddingNew(false);
    setNewSource({ ...EMPTY_SOURCE });
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('fundingSource.page.title')} />
      <Paper className={classes.paper}>
        <div className={classes.headerRow}>
          <Typography variant="h6">
            {formatMessage('fundingSource.page.title')}
          </Typography>
          {canManage && !addingNew && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              disabled={submittingMutation}
            >
              {formatMessage('fundingSource.add')}
            </Button>
          )}
        </div>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell}>{formatMessage('fundingSource.code')}</TableCell>
              <TableCell className={classes.headerCell}>{formatMessage('fundingSource.name')}</TableCell>
              <TableCell className={classes.headerCell}>{formatMessage('fundingSource.isActive')}</TableCell>
              {canManage && <TableCell className={classes.headerCell} align="center" />}
            </TableRow>
          </TableHead>
          <TableBody>
            {addingNew && (
              <TableRow>
                <TableCell className={classes.cell}>
                  <TextField
                    value={newSource.code}
                    onChange={(e) => setNewSource({ ...newSource, code: e.target.value })}
                    size="small"
                    fullWidth
                    placeholder={formatMessage('fundingSource.code')}
                  />
                </TableCell>
                <TableCell className={classes.cell}>
                  <TextField
                    value={newSource.name}
                    onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                    size="small"
                    fullWidth
                    placeholder={formatMessage('fundingSource.name')}
                  />
                </TableCell>
                <TableCell className={classes.cell}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newSource.isActive}
                        onChange={(e) => setNewSource({ ...newSource, isActive: e.target.checked })}
                        size="small"
                      />
                    }
                    label=""
                  />
                </TableCell>
                <TableCell className={classes.cell} align="center">
                  <Tooltip title={formatMessage('tooltip.save')}>
                    <IconButton
                      size="small"
                      onClick={handleSaveNew}
                      disabled={!newSource.code || !newSource.name}
                    >
                      <SaveIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={formatMessage('transition.cancel')}>
                    <IconButton size="small" onClick={handleCancelNew}>
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )}
            {(fundingSources || []).map((fs) => {
              const isEditing = editingId === fs.id;
              return (
                <TableRow key={fs.id}>
                  <TableCell className={classes.cell}>
                    {isEditing ? (
                      <TextField
                        value={editingData.code}
                        onChange={(e) => setEditingData({ ...editingData, code: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      fs.code
                    )}
                  </TableCell>
                  <TableCell className={classes.cell}>
                    {isEditing ? (
                      <TextField
                        value={editingData.name}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      fs.name
                    )}
                  </TableCell>
                  <TableCell className={classes.cell}>
                    {isEditing ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editingData.isActive}
                            onChange={(e) => setEditingData({ ...editingData, isActive: e.target.checked })}
                            size="small"
                          />
                        }
                        label=""
                      />
                    ) : (
                      fs.isActive ? formatMessage('fundingSource.active') : formatMessage('fundingSource.inactive')
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell className={classes.cell} align="center">
                      {isEditing ? (
                        <>
                          <Tooltip title={formatMessage('tooltip.save')}>
                            <IconButton size="small" onClick={handleSaveEdit}>
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={formatMessage('transition.cancel')}>
                            <IconButton size="small" onClick={handleCancelEdit}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title={formatMessage('tooltip.edit')}>
                            <IconButton size="small" onClick={() => handleEdit(fs)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={formatMessage('tooltip.delete')}>
                            <IconButton size="small" onClick={() => handleDelete(fs)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  fundingSources: state.activity.fundingSources,
  fetchingFundingSources: state.activity.fetchingFundingSources,
  submittingMutation: state.activity.submittingMutation,
  mutation: state.activity.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchFundingSources,
  createFundingSource,
  updateFundingSource,
  deleteFundingSource,
  journalize,
  coreConfirm,
  clearConfirm,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(FundingSourcesPage);
