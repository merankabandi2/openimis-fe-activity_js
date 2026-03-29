import React from 'react';
import { useSelector } from 'react-redux';

import { Fab } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';

import {
  Helmet,
  useModulesManager,
  useTranslations,
  useHistory,
  withTooltip,
} from '@openimis/fe-core';
import {
  MODULE_NAME,
  ROUTE_PTBA,
  RIGHT_PTBA_CREATE,
  RIGHT_PTBA_SEARCH,
} from '../constants';
import PTBASearcher from '../components/ptba/PTBASearcher';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function PTBAListPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const onCreate = () => history.push(`/${ROUTE_PTBA}`);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('ptba.page.title')} />
      {rights.includes(RIGHT_PTBA_SEARCH)
        && <PTBASearcher />}
      {rights.includes(RIGHT_PTBA_CREATE)
        && withTooltip(
          <div className={classes.fab}>
            <Fab color="primary" onClick={onCreate}>
              <AddIcon />
            </Fab>
          </div>,
          formatMessage('tooltip.createButton'),
        )}
    </div>
  );
}

export default PTBAListPage;
