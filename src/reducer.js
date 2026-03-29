/* eslint-disable default-param-last */
import {
  parseData,
  pageInfo,
  formatGraphQLError,
  formatServerError,
  decodeId,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
} from '@openimis/fe-core';
import { ACTION_TYPE, MUTATION_SERVICE } from './actions';

const REQUEST = (actionType) => `${actionType}_REQ`;
const SUCCESS = (actionType) => `${actionType}_RESP`;
const ERROR = (actionType) => `${actionType}_ERR`;
const CLEAR = (actionType) => `${actionType}_CLEAR`;

const STORE_STATE = {
  submittingMutation: false,
  mutation: {},

  // PTBA list
  fetchingPtbas: false,
  fetchedPtbas: false,
  ptbas: [],
  ptbasPageInfo: {},
  ptbasTotalCount: 0,
  errorPtbas: null,

  // PTBA detail
  fetchingPtba: false,
  fetchedPtba: false,
  ptba: null,
  errorPtba: null,

  // Composantes
  fetchingComposantes: false,
  fetchedComposantes: false,
  composantes: [],
  composantesPageInfo: {},
  composantesTotalCount: 0,
  errorComposantes: null,

  // SousComposantes
  fetchingSousComposantes: false,
  fetchedSousComposantes: false,
  sousComposantes: [],
  sousComposantesPageInfo: {},
  sousComposantesTotalCount: 0,
  errorSousComposantes: null,

  // Activites
  fetchingActivites: false,
  fetchedActivites: false,
  activites: [],
  activitesPageInfo: {},
  activitesTotalCount: 0,
  errorActivites: null,

  // Activite detail
  fetchingActivite: false,
  fetchedActivite: false,
  activite: null,
  errorActivite: null,

  // SousActivites
  fetchingSousActivites: false,
  fetchedSousActivites: false,
  sousActivites: [],
  sousActivitesPageInfo: {},
  sousActivitesTotalCount: 0,
  errorSousActivites: null,

  // FundingSources
  fetchingFundingSources: false,
  fetchedFundingSources: false,
  fundingSources: [],
  fundingSourcesPageInfo: {},
  fundingSourcesTotalCount: 0,
  errorFundingSources: null,

  // Transition history
  fetchingTransitionHistory: false,
  fetchedTransitionHistory: false,
  transitionHistory: [],
  transitionHistoryPageInfo: {},
  transitionHistoryTotalCount: 0,
  errorTransitionHistory: null,

  // Quarterly executions
  fetchingQuarterlyExecutions: false,
  fetchedQuarterlyExecutions: false,
  quarterlyExecutions: [],
  quarterlyExecutionsPageInfo: {},
  quarterlyExecutionsTotalCount: 0,
  errorQuarterlyExecutions: null,

  // Dashboard
  fetchingPtbaDashboard: false,
  fetchedPtbaDashboard: false,
  ptbaDashboard: null,
  errorPtbaDashboard: null,

  // Weekly Plan
  fetchingWeeklyPlan: false,
  fetchedWeeklyPlan: false,
  weeklyPlanEntries: [],
  weeklyPlanPageInfo: {},
  weeklyPlanTotalCount: 0,
  errorWeeklyPlan: null,

  // Calendar
  fetchingCalendarActivities: false,
  fetchedCalendarActivities: false,
  calendarActivities: [],
  calendarActivitiesPageInfo: {},
  calendarActivitiesTotalCount: 0,
  errorCalendarActivities: null,

  // Indicators (for search/picker)
  fetchingIndicators: false,
  fetchedIndicators: false,
  indicators: [],
  indicatorsPageInfo: {},
  indicatorsTotalCount: 0,
  errorIndicators: null,
};

function reducer(state = STORE_STATE, action) {
  switch (action.type) {
    // --- PTBA list ---
    case REQUEST(ACTION_TYPE.SEARCH_PTBAS):
      return {
        ...state,
        fetchingPtbas: true,
        fetchedPtbas: false,
        ptbas: [],
        ptbasPageInfo: {},
        ptbasTotalCount: 0,
        errorPtbas: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_PTBAS):
      return {
        ...state,
        fetchingPtbas: false,
        fetchedPtbas: true,
        ptbas: parseData(action.payload.data.ptba)?.map((p) => ({
          ...p,
          id: decodeId(p.id),
        })),
        ptbasPageInfo: pageInfo(action.payload.data.ptba),
        ptbasTotalCount: action.payload.data.ptba?.totalCount ?? 0,
        errorPtbas: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_PTBAS):
      return {
        ...state,
        fetchingPtbas: false,
        errorPtbas: formatServerError(action.payload),
      };

    // --- PTBA detail ---
    case REQUEST(ACTION_TYPE.GET_PTBA):
      return {
        ...state,
        fetchingPtba: true,
        fetchedPtba: false,
        ptba: null,
        errorPtba: null,
      };
    case SUCCESS(ACTION_TYPE.GET_PTBA): {
      const ptbas = parseData(action.payload.data.ptba);
      return {
        ...state,
        fetchingPtba: false,
        fetchedPtba: true,
        ptba: ptbas?.length > 0
          ? { ...ptbas[0], id: decodeId(ptbas[0].id) }
          : null,
        errorPtba: formatGraphQLError(action.payload),
      };
    }
    case ERROR(ACTION_TYPE.GET_PTBA):
      return {
        ...state,
        fetchingPtba: false,
        errorPtba: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.PTBA):
      return {
        ...state,
        fetchingPtba: false,
        fetchedPtba: false,
        ptba: null,
        errorPtba: null,
      };

    // --- Composantes ---
    case REQUEST(ACTION_TYPE.SEARCH_COMPOSANTES):
      return {
        ...state,
        fetchingComposantes: true,
        fetchedComposantes: false,
        composantes: [],
        composantesPageInfo: {},
        composantesTotalCount: 0,
        errorComposantes: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_COMPOSANTES):
      return {
        ...state,
        fetchingComposantes: false,
        fetchedComposantes: true,
        composantes: parseData(action.payload.data.composante)?.map((c) => ({
          ...c,
          id: decodeId(c.id),
        })),
        composantesPageInfo: pageInfo(action.payload.data.composante),
        composantesTotalCount: action.payload.data.composante?.totalCount ?? 0,
        errorComposantes: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_COMPOSANTES):
      return {
        ...state,
        fetchingComposantes: false,
        errorComposantes: formatServerError(action.payload),
      };

    // --- SousComposantes ---
    case REQUEST(ACTION_TYPE.SEARCH_SOUS_COMPOSANTES):
      return {
        ...state,
        fetchingSousComposantes: true,
        fetchedSousComposantes: false,
        sousComposantes: [],
        sousComposantesPageInfo: {},
        sousComposantesTotalCount: 0,
        errorSousComposantes: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_SOUS_COMPOSANTES):
      return {
        ...state,
        fetchingSousComposantes: false,
        fetchedSousComposantes: true,
        sousComposantes: parseData(action.payload.data.sousComposante)?.map((sc) => ({
          ...sc,
          id: decodeId(sc.id),
        })),
        sousComposantesPageInfo: pageInfo(action.payload.data.sousComposante),
        sousComposantesTotalCount: action.payload.data.sousComposante?.totalCount ?? 0,
        errorSousComposantes: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_SOUS_COMPOSANTES):
      return {
        ...state,
        fetchingSousComposantes: false,
        errorSousComposantes: formatServerError(action.payload),
      };

    // --- Activites list ---
    case REQUEST(ACTION_TYPE.SEARCH_ACTIVITES):
      return {
        ...state,
        fetchingActivites: true,
        fetchedActivites: false,
        activites: [],
        activitesPageInfo: {},
        activitesTotalCount: 0,
        errorActivites: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_ACTIVITES):
      return {
        ...state,
        fetchingActivites: false,
        fetchedActivites: true,
        activites: parseData(action.payload.data.activite)?.map((a) => ({
          ...a,
          id: decodeId(a.id),
        })),
        activitesPageInfo: pageInfo(action.payload.data.activite),
        activitesTotalCount: action.payload.data.activite?.totalCount ?? 0,
        errorActivites: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_ACTIVITES):
      return {
        ...state,
        fetchingActivites: false,
        errorActivites: formatServerError(action.payload),
      };

    // --- Activite detail ---
    case REQUEST(ACTION_TYPE.GET_ACTIVITE):
      return {
        ...state,
        fetchingActivite: true,
        fetchedActivite: false,
        activite: null,
        errorActivite: null,
      };
    case SUCCESS(ACTION_TYPE.GET_ACTIVITE): {
      const activites = parseData(action.payload.data.activite);
      return {
        ...state,
        fetchingActivite: false,
        fetchedActivite: true,
        activite: activites?.length > 0
          ? { ...activites[0], id: decodeId(activites[0].id) }
          : null,
        errorActivite: formatGraphQLError(action.payload),
      };
    }
    case ERROR(ACTION_TYPE.GET_ACTIVITE):
      return {
        ...state,
        fetchingActivite: false,
        errorActivite: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.ACTIVITE):
      return {
        ...state,
        fetchingActivite: false,
        fetchedActivite: false,
        activite: null,
        errorActivite: null,
      };

    // --- SousActivites ---
    case REQUEST(ACTION_TYPE.SEARCH_SOUS_ACTIVITES):
      return {
        ...state,
        fetchingSousActivites: true,
        fetchedSousActivites: false,
        sousActivites: [],
        sousActivitesPageInfo: {},
        sousActivitesTotalCount: 0,
        errorSousActivites: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_SOUS_ACTIVITES):
      return {
        ...state,
        fetchingSousActivites: false,
        fetchedSousActivites: true,
        sousActivites: parseData(action.payload.data.sousActivite)?.map((sa) => ({
          ...sa,
          id: decodeId(sa.id),
        })),
        sousActivitesPageInfo: pageInfo(action.payload.data.sousActivite),
        sousActivitesTotalCount: action.payload.data.sousActivite?.totalCount ?? 0,
        errorSousActivites: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_SOUS_ACTIVITES):
      return {
        ...state,
        fetchingSousActivites: false,
        errorSousActivites: formatServerError(action.payload),
      };

    // --- FundingSources ---
    case REQUEST(ACTION_TYPE.SEARCH_FUNDING_SOURCES):
      return {
        ...state,
        fetchingFundingSources: true,
        fetchedFundingSources: false,
        fundingSources: [],
        fundingSourcesPageInfo: {},
        fundingSourcesTotalCount: 0,
        errorFundingSources: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_FUNDING_SOURCES):
      return {
        ...state,
        fetchingFundingSources: false,
        fetchedFundingSources: true,
        fundingSources: parseData(action.payload.data.fundingSource)?.map((fs) => ({
          ...fs,
          id: decodeId(fs.id),
        })),
        fundingSourcesPageInfo: pageInfo(action.payload.data.fundingSource),
        fundingSourcesTotalCount: action.payload.data.fundingSource?.totalCount ?? 0,
        errorFundingSources: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_FUNDING_SOURCES):
      return {
        ...state,
        fetchingFundingSources: false,
        errorFundingSources: formatServerError(action.payload),
      };

    // --- PTBA mutations ---
    case REQUEST(ACTION_TYPE.CREATE_PTBA):
    case REQUEST(ACTION_TYPE.UPDATE_PTBA):
    case REQUEST(ACTION_TYPE.DELETE_PTBA):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_PTBA):
    case ERROR(ACTION_TYPE.UPDATE_PTBA):
    case ERROR(ACTION_TYPE.DELETE_PTBA):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_PTBA):
      return dispatchMutationResp(state, MUTATION_SERVICE.PTBA.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_PTBA):
      return dispatchMutationResp(state, MUTATION_SERVICE.PTBA.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_PTBA):
      return dispatchMutationResp(state, MUTATION_SERVICE.PTBA.DELETE, action);

    // --- Composante mutations ---
    case REQUEST(ACTION_TYPE.CREATE_COMPOSANTE):
    case REQUEST(ACTION_TYPE.UPDATE_COMPOSANTE):
    case REQUEST(ACTION_TYPE.DELETE_COMPOSANTE):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_COMPOSANTE):
    case ERROR(ACTION_TYPE.UPDATE_COMPOSANTE):
    case ERROR(ACTION_TYPE.DELETE_COMPOSANTE):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_COMPOSANTE):
      return dispatchMutationResp(state, MUTATION_SERVICE.COMPOSANTE.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_COMPOSANTE):
      return dispatchMutationResp(state, MUTATION_SERVICE.COMPOSANTE.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_COMPOSANTE):
      return dispatchMutationResp(state, MUTATION_SERVICE.COMPOSANTE.DELETE, action);

    // --- SousComposante mutations ---
    case REQUEST(ACTION_TYPE.CREATE_SOUS_COMPOSANTE):
    case REQUEST(ACTION_TYPE.UPDATE_SOUS_COMPOSANTE):
    case REQUEST(ACTION_TYPE.DELETE_SOUS_COMPOSANTE):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_SOUS_COMPOSANTE):
    case ERROR(ACTION_TYPE.UPDATE_SOUS_COMPOSANTE):
    case ERROR(ACTION_TYPE.DELETE_SOUS_COMPOSANTE):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_SOUS_COMPOSANTE):
      return dispatchMutationResp(state, MUTATION_SERVICE.SOUS_COMPOSANTE.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_SOUS_COMPOSANTE):
      return dispatchMutationResp(state, MUTATION_SERVICE.SOUS_COMPOSANTE.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_SOUS_COMPOSANTE):
      return dispatchMutationResp(state, MUTATION_SERVICE.SOUS_COMPOSANTE.DELETE, action);

    // --- Activite mutations ---
    case REQUEST(ACTION_TYPE.CREATE_ACTIVITE):
    case REQUEST(ACTION_TYPE.UPDATE_ACTIVITE):
    case REQUEST(ACTION_TYPE.DELETE_ACTIVITE):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_ACTIVITE):
    case ERROR(ACTION_TYPE.UPDATE_ACTIVITE):
    case ERROR(ACTION_TYPE.DELETE_ACTIVITE):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_ACTIVITE):
      return dispatchMutationResp(state, MUTATION_SERVICE.ACTIVITE.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_ACTIVITE):
      return dispatchMutationResp(state, MUTATION_SERVICE.ACTIVITE.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_ACTIVITE):
      return dispatchMutationResp(state, MUTATION_SERVICE.ACTIVITE.DELETE, action);

    // --- SousActivite mutations ---
    case REQUEST(ACTION_TYPE.CREATE_SOUS_ACTIVITE):
    case REQUEST(ACTION_TYPE.UPDATE_SOUS_ACTIVITE):
    case REQUEST(ACTION_TYPE.DELETE_SOUS_ACTIVITE):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_SOUS_ACTIVITE):
    case ERROR(ACTION_TYPE.UPDATE_SOUS_ACTIVITE):
    case ERROR(ACTION_TYPE.DELETE_SOUS_ACTIVITE):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_SOUS_ACTIVITE):
      return dispatchMutationResp(state, MUTATION_SERVICE.SOUS_ACTIVITE.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_SOUS_ACTIVITE):
      return dispatchMutationResp(state, MUTATION_SERVICE.SOUS_ACTIVITE.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_SOUS_ACTIVITE):
      return dispatchMutationResp(state, MUTATION_SERVICE.SOUS_ACTIVITE.DELETE, action);

    // --- Funding allocation mutation ---
    case REQUEST(ACTION_TYPE.ALLOCATE_FUNDING):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.ALLOCATE_FUNDING):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.ALLOCATE_FUNDING):
      return dispatchMutationResp(state, MUTATION_SERVICE.FUNDING.ALLOCATE, action);

    // --- Transition history ---
    case REQUEST(ACTION_TYPE.GET_TRANSITION_HISTORY):
      return {
        ...state,
        fetchingTransitionHistory: true,
        fetchedTransitionHistory: false,
        transitionHistory: [],
        transitionHistoryPageInfo: {},
        transitionHistoryTotalCount: 0,
        errorTransitionHistory: null,
      };
    case SUCCESS(ACTION_TYPE.GET_TRANSITION_HISTORY):
      return {
        ...state,
        fetchingTransitionHistory: false,
        fetchedTransitionHistory: true,
        transitionHistory: parseData(action.payload.data.activityStatusTransition)?.map((t) => ({
          ...t,
          id: decodeId(t.id),
        })) || [],
        transitionHistoryPageInfo: pageInfo(action.payload.data.activityStatusTransition),
        transitionHistoryTotalCount: action.payload.data.activityStatusTransition?.totalCount ?? 0,
        errorTransitionHistory: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_TRANSITION_HISTORY):
      return {
        ...state,
        fetchingTransitionHistory: false,
        errorTransitionHistory: formatServerError(action.payload),
      };

    // --- Quarterly executions ---
    case REQUEST(ACTION_TYPE.GET_QUARTERLY_EXECUTIONS):
      return {
        ...state,
        fetchingQuarterlyExecutions: true,
        fetchedQuarterlyExecutions: false,
        quarterlyExecutions: [],
        quarterlyExecutionsPageInfo: {},
        quarterlyExecutionsTotalCount: 0,
        errorQuarterlyExecutions: null,
      };
    case SUCCESS(ACTION_TYPE.GET_QUARTERLY_EXECUTIONS):
      return {
        ...state,
        fetchingQuarterlyExecutions: false,
        fetchedQuarterlyExecutions: true,
        quarterlyExecutions: parseData(action.payload.data.quarterlyExecution)?.map((qe) => ({
          ...qe,
          id: decodeId(qe.id),
        })) || [],
        quarterlyExecutionsPageInfo: pageInfo(action.payload.data.quarterlyExecution),
        quarterlyExecutionsTotalCount: action.payload.data.quarterlyExecution?.totalCount ?? 0,
        errorQuarterlyExecutions: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_QUARTERLY_EXECUTIONS):
      return {
        ...state,
        fetchingQuarterlyExecutions: false,
        errorQuarterlyExecutions: formatServerError(action.payload),
      };

    // --- Dashboard ---
    case REQUEST(ACTION_TYPE.GET_PTBA_DASHBOARD):
      return {
        ...state,
        fetchingPtbaDashboard: true,
        fetchedPtbaDashboard: false,
        ptbaDashboard: null,
        errorPtbaDashboard: null,
      };
    case SUCCESS(ACTION_TYPE.GET_PTBA_DASHBOARD):
      return {
        ...state,
        fetchingPtbaDashboard: false,
        fetchedPtbaDashboard: true,
        ptbaDashboard: action.payload.data.ptbaDashboard || null,
        errorPtbaDashboard: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_PTBA_DASHBOARD):
      return {
        ...state,
        fetchingPtbaDashboard: false,
        errorPtbaDashboard: formatServerError(action.payload),
      };

    // --- Lifecycle transition mutation ---
    case REQUEST(ACTION_TYPE.TRANSITION_ACTIVITY):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.TRANSITION_ACTIVITY):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.TRANSITION_ACTIVITY):
      return dispatchMutationResp(state, MUTATION_SERVICE.LIFECYCLE.TRANSITION, action);

    // --- Execution report mutation ---
    case REQUEST(ACTION_TYPE.REPORT_QUARTERLY_EXECUTION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.REPORT_QUARTERLY_EXECUTION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.REPORT_QUARTERLY_EXECUTION):
      return dispatchMutationResp(state, MUTATION_SERVICE.EXECUTION.REPORT, action);

    // --- Indicator link mutations ---
    case REQUEST(ACTION_TYPE.LINK_ACTIVITY_TO_INDICATOR):
    case REQUEST(ACTION_TYPE.UNLINK_ACTIVITY_FROM_INDICATOR):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.LINK_ACTIVITY_TO_INDICATOR):
    case ERROR(ACTION_TYPE.UNLINK_ACTIVITY_FROM_INDICATOR):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.LINK_ACTIVITY_TO_INDICATOR):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR.LINK, action);
    case SUCCESS(ACTION_TYPE.UNLINK_ACTIVITY_FROM_INDICATOR):
      return dispatchMutationResp(state, MUTATION_SERVICE.INDICATOR.UNLINK, action);

    // --- Weekly Plan ---
    case REQUEST(ACTION_TYPE.GET_WEEKLY_PLAN_ENTRIES):
      return {
        ...state,
        fetchingWeeklyPlan: true,
        fetchedWeeklyPlan: false,
        weeklyPlanEntries: [],
        weeklyPlanPageInfo: {},
        weeklyPlanTotalCount: 0,
        errorWeeklyPlan: null,
      };
    case SUCCESS(ACTION_TYPE.GET_WEEKLY_PLAN_ENTRIES):
      return {
        ...state,
        fetchingWeeklyPlan: false,
        fetchedWeeklyPlan: true,
        weeklyPlanEntries: parseData(action.payload.data.weeklyPlanEntry)?.map((e) => ({
          ...e,
          id: decodeId(e.id),
        })) || [],
        weeklyPlanPageInfo: pageInfo(action.payload.data.weeklyPlanEntry),
        weeklyPlanTotalCount: action.payload.data.weeklyPlanEntry?.totalCount ?? 0,
        errorWeeklyPlan: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_WEEKLY_PLAN_ENTRIES):
      return {
        ...state,
        fetchingWeeklyPlan: false,
        errorWeeklyPlan: formatServerError(action.payload),
      };

    // --- Weekly Plan mutations ---
    case REQUEST(ACTION_TYPE.CREATE_WEEKLY_PLAN_ENTRY):
    case REQUEST(ACTION_TYPE.UPDATE_WEEKLY_PLAN_ENTRY):
    case REQUEST(ACTION_TYPE.DELETE_WEEKLY_PLAN_ENTRY):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_WEEKLY_PLAN_ENTRY):
    case ERROR(ACTION_TYPE.UPDATE_WEEKLY_PLAN_ENTRY):
    case ERROR(ACTION_TYPE.DELETE_WEEKLY_PLAN_ENTRY):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_WEEKLY_PLAN_ENTRY):
      return dispatchMutationResp(state, MUTATION_SERVICE.WEEKLY.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_WEEKLY_PLAN_ENTRY):
      return dispatchMutationResp(state, MUTATION_SERVICE.WEEKLY.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_WEEKLY_PLAN_ENTRY):
      return dispatchMutationResp(state, MUTATION_SERVICE.WEEKLY.DELETE, action);

    // --- Funding deallocation mutation ---
    case REQUEST(ACTION_TYPE.DEALLOCATE_FUNDING):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.DEALLOCATE_FUNDING):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.DEALLOCATE_FUNDING):
      return dispatchMutationResp(state, MUTATION_SERVICE.FUNDING.DEALLOCATE, action);

    // --- FundingSource CRUD mutations ---
    case REQUEST(ACTION_TYPE.CREATE_FUNDING_SOURCE):
    case REQUEST(ACTION_TYPE.UPDATE_FUNDING_SOURCE):
    case REQUEST(ACTION_TYPE.DELETE_FUNDING_SOURCE):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.CREATE_FUNDING_SOURCE):
    case ERROR(ACTION_TYPE.UPDATE_FUNDING_SOURCE):
    case ERROR(ACTION_TYPE.DELETE_FUNDING_SOURCE):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_FUNDING_SOURCE):
      return dispatchMutationResp(state, MUTATION_SERVICE.FUNDING_SOURCE.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_FUNDING_SOURCE):
      return dispatchMutationResp(state, MUTATION_SERVICE.FUNDING_SOURCE.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_FUNDING_SOURCE):
      return dispatchMutationResp(state, MUTATION_SERVICE.FUNDING_SOURCE.DELETE, action);

    // --- Indicators search ---
    case REQUEST(ACTION_TYPE.SEARCH_INDICATORS):
      return {
        ...state,
        fetchingIndicators: true,
        fetchedIndicators: false,
        indicators: [],
        indicatorsPageInfo: {},
        indicatorsTotalCount: 0,
        errorIndicators: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_INDICATORS):
      return {
        ...state,
        fetchingIndicators: false,
        fetchedIndicators: true,
        indicators: parseData(action.payload.data.indicator)?.map((i) => ({
          ...i,
          id: decodeId(i.id),
        })) || [],
        indicatorsPageInfo: pageInfo(action.payload.data.indicator),
        indicatorsTotalCount: action.payload.data.indicator?.totalCount ?? 0,
        errorIndicators: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_INDICATORS):
      return {
        ...state,
        fetchingIndicators: false,
        errorIndicators: formatServerError(action.payload),
      };

    // --- PTBA Transition mutation ---
    case REQUEST(ACTION_TYPE.TRANSITION_PTBA):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.TRANSITION_PTBA):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.TRANSITION_PTBA):
      return dispatchMutationResp(state, MUTATION_SERVICE.PTBA_TRANSITION.TRANSITION, action);

    // --- Calendar activities ---
    case REQUEST(ACTION_TYPE.GET_CALENDAR_ACTIVITIES):
      return {
        ...state,
        fetchingCalendarActivities: true,
        fetchedCalendarActivities: false,
        calendarActivities: [],
        calendarActivitiesPageInfo: {},
        calendarActivitiesTotalCount: 0,
        errorCalendarActivities: null,
      };
    case SUCCESS(ACTION_TYPE.GET_CALENDAR_ACTIVITIES):
      return {
        ...state,
        fetchingCalendarActivities: false,
        fetchedCalendarActivities: true,
        calendarActivities: parseData(action.payload.data.sousActivite)?.map((sa) => ({
          ...sa,
          id: decodeId(sa.id),
          activite: sa.activite ? {
            ...sa.activite,
            id: decodeId(sa.activite.id),
          } : null,
        })) || [],
        calendarActivitiesPageInfo: pageInfo(action.payload.data.sousActivite),
        calendarActivitiesTotalCount: action.payload.data.sousActivite?.totalCount ?? 0,
        errorCalendarActivities: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_CALENDAR_ACTIVITIES):
      return {
        ...state,
        fetchingCalendarActivities: false,
        errorCalendarActivities: formatServerError(action.payload),
      };

    // --- Generic Mutations ---
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);

    default:
      return state;
  }
}

export default reducer;
