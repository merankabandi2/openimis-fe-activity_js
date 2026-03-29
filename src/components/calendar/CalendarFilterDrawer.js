import React from 'react';
import {
  Drawer,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Button,
  Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import CloseIcon from '@material-ui/icons/Close';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import {
  MODULE_NAME,
  ACTIVITY_STATUS_LIST,
  REVISION_STATUS,
  SOURCE_TYPES,
} from '../../constants';

const DRAWER_WIDTH = 320;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: DRAWER_WIDTH,
    flexShrink: 0,
  },
  drawerPaper: {
    width: DRAWER_WIDTH,
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  filterSection: {
    marginBottom: theme.spacing(2),
  },
  sectionLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.text?.secondary || '#666',
    marginBottom: theme.spacing(0.5),
    textTransform: 'uppercase',
  },
  chipGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
  },
  formControl: {
    width: '100%',
    marginBottom: theme.spacing(1.5),
  },
  dateRow: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  clearButton: {
    marginTop: theme.spacing(2),
    textTransform: 'none',
  },
}));

function CalendarFilterDrawer({
  open,
  onClose,
  filters,
  onFilterChange,
  ptbas,
  composantes,
  sousComposantes,
  responsibles,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const handleToggleChip = (filterKey, value) => {
    const current = filters[filterKey] || [];
    const idx = current.indexOf(value);
    if (idx >= 0) {
      onFilterChange(filterKey, current.filter((v) => v !== value));
    } else {
      onFilterChange(filterKey, [...current, value]);
    }
  };

  const handleClearAll = () => {
    onFilterChange('_clearAll', null);
  };

  const filteredSousComposantes = (sousComposantes || []).filter((sc) => {
    if (!filters.composantes || filters.composantes.length === 0) return true;
    return filters.composantes.some(
      (cId) => sc.composante && sc.composante.id === cId,
    );
  });

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="left"
      open={open}
      classes={{ paper: classes.drawerPaper }}
    >
      <Box className={classes.header}>
        <Typography className={classes.title}>
          {formatMessage('calendar.filter.title')}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* PTBA Selector */}
      <Box className={classes.filterSection}>
        <FormControl className={classes.formControl} size="small" variant="outlined">
          <InputLabel>PTBA</InputLabel>
          <Select
            value={filters.ptbaId || ''}
            onChange={(e) => onFilterChange('ptbaId', e.target.value)}
            label="PTBA"
          >
            {(ptbas || []).map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.code} - {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider />

      {/* Composante multi-select */}
      <Box className={classes.filterSection} style={{ marginTop: 12 }}>
        <Typography className={classes.sectionLabel}>
          {formatMessage('composante')}
        </Typography>
        <Box className={classes.chipGroup}>
          {(composantes || []).map((c) => (
            <Chip
              key={c.id}
              label={c.code || c.name}
              size="small"
              color={(filters.composantes || []).includes(c.id) ? 'primary' : 'default'}
              onClick={() => handleToggleChip('composantes', c.id)}
              variant={(filters.composantes || []).includes(c.id) ? 'default' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Sous-Composante multi-select */}
      {filteredSousComposantes.length > 0 && (
        <Box className={classes.filterSection}>
          <Typography className={classes.sectionLabel}>
            {formatMessage('sousComposante')}
          </Typography>
          <Box className={classes.chipGroup}>
            {filteredSousComposantes.map((sc) => (
              <Chip
                key={sc.id}
                label={sc.code || sc.name}
                size="small"
                color={(filters.sousComposantes || []).includes(sc.id) ? 'primary' : 'default'}
                onClick={() => handleToggleChip('sousComposantes', sc.id)}
                variant={(filters.sousComposantes || []).includes(sc.id) ? 'default' : 'outlined'}
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider />

      {/* Activity Status */}
      <Box className={classes.filterSection} style={{ marginTop: 12 }}>
        <Typography className={classes.sectionLabel}>
          {formatMessage('activite.status')}
        </Typography>
        <Box className={classes.chipGroup}>
          {ACTIVITY_STATUS_LIST.map((s) => (
            <Chip
              key={s}
              label={formatMessage(`status.${s}`)}
              size="small"
              color={(filters.statuses || []).includes(s) ? 'primary' : 'default'}
              onClick={() => handleToggleChip('statuses', s)}
              variant={(filters.statuses || []).includes(s) ? 'default' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Source */}
      <Box className={classes.filterSection}>
        <Typography className={classes.sectionLabel}>Source</Typography>
        <Box className={classes.chipGroup}>
          {Object.values(SOURCE_TYPES).map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              color={(filters.sources || []).includes(s) ? 'primary' : 'default'}
              onClick={() => handleToggleChip('sources', s)}
              variant={(filters.sources || []).includes(s) ? 'default' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Revision Status */}
      <Box className={classes.filterSection}>
        <Typography className={classes.sectionLabel}>
          {formatMessage('revision.status')}
        </Typography>
        <Box className={classes.chipGroup}>
          {Object.values(REVISION_STATUS).map((s) => (
            <Chip
              key={s}
              label={formatMessage(`revision.${s}`)}
              size="small"
              color={(filters.revisionStatuses || []).includes(s) ? 'primary' : 'default'}
              onClick={() => handleToggleChip('revisionStatuses', s)}
              variant={(filters.revisionStatuses || []).includes(s) ? 'default' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Responsible multi-select */}
      {responsibles && responsibles.length > 0 && (
        <Box className={classes.filterSection}>
          <Typography className={classes.sectionLabel}>
            {formatMessage('field.responsible')}
          </Typography>
          <Box className={classes.chipGroup}>
            {responsibles.map((r) => (
              <Chip
                key={r}
                label={r}
                size="small"
                color={(filters.responsibles || []).includes(r) ? 'primary' : 'default'}
                onClick={() => handleToggleChip('responsibles', r)}
                variant={(filters.responsibles || []).includes(r) ? 'default' : 'outlined'}
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider />

      {/* Date range */}
      <Box className={classes.filterSection} style={{ marginTop: 12 }}>
        <Typography className={classes.sectionLabel}>
          {formatMessage('calendar.filter.dateRange')}
        </Typography>
        <Box className={classes.dateRow}>
          <TextField
            type="date"
            size="small"
            variant="outlined"
            value={filters.dateStart || ''}
            onChange={(e) => onFilterChange('dateStart', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            type="date"
            size="small"
            variant="outlined"
            value={filters.dateEnd || ''}
            onChange={(e) => onFilterChange('dateEnd', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      </Box>

      {/* Toggles */}
      <Box className={classes.filterSection}>
        <FormControlLabel
          control={
            <Switch
              checked={!!filters.hasBudget}
              onChange={(e) => onFilterChange('hasBudget', e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2">
              {formatMessage('calendar.filter.hasBudget')}
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={!!filters.behindSchedule}
              onChange={(e) => onFilterChange('behindSchedule', e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2">
              {formatMessage('calendar.filter.behindSchedule')}
            </Typography>
          }
        />
      </Box>

      <Button
        className={classes.clearButton}
        variant="outlined"
        size="small"
        startIcon={<ClearAllIcon />}
        onClick={handleClearAll}
        fullWidth
      >
        {formatMessage('calendar.filter.clearAll')}
      </Button>
    </Drawer>
  );
}

export default CalendarFilterDrawer;
