import React from 'react';
import { useSelector } from 'react-redux';

import ListAlt from '@material-ui/icons/ListAlt';
import DashboardIcon from '@material-ui/icons/Dashboard';
import DateRangeIcon from '@material-ui/icons/DateRange';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

import { MainMenuContribution, useModulesManager, useTranslations } from '@openimis/fe-core';
import {
  MODULE_NAME,
  ACTIVITY_MAIN_MENU_CONTRIBUTION_KEY,
  RIGHT_PTBA_SEARCH,
  RIGHT_DASHBOARD_VIEW,
  RIGHT_ACTIVITY_SEARCH,
  RIGHT_FUNDING_MANAGE,
  ROUTE_PTBA_LIST,
  ROUTE_DASHBOARD,
  ROUTE_WEEKLY_PLAN,
  ROUTE_FUNDING_SOURCES,
  ROUTE_CALENDAR,
} from '../constants';

function ActivityMainMenu(props) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((store) => store.core?.user?.i_user?.rights ?? []);

  const entries = [];

  if (rights.includes(RIGHT_PTBA_SEARCH)) {
    entries.push({
      text: formatMessage('menu.ptba'),
      icon: <ListAlt />,
      route: `/${ROUTE_PTBA_LIST}`,
      filter: (r) => r.includes(RIGHT_PTBA_SEARCH),
      id: 'activity.menu.ptba',
    });
  }

  if (rights.includes(RIGHT_ACTIVITY_SEARCH)) {
    entries.push({
      text: formatMessage('menu.weeklyPlan'),
      icon: <DateRangeIcon />,
      route: `/${ROUTE_WEEKLY_PLAN}`,
      filter: (r) => r.includes(RIGHT_ACTIVITY_SEARCH),
      id: 'activity.menu.weeklyPlan',
    });
  }

  if (rights.includes(RIGHT_FUNDING_MANAGE)) {
    entries.push({
      text: formatMessage('menu.fundingSources'),
      icon: <AccountBalanceIcon />,
      route: `/${ROUTE_FUNDING_SOURCES}`,
      filter: (r) => r.includes(RIGHT_FUNDING_MANAGE),
      id: 'activity.menu.fundingSources',
    });
  }

  if (rights.includes(RIGHT_ACTIVITY_SEARCH)) {
    entries.push({
      text: formatMessage('menu.calendar'),
      icon: <CalendarTodayIcon />,
      route: `/${ROUTE_CALENDAR}`,
      filter: (r) => r.includes(RIGHT_ACTIVITY_SEARCH),
      id: 'activity.menu.calendar',
    });
  }

  if (rights.includes(RIGHT_DASHBOARD_VIEW)) {
    entries.push({
      text: formatMessage('menu.dashboard'),
      icon: <DashboardIcon />,
      route: `/${ROUTE_DASHBOARD}`,
      filter: (r) => r.includes(RIGHT_DASHBOARD_VIEW),
      id: 'activity.menu.dashboard',
    });
  }

  return (
    <MainMenuContribution
      {...props}
      header={formatMessage('menu.main')}
      icon={<ListAlt />}
      entries={entries}
      filter={(r) => r.includes(RIGHT_PTBA_SEARCH) || r.includes(RIGHT_DASHBOARD_VIEW) || r.includes(RIGHT_ACTIVITY_SEARCH) || r.includes(RIGHT_FUNDING_MANAGE)}
      contributionKey={ACTIVITY_MAIN_MENU_CONTRIBUTION_KEY}
    />
  );
}

export default ActivityMainMenu;
