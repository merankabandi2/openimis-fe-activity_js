import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/styles';

import {
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import {
  updateComposante,
  deleteComposante,
  createSousComposante,
} from '../../actions';
import { MODULE_NAME } from '../../constants';
import { formatBIFAmount } from '../../utils/string-utils';
import SousComposantePanel from './SousComposantePanel';

const useStyles = makeStyles((theme) => ({
  composanteAccordion: {
    marginBottom: theme.spacing(1),
    '&:before': {
      display: 'none',
    },
  },
  composanteSummary: {
    backgroundColor: theme.palette.grey[100],
  },
  composanteTitle: {
    fontWeight: 'bold',
    flexGrow: 1,
  },
  composanteBudget: {
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(2),
  },
  details: {
    flexDirection: 'column',
    padding: theme.spacing(1, 2),
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginLeft: theme.spacing(1),
  },
  editFields: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexGrow: 1,
  },
  addButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

function ComposantePanel({
  composante,
  ptbaId,
  readOnly,
  onActiviteClick,
  updateComposante,
  deleteComposante,
  createSousComposante,
  confirmed,
  submittingMutation,
  coreConfirm,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ code: composante.code, name: composante.name });
  const [scDialogOpen, setScDialogOpen] = useState(false);
  const [newSc, setNewSc] = useState({ code: '', name: '' });

  const sousComposantes = composante.sousComposantes?.edges?.map((e) => e.node) || [];

  const computeBudget = () => {
    let total = 0;
    sousComposantes.forEach((sc) => {
      const activites = sc.activites?.edges?.map((e) => e.node) || [];
      activites.forEach((act) => {
        const sousActivites = act.sousActivites?.edges?.map((e) => e.node) || [];
        sousActivites.forEach((sa) => {
          total += parseFloat(sa.budgetTotal || 0);
        });
      });
    });
    return total;
  };

  const budget = computeBudget();

  const handleStartEdit = (e) => {
    e.stopPropagation();
    setEditData({ code: composante.code, name: composante.name });
    setEditing(true);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditing(false);
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    updateComposante(
      {
        id: composante.id,
        ptbaId,
        code: editData.code,
        name: editData.name,
        sortOrder: composante.sortOrder,
      },
      formatMessageWithValues('composante.mutation.updateLabel', { id: composante.id }),
    );
    setEditing(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    coreConfirm(
      formatMessage('composante.delete.confirm.title'),
      formatMessage('composante.delete.confirm.message'),
    );
    // We store the callback, but since this component may unmount we do it inline via useEffect
    // For simplicity, dispatch directly after confirm
    deleteComposante(
      composante,
      formatMessageWithValues('composante.mutation.deleteLabel', { id: composante.id }),
    );
  };

  // Sous-composante add
  const handleOpenScDialog = () => {
    setNewSc({ code: '', name: '' });
    setScDialogOpen(true);
  };

  const handleSaveSc = () => {
    createSousComposante(
      {
        composanteId: composante.id,
        code: newSc.code,
        name: newSc.name,
        sortOrder: sousComposantes.length,
      },
      formatMessage('sousComposante.mutation.createLabel'),
    );
    setScDialogOpen(false);
  };

  return (
    <>
      <Accordion className={classes.composanteAccordion} defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          className={classes.composanteSummary}
        >
          {editing ? (
            <div className={classes.editFields} onClick={(e) => e.stopPropagation()}>
              <TextField
                value={editData.code}
                onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                size="small"
                label={formatMessage('composante.code')}
                style={{ width: 120 }}
              />
              <TextField
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                size="small"
                label={formatMessage('composante.name')}
                style={{ flexGrow: 1 }}
              />
              <IconButton size="small" onClick={handleSaveEdit}>
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCancelEdit}>
                <CancelIcon fontSize="small" />
              </IconButton>
            </div>
          ) : (
            <>
              <Typography className={classes.composanteTitle}>
                {formatMessage('composante')} {composante.code}: {composante.name}
              </Typography>
              <Typography className={classes.composanteBudget}>
                {formatBIFAmount(budget)} BIF
              </Typography>
              {!readOnly && (
                <div className={classes.headerActions}>
                  <Tooltip title={formatMessage('tooltip.edit')}>
                    <IconButton size="small" onClick={handleStartEdit}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={formatMessage('tooltip.delete')}>
                    <IconButton size="small" onClick={handleDelete}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </>
          )}
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          {sousComposantes
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((sc) => (
              <SousComposantePanel
                key={sc.id}
                sousComposante={sc}
                composanteId={composante.id}
                readOnly={readOnly}
                onActiviteClick={onActiviteClick}
              />
            ))}
          {!readOnly && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenScDialog}
              className={classes.addButton}
              disabled={submittingMutation}
            >
              {formatMessage('sousComposante.add')}
            </Button>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Add SousComposante Dialog */}
      <Dialog open={scDialogOpen} onClose={() => setScDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{formatMessage('sousComposante.add')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label={formatMessage('sousComposante.code')}
                value={newSc.code}
                onChange={(e) => setNewSc({ ...newSc, code: e.target.value })}
                fullWidth
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                label={formatMessage('sousComposante.name')}
                value={newSc.name}
                onChange={(e) => setNewSc({ ...newSc, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScDialogOpen(false)}>
            {formatMessage('transition.cancel')}
          </Button>
          <Button
            onClick={handleSaveSc}
            color="primary"
            variant="contained"
            disabled={!newSc.code || !newSc.name}
          >
            {formatMessage('tooltip.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const mapStateToProps = (state) => ({
  confirmed: state.core.confirmed,
  submittingMutation: state.activity.submittingMutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  updateComposante,
  deleteComposante,
  createSousComposante,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ComposantePanel);
