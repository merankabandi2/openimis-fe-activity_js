import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import {
  MODULE_NAME,
  ACTIVITY_STATUS,
  VALID_TRANSITIONS,
  RIGHT_PTBA_UPDATE,
  RIGHT_TRANSITION,
  RIGHT_EXECUTION_REPORT,
  RIGHT_EXECUTION_APPROVE,
  STATUS_COLORS,
} from '../../constants';

const TRANSITION_CONFIG = {
  [`${ACTIVITY_STATUS.PLANIFIE}_${ACTIVITY_STATUS.BUDGETISE}`]: {
    labelKey: 'transition.budgetiser',
    right: RIGHT_PTBA_UPDATE,
  },
  [`${ACTIVITY_STATUS.BUDGETISE}_${ACTIVITY_STATUS.EN_COURS}`]: {
    labelKey: 'transition.demarrer',
    right: RIGHT_TRANSITION,
  },
  [`${ACTIVITY_STATUS.EN_COURS}_${ACTIVITY_STATUS.REALISE}`]: {
    labelKey: 'transition.marquerRealise',
    right: RIGHT_EXECUTION_REPORT,
  },
  [`${ACTIVITY_STATUS.REALISE}_${ACTIVITY_STATUS.CLOTURE}`]: {
    labelKey: 'transition.cloturer',
    right: RIGHT_EXECUTION_APPROVE,
  },
  [`${ACTIVITY_STATUS.BUDGETISE}_${ACTIVITY_STATUS.PLANIFIE}`]: {
    labelKey: 'transition.revenirPlanifie',
    right: RIGHT_TRANSITION,
  },
  [`${ACTIVITY_STATUS.REALISE}_${ACTIVITY_STATUS.EN_COURS}`]: {
    labelKey: 'transition.reouvrir',
    right: RIGHT_TRANSITION,
  },
};

const useStyles = makeStyles((theme) => ({
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

function TransitionButton({ activite, rights, onTransition }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedTransition, setSelectedTransition] = useState(null);

  if (!activite?.status) return null;

  const possibleTargets = VALID_TRANSITIONS[activite.status] || [];
  const availableTransitions = possibleTargets
    .map((target) => {
      const key = `${activite.status}_${target}`;
      const config = TRANSITION_CONFIG[key];
      if (!config) return null;
      if (!rights.includes(config.right)) return null;
      return { target, ...config };
    })
    .filter(Boolean);

  if (availableTransitions.length === 0) return null;

  const handleClick = (transition) => {
    setSelectedTransition(transition);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (selectedTransition && onTransition) {
      onTransition(selectedTransition.target, comment);
    }
    setDialogOpen(false);
    setComment('');
    setSelectedTransition(null);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setComment('');
    setSelectedTransition(null);
  };

  return (
    <>
      <div className={classes.buttonGroup}>
        {availableTransitions.map((transition) => (
          <Button
            key={transition.target}
            variant="contained"
            size="small"
            onClick={() => handleClick(transition)}
            style={{
              backgroundColor: STATUS_COLORS[transition.target] || '#1976d2',
              color: '#fff',
            }}
          >
            {formatMessage(transition.labelKey)}
          </Button>
        ))}
      </div>

      <Dialog open={dialogOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTransition
            ? formatMessage(selectedTransition.labelKey)
            : ''}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={formatMessage('transition.comment')}
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>
            {formatMessage('transition.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            color="primary"
            variant="contained"
          >
            {formatMessage('transition.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TransitionButton;
