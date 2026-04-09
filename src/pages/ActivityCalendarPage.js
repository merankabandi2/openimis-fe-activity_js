/* eslint-disable camelcase */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Typography,
  CircularProgress,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import {
  Helmet,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import {
  MODULE_NAME,
  RIGHT_ACTIVITY_SEARCH,
  CALENDAR_VIEW,
  CALENDAR_COLOR_BY,
  CALENDAR_GROUP_BY,
  STATUS_COLORS,
  SOURCE_COLORS,
  REVISION_STATUS_COLORS,
  COMPOSANTE_PALETTE,
  RESPONSIBLE_PALETTE,
  ROUTE_ACTIVITE,
} from '../constants';
import { fetchPtbas, fetchCalendarActivities } from '../actions';
import CalendarToolbar from '../components/calendar/CalendarToolbar';
import CalendarFilterDrawer from '../components/calendar/CalendarFilterDrawer';
import CalendarTimelineView from '../components/calendar/CalendarTimelineView';
import CalendarMonthView from '../components/calendar/CalendarMonthView';
import CalendarWeekView from '../components/calendar/CalendarWeekView';
import CalendarLegend from '../components/calendar/CalendarLegend';

const DRAWER_WIDTH = 320;

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  pageHeader: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  pageTitle: {
    fontSize: '1.6rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  titleIcon: {
    fontSize: '1.8rem',
    color: theme.palette.primary?.main || '#1976d2',
  },
  content: {
    transition: 'margin-left 225ms cubic-bezier(0, 0, 0.2, 1)',
  },
  contentShift: {
    marginLeft: DRAWER_WIDTH,
    transition: 'margin-left 225ms cubic-bezier(0, 0, 0.2, 1)',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  noPermission: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
}));

const DEFAULT_FILTERS = {
  ptbaId: '',
  composantes: [],
  sousComposantes: [],
  statuses: [],
  sources: [],
  revisionStatuses: [],
  responsibles: [],
  dateStart: '',
  dateEnd: '',
  hasBudget: false,
  behindSchedule: false,
};

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function ActivityCalendarPage({
  rights,
  history,
  ptbas,
  calendarActivities,
  fetchingCalendarActivities,
  fetchPtbas,
  fetchCalendarActivities,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  // View state
  const [view, setView] = useState(CALENDAR_VIEW.TIMELINE);
  const [colorBy, setColorBy] = useState(CALENDAR_COLOR_BY.STATUS);
  const [groupBy, setGroupBy] = useState(CALENDAR_GROUP_BY.COMPOSANTE);
  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Navigation state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load PTBAs
  useEffect(() => {
    fetchPtbas(modulesManager, ['first: 50']);
  }, []);

  // Auto-select first PTBA and jump calendar to its fiscal year
  useEffect(() => {
    if (ptbas && ptbas.length > 0 && !filters.ptbaId) {
      setFilters((prev) => ({ ...prev, ptbaId: ptbas[0].id }));
      // Jump calendar to the PTBA's fiscal year start so activities are visible
      if (ptbas[0].fiscalYearStart) {
        setCurrentDate(new Date(ptbas[0].fiscalYearStart));
      }
    }
  }, [ptbas]);

  // Fetch calendar activities when PTBA changes
  useEffect(() => {
    if (filters.ptbaId) {
      const params = [
        `first: 500`,
        `activite_SousComposante_Composante_Ptba_Id: "${filters.ptbaId}"`,
      ];
      fetchCalendarActivities(modulesManager, params);
    }
  }, [filters.ptbaId]);

  // Selected PTBA for timeline range
  const selectedPtba = useMemo(
    () => (ptbas || []).find((p) => p.id === filters.ptbaId),
    [ptbas, filters.ptbaId],
  );

  // Derive composantes and responsibles from loaded data
  const { composantes, sousComposantes, responsibles } = useMemo(() => {
    const compMap = {};
    const scMap = {};
    const respSet = new Set();

    (calendarActivities || []).forEach((sa) => {
      const activite = sa.activite;
      const comp = activite?.sousComposante?.composante;
      if (comp && !compMap[comp.id]) {
        compMap[comp.id] = comp;
      }
      const sc = activite?.sousComposante;
      if (sc && !scMap[sc.id]) {
        scMap[sc.id] = { ...sc, composante: comp };
      }
      if (sa.responsible) {
        respSet.add(sa.responsible);
      }
    });

    return {
      composantes: Object.values(compMap),
      sousComposantes: Object.values(scMap),
      responsibles: Array.from(respSet).sort(),
    };
  }, [calendarActivities]);

  // Apply client-side filters
  const filteredActivities = useMemo(() => {
    let items = calendarActivities || [];

    // Search text
    if (searchText) {
      const lower = searchText.toLowerCase();
      items = items.filter((a) =>
        (a.name || '').toLowerCase().includes(lower)
        || (a.code || '').toLowerCase().includes(lower)
        || (a.activite?.name || '').toLowerCase().includes(lower),
      );
    }

    // Composante filter
    if (filters.composantes.length > 0) {
      items = items.filter((a) => {
        const compId = a.activite?.sousComposante?.composante?.id;
        return compId && filters.composantes.includes(compId);
      });
    }

    // Sous-composante filter
    if (filters.sousComposantes.length > 0) {
      items = items.filter((a) => {
        const scId = a.activite?.sousComposante?.id;
        return scId && filters.sousComposantes.includes(scId);
      });
    }

    // Activity status
    if (filters.statuses.length > 0) {
      items = items.filter((a) => filters.statuses.includes(a.activite?.status));
    }

    // Source
    if (filters.sources.length > 0) {
      items = items.filter((a) => filters.sources.includes(a.source));
    }

    // Revision status
    if (filters.revisionStatuses.length > 0) {
      items = items.filter((a) => filters.revisionStatuses.includes(a.revisionStatus));
    }

    // Responsible
    if (filters.responsibles.length > 0) {
      items = items.filter((a) => filters.responsibles.includes(a.responsible));
    }

    // Date range
    if (filters.dateStart) {
      const ds = new Date(filters.dateStart);
      items = items.filter((a) => {
        if (!a.dateEnd) return false;
        return new Date(a.dateEnd) >= ds;
      });
    }
    if (filters.dateEnd) {
      const de = new Date(filters.dateEnd);
      items = items.filter((a) => {
        if (!a.dateStart) return false;
        return new Date(a.dateStart) <= de;
      });
    }

    // Has budget
    if (filters.hasBudget) {
      items = items.filter((a) => {
        const budget = parseFloat(a.budgetRevised || a.budgetTotal || 0);
        return budget > 0;
      });
    }

    // Behind schedule (simplified: no dateEnd in the past with non-REALISE/CLOTURE status)
    if (filters.behindSchedule) {
      const now = new Date();
      items = items.filter((a) => {
        if (!a.dateEnd) return false;
        const status = a.activite?.status;
        return new Date(a.dateEnd) < now
          && status !== 'REALISE'
          && status !== 'CLOTURE';
      });
    }

    return items;
  }, [calendarActivities, searchText, filters]);

  // Color mapping
  const composanteColorMap = useMemo(() => {
    const map = {};
    composantes.forEach((c, idx) => {
      map[c.id] = COMPOSANTE_PALETTE[idx % COMPOSANTE_PALETTE.length];
      map[c.code || c.name] = COMPOSANTE_PALETTE[idx % COMPOSANTE_PALETTE.length];
    });
    return map;
  }, [composantes]);

  const responsibleColorMap = useMemo(() => {
    const map = {};
    responsibles.forEach((r, idx) => {
      map[r] = RESPONSIBLE_PALETTE[idx % RESPONSIBLE_PALETTE.length];
    });
    return map;
  }, [responsibles]);

  const getColor = useCallback((item) => {
    switch (colorBy) {
      case CALENDAR_COLOR_BY.STATUS: {
        const status = item.activite?.status || 'PLANIFIE';
        return STATUS_COLORS[status] || '#9e9e9e';
      }
      case CALENDAR_COLOR_BY.COMPOSANTE: {
        const compId = item.activite?.sousComposante?.composante?.id;
        return composanteColorMap[compId] || '#9e9e9e';
      }
      case CALENDAR_COLOR_BY.SOURCE:
        return SOURCE_COLORS[item.source] || '#9e9e9e';
      case CALENDAR_COLOR_BY.REVISION:
        return REVISION_STATUS_COLORS[item.revisionStatus] || '#9e9e9e';
      case CALENDAR_COLOR_BY.RESPONSIBLE:
        return responsibleColorMap[item.responsible] || '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  }, [colorBy, composanteColorMap, responsibleColorMap]);

  const legendColorMap = useMemo(() => {
    if (colorBy === CALENDAR_COLOR_BY.COMPOSANTE) {
      const map = {};
      composantes.forEach((c) => {
        map[c.code || c.name] = composanteColorMap[c.id];
      });
      return map;
    }
    if (colorBy === CALENDAR_COLOR_BY.RESPONSIBLE) {
      return responsibleColorMap;
    }
    return {};
  }, [colorBy, composantes, composanteColorMap, responsibleColorMap]);

  // Grouping
  const groups = useMemo(() => {
    const items = filteredActivities;
    const withDates = items.filter((a) => a.dateStart && a.dateEnd);
    const noDates = items.filter((a) => !a.dateStart || !a.dateEnd);

    const buildGroups = (getGroupKey, getGroupLabel) => {
      const groupMap = {};
      withDates.forEach((item) => {
        const key = getGroupKey(item);
        if (!groupMap[key]) {
          groupMap[key] = {
            key,
            label: getGroupLabel(item),
            items: [],
          };
        }
        groupMap[key].items.push(item);
      });
      const result = Object.values(groupMap).sort((a, b) =>
        a.label.localeCompare(b.label),
      );
      if (noDates.length > 0) {
        result.push({
          key: '__no_dates',
          label: formatMessage('calendar.noDateGroup'),
          items: noDates,
        });
      }
      return result;
    };

    switch (groupBy) {
      case CALENDAR_GROUP_BY.COMPOSANTE:
        return buildGroups(
          (item) => item.activite?.sousComposante?.composante?.id || '__none',
          (item) => {
            const comp = item.activite?.sousComposante?.composante;
            return comp ? `${comp.code} - ${comp.name}` : formatMessage('calendar.noGroup');
          },
        );
      case CALENDAR_GROUP_BY.RESPONSIBLE:
        return buildGroups(
          (item) => item.responsible || '__none',
          (item) => item.responsible || formatMessage('calendar.noGroup'),
        );
      case CALENDAR_GROUP_BY.STATUS:
        return buildGroups(
          (item) => item.activite?.status || '__none',
          (item) => formatMessage(`status.${item.activite?.status || 'PLANIFIE'}`),
        );
      case CALENDAR_GROUP_BY.FLAT:
      default: {
        const allItems = [...withDates, ...noDates];
        if (allItems.length === 0) return [];
        return [{
          key: '__all',
          label: formatMessage('calendar.allActivities'),
          items: allItems,
        }];
      }
    }
  }, [filteredActivities, groupBy, formatMessage]);

  // Timeline range: use PTBA fiscal year or default to current year
  const timelineStart = useMemo(() => {
    if (selectedPtba?.fiscalYearStart) {
      return new Date(selectedPtba.fiscalYearStart);
    }
    return new Date(currentDate.getFullYear(), 0, 1);
  }, [selectedPtba, currentDate]);

  const timelineEnd = useMemo(() => {
    if (selectedPtba?.fiscalYearEnd) {
      return new Date(selectedPtba.fiscalYearEnd);
    }
    return new Date(currentDate.getFullYear(), 11, 31);
  }, [selectedPtba, currentDate]);

  // Period label for navigation
  const periodLabel = useMemo(() => {
    switch (view) {
      case CALENDAR_VIEW.MONTH:
        return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      case CALENDAR_VIEW.WEEK: {
        const monday = getMonday(currentDate);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        return `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      }
      case CALENDAR_VIEW.TIMELINE:
      default:
        if (selectedPtba) {
          return `${selectedPtba.code || selectedPtba.name}`;
        }
        return currentDate.getFullYear().toString();
    }
  }, [view, currentDate, selectedPtba]);

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    switch (view) {
      case CALENDAR_VIEW.MONTH:
        d.setMonth(d.getMonth() - 1);
        break;
      case CALENDAR_VIEW.WEEK:
        d.setDate(d.getDate() - 7);
        break;
      case CALENDAR_VIEW.TIMELINE:
        d.setFullYear(d.getFullYear() - 1);
        break;
      default:
        break;
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    switch (view) {
      case CALENDAR_VIEW.MONTH:
        d.setMonth(d.getMonth() + 1);
        break;
      case CALENDAR_VIEW.WEEK:
        d.setDate(d.getDate() + 7);
        break;
      case CALENDAR_VIEW.TIMELINE:
        d.setFullYear(d.getFullYear() + 1);
        break;
      default:
        break;
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleFilterChange = (key, value) => {
    if (key === '_clearAll') {
      setFilters((prev) => ({ ...DEFAULT_FILTERS, ptbaId: prev.ptbaId }));
      return;
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.composantes.length > 0) count += 1;
    if (filters.sousComposantes.length > 0) count += 1;
    if (filters.statuses.length > 0) count += 1;
    if (filters.sources.length > 0) count += 1;
    if (filters.revisionStatuses.length > 0) count += 1;
    if (filters.responsibles.length > 0) count += 1;
    if (filters.dateStart) count += 1;
    if (filters.dateEnd) count += 1;
    if (filters.hasBudget) count += 1;
    if (filters.behindSchedule) count += 1;
    return count;
  }, [filters]);

  const handleItemClick = (item) => {
    if (item.activite?.id) {
      history.push(`/${ROUTE_ACTIVITE}/${item.activite.id}`);
    }
  };

  if (!rights.includes(RIGHT_ACTIVITY_SEARCH)) {
    return (
      <div className={classes.page}>
        <Typography className={classes.noPermission}>
          {formatMessage('error.insufficientPermissions')}
        </Typography>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('calendar.title')} />

      <Box className={classes.pageHeader}>
        <Typography className={classes.pageTitle}>
          <CalendarTodayIcon className={classes.titleIcon} />
          {formatMessage('calendar.title')}
        </Typography>
      </Box>

      <CalendarFilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        ptbas={ptbas}
        composantes={composantes}
        sousComposantes={sousComposantes}
        responsibles={responsibles}
      />

      <Box className={filtersOpen ? classes.contentShift : classes.content}>
        <CalendarToolbar
          view={view}
          onViewChange={setView}
          colorBy={colorBy}
          onColorByChange={setColorBy}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          periodLabel={periodLabel}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          searchText={searchText}
          onSearchChange={setSearchText}
          activeFilterCount={activeFilterCount}
          onToggleFilters={() => setFiltersOpen((prev) => !prev)}
        />

        <CalendarLegend colorBy={colorBy} colorMap={legendColorMap} />

        {fetchingCalendarActivities ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {view === CALENDAR_VIEW.TIMELINE && (
              <CalendarTimelineView
                groups={groups}
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
                getColor={getColor}
                onItemClick={handleItemClick}
              />
            )}
            {view === CALENDAR_VIEW.MONTH && (
              <CalendarMonthView
                activities={filteredActivities}
                year={currentDate.getFullYear()}
                month={currentDate.getMonth()}
                getColor={getColor}
                onItemClick={handleItemClick}
              />
            )}
            {view === CALENDAR_VIEW.WEEK && (
              <CalendarWeekView
                activities={filteredActivities}
                weekStart={currentDate}
                getColor={getColor}
                onItemClick={handleItemClick}
              />
            )}
          </>
        )}
      </Box>
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  ptbas: state.activity.ptbas,
  calendarActivities: state.activity.calendarActivities,
  fetchingCalendarActivities: state.activity.fetchingCalendarActivities,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchPtbas,
  fetchCalendarActivities,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ActivityCalendarPage);
