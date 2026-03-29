import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import {
  Form,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import {
  clearPtba,
  createPtba,
  deletePtba,
  fetchPtba,
  updatePtba,
  createComposante,
  transitionPtba,
} from '../actions';
import {
  MODULE_NAME,
  RIGHT_PTBA_CREATE,
  RIGHT_PTBA_UPDATE,
  ROUTE_ACTIVITE,
  PTBA_VALID_TRANSITIONS,
} from '../constants';
import { ACTION_TYPE } from '../actions';
import { mutationLabel, pageTitle } from '../utils/string-utils';
import PTBAForm from '../components/ptba/PTBAForm';
import PTBAHeadPanel from '../components/ptba/PTBAHeadPanel';
import ComposantePanel from '../components/hierarchy/ComposantePanel';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
  hierarchyContainer: {
    padding: theme.spacing(2),
  },
  addComposanteBtn: {
    marginBottom: theme.spacing(2),
  },
  transitionBar: {
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

function PTBAPage({
  clearPtba,
  createPtba,
  deletePtba,
  updatePtba,
  ptbaId,
  fetchPtba,
  rights,
  confirmed,
  submittingMutation,
  mutation,
  ptba,
  coreConfirm,
  clearConfirm,
  createComposante,
  transitionPtba,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [editedPtba, setEditedPtba] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();
  const pageLocked = editedPtba?.status === 'CLOSED';

  // Composante add dialog
  const [composanteDialogOpen, setComposanteDialogOpen] = useState(false);
  const [newComposante, setNewComposante] = useState({ code: '', name: '' });

  const back = () => history.goBack();

  useEffect(() => {
    if (ptbaId) {
      fetchPtba(modulesManager, [`id: "${ptbaId}"`]);
    }
  }, [ptbaId]);

  useEffect(() => {
    if (confirmed) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_PTBA) {
        back();
      } else if (ptbaId) {
        // Re-fetch after any mutation to reflect changes
        fetchPtba(modulesManager, [`id: "${ptbaId}"`]);
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => setEditedPtba(ptba), [ptba]);

  useEffect(() => () => clearPtba(), []);

  const mandatoryFieldsEmpty = () => {
    if (
      editedPtba?.code
      && editedPtba?.name
      && editedPtba?.fiscalYearStart
      && editedPtba?.fiscalYearEnd
    ) return false;
    return true;
  };

  const canSave = () => !mandatoryFieldsEmpty();

  const handleSave = () => {
    if (ptba?.id) {
      updatePtba(
        editedPtba,
        formatMessageWithValues('ptba.mutation.updateLabel', mutationLabel(ptba)),
      );
    } else {
      createPtba(
        editedPtba,
        formatMessage('ptba.mutation.createLabel'),
      );
    }
    back();
  };

  const deletePtbaCallback = () => deletePtba(
    ptba,
    formatMessageWithValues('ptba.mutation.deleteLabel', mutationLabel(ptba)),
  );

  const openDeletePtbaConfirmDialog = () => {
    setConfirmedAction(() => deletePtbaCallback);
    coreConfirm(
      formatMessage('ptba.delete.confirm.title'),
      formatMessage('ptba.delete.confirm.message'),
    );
  };

  // --- Composante add ---
  const handleOpenComposanteDialog = () => {
    setNewComposante({ code: '', name: '' });
    setComposanteDialogOpen(true);
  };

  const handleSaveComposante = () => {
    const composantes = ptba?.composantes?.edges?.map((e) => e.node) || [];
    createComposante(
      {
        ptbaId: ptba.id,
        code: newComposante.code,
        name: newComposante.name,
        sortOrder: composantes.length,
      },
      formatMessage('composante.mutation.createLabel'),
    );
    setComposanteDialogOpen(false);
  };

  // --- PTBA transition ---
  const validTransitions = ptba?.status ? (PTBA_VALID_TRANSITIONS[ptba.status] || []) : [];

  const handlePtbaTransition = (toStatus) => {
    transitionPtba(
      ptba,
      toStatus,
      formatMessageWithValues('ptba.transition.label', { status: toStatus }),
    );
  };

  const actions = [
    !!ptbaId && !pageLocked && {
      doIt: openDeletePtbaConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: formatMessage('tooltip.delete'),
    },
  ];

  const canViewPage = ptbaId
    ? rights.includes(RIGHT_PTBA_UPDATE)
    : rights.includes(RIGHT_PTBA_CREATE);

  if (!canViewPage) {
    return (
      <div className={classes.page}>
        <Typography variant="h6">{formatMessage('error.insufficientPermissions')}</Typography>
      </div>
    );
  }

  const handleActiviteClick = (activite) => {
    history.push(`/${ROUTE_ACTIVITE}/${activite.id}`);
  };

  const composantes = ptba?.composantes?.edges?.map((e) => e.node) || [];

  return (
    <div className={pageLocked ? classes.lockedPage : null}>
      <div className={classes.page}>
        <Form
          module="activity"
          title={formatMessageWithValues('PTBAPage.title', pageTitle(ptba))}
          titleParams={pageTitle(ptba)}
          openDirty
          edited={editedPtba}
          onEditedChanged={setEditedPtba}
          back={back}
          mandatoryFieldsEmpty={mandatoryFieldsEmpty}
          canSave={canSave}
          save={ptbaId ? handleSave : handleSave}
          HeadPanel={PTBAForm}
          readOnly={pageLocked}
          rights={rights}
          actions={actions}
          setConfirmedAction={setConfirmedAction}
          saveTooltip={formatMessage('tooltip.save')}
        />
        {ptbaId && ptba && (
          <div className={classes.hierarchyContainer}>
            <PTBAHeadPanel ptba={ptba} />

            {/* PTBA Status Transition Buttons */}
            {validTransitions.length > 0 && !pageLocked && (
              <div className={classes.transitionBar}>
                {validTransitions.map((toStatus) => (
                  <Button
                    key={toStatus}
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handlePtbaTransition(toStatus)}
                    disabled={submittingMutation}
                  >
                    {formatMessage(`ptba.transition.${toStatus}`)}
                  </Button>
                ))}
              </div>
            )}

            {/* Add Composante Button */}
            {!pageLocked && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenComposanteDialog}
                className={classes.addComposanteBtn}
                disabled={submittingMutation}
              >
                {formatMessage('composante.add')}
              </Button>
            )}

            {composantes
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((composante) => (
                <ComposantePanel
                  key={composante.id}
                  composante={composante}
                  ptbaId={ptba.id}
                  readOnly={pageLocked}
                  onActiviteClick={handleActiviteClick}
                />
              ))}
          </div>
        )}
      </div>

      {/* Add Composante Dialog */}
      <Dialog open={composanteDialogOpen} onClose={() => setComposanteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{formatMessage('composante.add')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label={formatMessage('composante.code')}
                value={newComposante.code}
                onChange={(e) => setNewComposante({ ...newComposante, code: e.target.value })}
                fullWidth
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                label={formatMessage('composante.name')}
                value={newComposante.name}
                onChange={(e) => setNewComposante({ ...newComposante, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposanteDialogOpen(false)}>
            {formatMessage('transition.cancel')}
          </Button>
          <Button
            onClick={handleSaveComposante}
            color="primary"
            variant="contained"
            disabled={!newComposante.code || !newComposante.name}
          >
            {formatMessage('tooltip.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  clearPtba,
  createPtba,
  deletePtba,
  updatePtba,
  fetchPtba,
  createComposante,
  transitionPtba,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

const mapStateToProps = (state, props) => ({
  ptbaId: props.match.params.ptba_uuid,
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.activity.submittingMutation,
  mutation: state.activity.mutation,
  ptba: state.activity.ptba,
});

export default connect(mapStateToProps, mapDispatchToProps)(PTBAPage);
