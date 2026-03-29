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
  updateSousComposante,
  deleteSousComposante,
  createActivite,
} from '../../actions';
import { MODULE_NAME } from '../../constants';
import ActiviteCard from './ActiviteCard';

const useStyles = makeStyles((theme) => ({
  sousComposanteAccordion: {
    marginBottom: theme.spacing(0.5),
    boxShadow: 'none',
    '&:before': {
      display: 'none',
    },
  },
  sousComposanteSummary: {
    backgroundColor: theme.palette.grey[50],
    minHeight: 40,
    '& .MuiAccordionSummary-content': {
      margin: '8px 0',
    },
  },
  sousComposanteTitle: {
    fontWeight: 500,
    fontSize: '0.95rem',
    flexGrow: 1,
  },
  details: {
    flexDirection: 'column',
    padding: theme.spacing(0.5, 1),
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
  },
}));

function SousComposantePanel({
  sousComposante,
  composanteId,
  readOnly,
  onActiviteClick,
  updateSousComposante,
  deleteSousComposante,
  createActivite,
  submittingMutation,
  coreConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ code: sousComposante.code, name: sousComposante.name });
  const [actDialogOpen, setActDialogOpen] = useState(false);
  const [newActivite, setNewActivite] = useState({
    code: '',
    name: '',
    implementingStructure: '',
    procurementMethod: '',
    province: '',
    indicatorDescription: '',
  });

  const activites = sousComposante.activites?.edges?.map((e) => e.node) || [];

  const handleStartEdit = (e) => {
    e.stopPropagation();
    setEditData({ code: sousComposante.code, name: sousComposante.name });
    setEditing(true);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditing(false);
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    updateSousComposante(
      {
        id: sousComposante.id,
        composanteId,
        code: editData.code,
        name: editData.name,
        sortOrder: sousComposante.sortOrder,
      },
      formatMessageWithValues('sousComposante.mutation.updateLabel', { id: sousComposante.id }),
    );
    setEditing(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    coreConfirm(
      formatMessage('sousComposante.delete.confirm.title'),
      formatMessage('sousComposante.delete.confirm.message'),
    );
    deleteSousComposante(
      sousComposante,
      formatMessageWithValues('sousComposante.mutation.deleteLabel', { id: sousComposante.id }),
    );
  };

  // Activite add
  const handleOpenActDialog = () => {
    setNewActivite({
      code: '',
      name: '',
      implementingStructure: '',
      procurementMethod: '',
      province: '',
      indicatorDescription: '',
    });
    setActDialogOpen(true);
  };

  const handleSaveActivite = () => {
    createActivite(
      {
        sousComposanteId: sousComposante.id,
        code: newActivite.code,
        name: newActivite.name,
        implementingStructure: newActivite.implementingStructure || undefined,
        procurementMethod: newActivite.procurementMethod || undefined,
        province: newActivite.province || undefined,
        indicatorDescription: newActivite.indicatorDescription || undefined,
        sortOrder: activites.length,
      },
      formatMessage('activite.mutation.createLabel'),
    );
    setActDialogOpen(false);
  };

  return (
    <>
      <Accordion className={classes.sousComposanteAccordion} defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          className={classes.sousComposanteSummary}
        >
          {editing ? (
            <div className={classes.editFields} onClick={(e) => e.stopPropagation()}>
              <TextField
                value={editData.code}
                onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                size="small"
                label={formatMessage('sousComposante.code')}
                style={{ width: 120 }}
              />
              <TextField
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                size="small"
                label={formatMessage('sousComposante.name')}
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
              <Typography className={classes.sousComposanteTitle}>
                {formatMessage('sousComposante')} {sousComposante.code}: {sousComposante.name}
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
          {activites
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((activite) => (
              <ActiviteCard
                key={activite.id}
                activite={activite}
                readOnly={readOnly}
                onClick={onActiviteClick}
              />
            ))}
          {!readOnly && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenActDialog}
              className={classes.addButton}
              disabled={submittingMutation}
            >
              {formatMessage('activite.add')}
            </Button>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Add Activite Dialog */}
      <Dialog open={actDialogOpen} onClose={() => setActDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{formatMessage('activite.add')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <TextField
                label={formatMessage('activite.code')}
                value={newActivite.code}
                onChange={(e) => setNewActivite({ ...newActivite, code: e.target.value })}
                fullWidth
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={9}>
              <TextField
                label={formatMessage('activite.name')}
                value={newActivite.name}
                onChange={(e) => setNewActivite({ ...newActivite, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={formatMessage('activite.implementingStructure')}
                value={newActivite.implementingStructure}
                onChange={(e) => setNewActivite({ ...newActivite, implementingStructure: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={formatMessage('activite.procurementMethod')}
                value={newActivite.procurementMethod}
                onChange={(e) => setNewActivite({ ...newActivite, procurementMethod: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={formatMessage('activite.province')}
                value={newActivite.province}
                onChange={(e) => setNewActivite({ ...newActivite, province: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={formatMessage('activite.indicatorDescription')}
                value={newActivite.indicatorDescription}
                onChange={(e) => setNewActivite({ ...newActivite, indicatorDescription: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActDialogOpen(false)}>
            {formatMessage('transition.cancel')}
          </Button>
          <Button
            onClick={handleSaveActivite}
            color="primary"
            variant="contained"
            disabled={!newActivite.code || !newActivite.name}
          >
            {formatMessage('tooltip.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const mapStateToProps = (state) => ({
  submittingMutation: state.activity.submittingMutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  updateSousComposante,
  deleteSousComposante,
  createActivite,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SousComposantePanel);
