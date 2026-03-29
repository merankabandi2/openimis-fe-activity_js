import React, { useState, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import {
  useModulesManager,
  useTranslations,
  journalize,
} from '@openimis/fe-core';
import { MODULE_NAME } from '../../constants';
import {
  linkActivityToIndicator,
  unlinkActivityFromIndicator,
  fetchIndicators,
} from '../../actions';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  indicatorItem: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
  progressBar: {
    flexGrow: 1,
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: '0.75rem',
    fontWeight: 600,
    minWidth: 40,
    textAlign: 'right',
  },
  addButton: {
    marginTop: theme.spacing(2),
  },
  metaText: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  icon: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
  searchField: {
    marginBottom: theme.spacing(1),
  },
}));

function IndicatorLinkPanel({
  activiteId,
  indicators,
  readOnly,
  linkActivityToIndicator,
  unlinkActivityFromIndicator,
  fetchIndicators,
  submittingMutation,
  availableIndicators,
  fetchingIndicators,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (dialogOpen) {
      const params = ['first: 50'];
      if (searchText) {
        params.push(`name_Icontains: "${searchText}"`);
      }
      fetchIndicators(modulesManager, params);
    }
  }, [dialogOpen, searchText]);

  const handleLink = () => {
    if (selectedIndicatorId && activiteId) {
      linkActivityToIndicator(
        activiteId,
        parseInt(selectedIndicatorId, 10),
        formatMessage('indicator.mutation.linkLabel'),
      );
    }
    setDialogOpen(false);
    setSelectedIndicatorId('');
    setSearchText('');
  };

  const handleUnlink = (indicatorId) => {
    if (activiteId && indicatorId) {
      unlinkActivityFromIndicator(
        activiteId,
        indicatorId,
        formatMessage('indicator.mutation.unlinkLabel'),
      );
    }
  };

  const computeProgress = (indicator) => {
    const baseline = parseFloat(indicator.baseline) || 0;
    const target = parseFloat(indicator.target) || 0;
    const current = parseFloat(indicator.currentValue) || 0;
    if (target <= baseline) return 0;
    const progress = ((current - baseline) / (target - baseline)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleOpenDialog = () => {
    setSelectedIndicatorId('');
    setSearchText('');
    setDialogOpen(true);
  };

  const renderLinkDialog = () => (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{formatMessage('indicator.link')}</DialogTitle>
      <DialogContent>
        <TextField
          label={formatMessage('indicator.searchLabel')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          fullWidth
          className={classes.searchField}
          helperText={formatMessage('indicator.searchHelper')}
        />
        <TextField
          select
          label={formatMessage('indicator.selectLabel')}
          value={selectedIndicatorId}
          onChange={(e) => setSelectedIndicatorId(e.target.value)}
          fullWidth
          disabled={fetchingIndicators}
        >
          <MenuItem value="">
            <em>-</em>
          </MenuItem>
          {(availableIndicators || []).map((ind) => (
            <MenuItem key={ind.id} value={ind.id}>
              {ind.name}
              {ind.section ? ` (${ind.section.name})` : ''}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>
          {formatMessage('transition.cancel')}
        </Button>
        <Button
          onClick={handleLink}
          color="primary"
          variant="contained"
          disabled={!selectedIndicatorId}
        >
          {formatMessage('indicator.link')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (!indicators || indicators.length === 0) {
    return (
      <div className={classes.root}>
        <div className={classes.emptyState}>
          <TrendingUpIcon style={{ fontSize: 48, color: '#bdbdbd' }} />
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {formatMessage('indicator.empty')}
          </Typography>
          {!readOnly && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              disabled={submittingMutation}
            >
              {formatMessage('indicator.link')}
            </Button>
          )}
        </div>
        {renderLinkDialog()}
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <List>
        {indicators.map((indicator) => {
          const progress = computeProgress(indicator);
          return (
            <ListItem key={indicator.id} className={classes.indicatorItem}>
              <ListItemText
                primary={(
                  <Box display="flex" alignItems="center">
                    <TrendingUpIcon className={classes.icon} fontSize="small" />
                    <Typography variant="body1">
                      {indicator.name || indicator.description}
                    </Typography>
                  </Box>
                )}
                secondary={(
                  <>
                    <Typography className={classes.metaText}>
                      {formatMessage('indicator.baseline')}: {indicator.baseline || 0}
                      {' | '}
                      {formatMessage('indicator.target')}: {indicator.target || 0}
                      {' | '}
                      {formatMessage('indicator.current')}: {indicator.currentValue || 0}
                    </Typography>
                    <div className={classes.progressContainer}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        className={classes.progressBar}
                        color={progress >= 75 ? 'primary' : 'secondary'}
                      />
                      <Typography className={classes.progressText}>
                        {progress.toFixed(0)}%
                      </Typography>
                    </div>
                  </>
                )}
              />
              {!readOnly && (
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleUnlink(indicator.id)}
                    disabled={submittingMutation}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          );
        })}
      </List>

      {!readOnly && (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          className={classes.addButton}
          onClick={handleOpenDialog}
          disabled={submittingMutation}
        >
          {formatMessage('indicator.link')}
        </Button>
      )}

      {renderLinkDialog()}
    </div>
  );
}

const mapStateToProps = (state) => ({
  submittingMutation: state.activity.submittingMutation,
  availableIndicators: state.activity.indicators,
  fetchingIndicators: state.activity.fetchingIndicators,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  linkActivityToIndicator,
  unlinkActivityFromIndicator,
  fetchIndicators,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(IndicatorLinkPanel);
