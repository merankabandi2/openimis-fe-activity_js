import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { MODULE_NAME, STATUS_COLORS } from '../../constants';
import { fetchTransitionHistory } from '../../actions';
import StatusBadge from './StatusBadge';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  listItem: {
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  arrowIcon: {
    fontSize: '1rem',
    color: theme.palette.text.secondary,
  },
  meta: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
  comment: {
    fontStyle: 'italic',
    marginTop: theme.spacing(0.5),
  },
  empty: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(3),
  },
}));

function TransitionHistory({
  activiteId,
  transitionHistory,
  fetchingTransitionHistory,
  fetchTransitionHistory,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  useEffect(() => {
    if (activiteId) {
      fetchTransitionHistory(modulesManager, [`activite_Id: "${activiteId}"`, 'orderBy: ["-transitioned_at"]']);
    }
  }, [activiteId]);

  if (fetchingTransitionHistory) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress size={24} />
      </div>
    );
  }

  if (!transitionHistory || transitionHistory.length === 0) {
    return (
      <div className={classes.empty}>
        <Typography variant="body2" color="textSecondary">
          {formatMessage('transition.history.empty')}
        </Typography>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatUser = (user) => {
    if (!user) return '';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || '';
  };

  return (
    <div className={classes.root}>
      <List>
        {transitionHistory.map((transition, index) => (
          <React.Fragment key={transition.id}>
            <ListItem className={classes.listItem} alignItems="flex-start">
              <ListItemIcon>
                <ArrowForwardIcon
                  style={{ color: STATUS_COLORS[transition.toStatus] || '#9e9e9e' }}
                />
              </ListItemIcon>
              <ListItemText
                primary={(
                  <div className={classes.statusRow}>
                    <StatusBadge status={transition.fromStatus} />
                    <ArrowForwardIcon className={classes.arrowIcon} />
                    <StatusBadge status={transition.toStatus} />
                  </div>
                )}
                secondary={(
                  <>
                    <Typography component="span" className={classes.meta}>
                      {formatDate(transition.transitionedAt)}
                      {transition.transitionedBy
                        ? ` - ${formatUser(transition.transitionedBy)}`
                        : ''}
                    </Typography>
                    {transition.comment && (
                      <Typography
                        component="p"
                        variant="body2"
                        className={classes.comment}
                      >
                        {transition.comment}
                      </Typography>
                    )}
                  </>
                )}
              />
            </ListItem>
            {index < transitionHistory.length - 1 && <Divider variant="inset" />}
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

const mapStateToProps = (state) => ({
  transitionHistory: state.activity.transitionHistory,
  fetchingTransitionHistory: state.activity.fetchingTransitionHistory,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTransitionHistory,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TransitionHistory);
