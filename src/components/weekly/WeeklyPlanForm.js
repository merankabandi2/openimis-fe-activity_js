import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, WEEKLY_STATUS } from '../../constants';
import WeeklyStatusBadge from '../lifecycle/WeeklyStatusBadge';

const useStyles = makeStyles((theme) => ({
  field: {
    marginBottom: theme.spacing(2),
  },
  readOnlyField: {
    backgroundColor: theme.palette.grey[100],
  },
}));

const WEEKLY_STATUS_LIST = Object.values(WEEKLY_STATUS);

function WeeklyPlanForm({
  open,
  onClose,
  onSave,
  onDelete,
  entry,
  sousActiviteName,
  readOnly,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const [formData, setFormData] = useState({
    weekStart: entry?.weekStart || '',
    weekEnd: entry?.weekEnd || '',
    plannedDescription: entry?.plannedDescription || '',
    statusDescription: entry?.statusDescription || '',
    status: entry?.status || WEEKLY_STATUS.PLANIFIE,
    responsible: entry?.responsible || '',
    intervenants: entry?.intervenants || '',
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = () => {
    onSave({
      ...entry,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{formatMessage('weeklyPlan.title')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              {formatMessage('sousActivite')}
            </Typography>
            <Typography variant="body1">
              {sousActiviteName || '-'}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label={formatMessage('weeklyPlan.week') + ' - ' + formatMessage('field.dateStart')}
              type="date"
              value={formData.weekStart}
              onChange={handleChange('weekStart')}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={readOnly}
              className={classes.field}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label={formatMessage('weeklyPlan.week') + ' - ' + formatMessage('field.dateEnd')}
              type="date"
              value={formData.weekEnd}
              onChange={handleChange('weekEnd')}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={readOnly}
              className={classes.field}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label={formatMessage('weeklyPlan.planned')}
              value={formData.plannedDescription}
              onChange={handleChange('plannedDescription')}
              multiline
              rows={3}
              fullWidth
              disabled={readOnly}
              className={classes.field}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label={formatMessage('weeklyPlan.statusDescription')}
              value={formData.statusDescription}
              onChange={handleChange('statusDescription')}
              multiline
              rows={3}
              fullWidth
              disabled={readOnly}
              className={classes.field}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label={formatMessage('weeklyPlan.status')}
              value={formData.status}
              onChange={handleChange('status')}
              fullWidth
              disabled={readOnly}
              className={classes.field}
            >
              {WEEKLY_STATUS_LIST.map((s) => (
                <MenuItem key={s} value={s}>
                  <WeeklyStatusBadge status={s} />
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label={formatMessage('field.responsible')}
              value={formData.responsible}
              onChange={handleChange('responsible')}
              fullWidth
              disabled={readOnly}
              className={classes.field}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label={formatMessage('field.intervenants')}
              value={formData.intervenants}
              onChange={handleChange('intervenants')}
              fullWidth
              disabled={readOnly}
              className={classes.field}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {formatMessage('transition.cancel')}
        </Button>
        {!readOnly && entry?.id && onDelete && (
          <Button onClick={() => onDelete(entry)} color="secondary">
            {formatMessage('tooltip.delete')}
          </Button>
        )}
        {!readOnly && (
          <Button onClick={handleSave} color="primary" variant="contained">
            {formatMessage('tooltip.save')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default WeeklyPlanForm;
