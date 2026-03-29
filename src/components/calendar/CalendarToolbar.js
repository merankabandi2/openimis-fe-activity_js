import React from 'react';
import {
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Badge,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TodayIcon from '@material-ui/icons/Today';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import {
  MODULE_NAME,
  CALENDAR_VIEW,
  CALENDAR_COLOR_BY,
  CALENDAR_GROUP_BY,
} from '../../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(1),
  },
  navGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  periodLabel: {
    fontSize: '1rem',
    fontWeight: 600,
    minWidth: 160,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  select: {
    minWidth: 140,
    '& .MuiInputBase-root': {
      fontSize: '0.85rem',
    },
  },
  searchField: {
    width: 180,
    '& .MuiInputBase-root': {
      fontSize: '0.85rem',
    },
  },
  viewButton: {
    textTransform: 'none',
    fontSize: '0.8rem',
  },
  activeView: {
    backgroundColor: theme.palette.primary?.main || '#1976d2',
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.primary?.dark || '#1565c0',
    },
  },
}));

function CalendarToolbar({
  view,
  onViewChange,
  colorBy,
  onColorByChange,
  groupBy,
  onGroupByChange,
  periodLabel,
  onPrev,
  onNext,
  onToday,
  searchText,
  onSearchChange,
  activeFilterCount,
  onToggleFilters,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  return (
    <Paper className={classes.root} variant="outlined">
      {/* Navigation */}
      <Box className={classes.navGroup}>
        <Tooltip title={formatMessage('calendar.today')}>
          <IconButton size="small" onClick={onToday}>
            <TodayIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton size="small" onClick={onPrev}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography className={classes.periodLabel}>
          {periodLabel}
        </Typography>
        <IconButton size="small" onClick={onNext}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* View toggle */}
      <ButtonGroup size="small" variant="outlined">
        {Object.values(CALENDAR_VIEW).map((v) => (
          <Button
            key={v}
            className={`${classes.viewButton} ${view === v ? classes.activeView : ''}`}
            onClick={() => onViewChange(v)}
          >
            {formatMessage(`calendar.view.${v}`)}
          </Button>
        ))}
      </ButtonGroup>

      <Box className={classes.spacer} />

      {/* Controls */}
      <Box className={classes.controlGroup}>
        <FormControl className={classes.select} size="small" variant="outlined">
          <InputLabel>{formatMessage('calendar.colorBy')}</InputLabel>
          <Select
            value={colorBy}
            onChange={(e) => onColorByChange(e.target.value)}
            label={formatMessage('calendar.colorBy')}
          >
            {Object.values(CALENDAR_COLOR_BY).map((cb) => (
              <MenuItem key={cb} value={cb}>
                {formatMessage(`calendar.colorBy.${cb}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className={classes.select} size="small" variant="outlined">
          <InputLabel>{formatMessage('calendar.groupBy')}</InputLabel>
          <Select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value)}
            label={formatMessage('calendar.groupBy')}
          >
            {Object.values(CALENDAR_GROUP_BY).map((gb) => (
              <MenuItem key={gb} value={gb}>
                {formatMessage(`calendar.groupBy.${gb}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          className={classes.searchField}
          size="small"
          variant="outlined"
          placeholder={formatMessage('calendar.filter.search')}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Tooltip title={formatMessage('calendar.filter.title')}>
          <IconButton size="small" onClick={onToggleFilters}>
            <Badge
              badgeContent={activeFilterCount}
              color="secondary"
              invisible={!activeFilterCount}
            >
              <FilterListIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}

export default CalendarToolbar;
