/* eslint-disable camelcase */
import React from 'react';
import ListAlt from '@material-ui/icons/ListAlt';
import DashboardIcon from '@material-ui/icons/Dashboard';
import DateRangeIcon from '@material-ui/icons/DateRange';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { FormattedMessage } from '@openimis/fe-core';

// Pages
import PTBAListPage from './pages/PTBAListPage';
import PTBAPage from './pages/PTBAPage';
import ActivitePage from './pages/ActivitePage';
import PTBADashboardPage from './pages/PTBADashboardPage';
import WeeklyPlanPage from './pages/WeeklyPlanPage';
import FundingSourcesPage from './pages/FundingSourcesPage';
import ActivityCalendarPage from './pages/ActivityCalendarPage';

// Menu
import ActivityMainMenu from './menus/ActivityMainMenu';

// Pickers
import ActivityStatusPicker from './pickers/ActivityStatusPicker';
import QuarterPicker from './pickers/QuarterPicker';
import FundingSourcePicker from './pickers/FundingSourcePicker';

// Constants
import {
  RIGHT_PTBA_SEARCH,
  RIGHT_DASHBOARD_VIEW,
  RIGHT_ACTIVITY_SEARCH,
  RIGHT_FUNDING_MANAGE,
  ROUTE_PTBA_LIST,
  ROUTE_PTBA,
  ROUTE_ACTIVITE,
  ROUTE_DASHBOARD,
  ROUTE_WEEKLY_PLAN,
  ROUTE_FUNDING_SOURCES,
  ROUTE_CALENDAR,
} from './constants';

// Reducer
import reducer from './reducer';

// Translations
import messages_en from './translations/en.json';
import messages_fr from './translations/fr.json';

const DEFAULT_CONFIG = {
  translations: [
    { key: 'en', messages: messages_en },
    { key: 'fr', messages: messages_fr },
  ],

  reducers: [{ key: 'activity', reducer }],

  // Main menus
  'core.MainMenu': [
    { name: 'ActivityMainMenu', component: ActivityMainMenu },
  ],

  // Routes
  'core.Router': [
    { path: ROUTE_PTBA_LIST, component: PTBAListPage },
    { path: `${ROUTE_PTBA}/:ptba_uuid?`, component: PTBAPage },
    { path: `${ROUTE_ACTIVITE}/:activite_uuid`, component: ActivitePage },
    { path: ROUTE_DASHBOARD, component: PTBADashboardPage },
    { path: ROUTE_WEEKLY_PLAN, component: WeeklyPlanPage },
    { path: ROUTE_FUNDING_SOURCES, component: FundingSourcesPage },
    { path: ROUTE_CALENDAR, component: ActivityCalendarPage },
  ],

  // Activity menu items (contributed to ActivityMainMenu via 'activity.MainMenu' key)
  'activity.MainMenu': [
    {
      text: <FormattedMessage module="activity" id="activity.menu.ptba" />,
      icon: <ListAlt />,
      route: `/${ROUTE_PTBA_LIST}`,
      filter: (rights) => rights.includes(RIGHT_PTBA_SEARCH),
      id: 'activity.menu.ptba',
    },
    {
      text: <FormattedMessage module="activity" id="activity.menu.weeklyPlan" />,
      icon: <DateRangeIcon />,
      route: `/${ROUTE_WEEKLY_PLAN}`,
      filter: (rights) => rights.includes(RIGHT_ACTIVITY_SEARCH),
      id: 'activity.menu.weeklyPlan',
    },
    {
      text: <FormattedMessage module="activity" id="activity.menu.fundingSources" />,
      icon: <AccountBalanceIcon />,
      route: `/${ROUTE_FUNDING_SOURCES}`,
      filter: (rights) => rights.includes(RIGHT_FUNDING_MANAGE),
      id: 'activity.menu.fundingSources',
    },
    {
      text: <FormattedMessage module="activity" id="activity.menu.calendar" />,
      icon: <CalendarTodayIcon />,
      route: `/${ROUTE_CALENDAR}`,
      filter: (rights) => rights.includes(RIGHT_ACTIVITY_SEARCH),
      id: 'activity.menu.calendar',
    },
    {
      text: <FormattedMessage module="activity" id="activity.menu.dashboard" />,
      icon: <DashboardIcon />,
      route: `/${ROUTE_DASHBOARD}`,
      filter: (rights) => rights.includes(RIGHT_DASHBOARD_VIEW),
      id: 'activity.menu.dashboard',
    },
  ],

  refs: [
    // Pickers
    { key: 'activity.ActivityStatusPicker', ref: ActivityStatusPicker },
    { key: 'activity.QuarterPicker', ref: QuarterPicker },
    { key: 'activity.FundingSourcePicker', ref: FundingSourcePicker },

    // Route refs
    { key: 'activity.route.ptbaList', ref: ROUTE_PTBA_LIST },
    { key: 'activity.route.ptba', ref: ROUTE_PTBA },
    { key: 'activity.route.activite', ref: ROUTE_ACTIVITE },
    { key: 'activity.route.dashboard', ref: ROUTE_DASHBOARD },
    { key: 'activity.route.weeklyPlan', ref: ROUTE_WEEKLY_PLAN },
    { key: 'activity.route.fundingSources', ref: ROUTE_FUNDING_SOURCES },
    { key: 'activity.route.calendar', ref: ROUTE_CALENDAR },
  ],
};

export const ActivityModule = (cfg) => ({
  ...DEFAULT_CONFIG,
  ...((cfg && cfg['fe-activity']) || {}),
});

export default ActivityModule;
