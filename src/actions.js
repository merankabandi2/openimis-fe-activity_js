import {
  decodeId,
  formatGQLString,
  formatMutation,
  formatPageQuery,
  formatPageQueryWithCount,
  formatQuery,
  graphql,
} from '@openimis/fe-core';

const REQUEST = (actionType) => `${actionType}_REQ`;
const SUCCESS = (actionType) => `${actionType}_RESP`;
const ERROR = (actionType) => `${actionType}_ERR`;
const CLEAR = (actionType) => `${actionType}_CLEAR`;

export const ACTION_TYPE = {
  // PTBA
  SEARCH_PTBAS: 'ACTIVITY_SEARCH_PTBAS',
  GET_PTBA: 'ACTIVITY_GET_PTBA',
  PTBA: 'ACTIVITY_PTBA',
  CREATE_PTBA: 'ACTIVITY_CREATE_PTBA',
  UPDATE_PTBA: 'ACTIVITY_UPDATE_PTBA',
  DELETE_PTBA: 'ACTIVITY_DELETE_PTBA',

  // Composante
  SEARCH_COMPOSANTES: 'ACTIVITY_SEARCH_COMPOSANTES',
  GET_COMPOSANTE: 'ACTIVITY_GET_COMPOSANTE',
  CREATE_COMPOSANTE: 'ACTIVITY_CREATE_COMPOSANTE',
  UPDATE_COMPOSANTE: 'ACTIVITY_UPDATE_COMPOSANTE',
  DELETE_COMPOSANTE: 'ACTIVITY_DELETE_COMPOSANTE',

  // SousComposante
  SEARCH_SOUS_COMPOSANTES: 'ACTIVITY_SEARCH_SOUS_COMPOSANTES',
  CREATE_SOUS_COMPOSANTE: 'ACTIVITY_CREATE_SOUS_COMPOSANTE',
  UPDATE_SOUS_COMPOSANTE: 'ACTIVITY_UPDATE_SOUS_COMPOSANTE',
  DELETE_SOUS_COMPOSANTE: 'ACTIVITY_DELETE_SOUS_COMPOSANTE',

  // Activite
  SEARCH_ACTIVITES: 'ACTIVITY_SEARCH_ACTIVITES',
  GET_ACTIVITE: 'ACTIVITY_GET_ACTIVITE',
  ACTIVITE: 'ACTIVITY_ACTIVITE',
  CREATE_ACTIVITE: 'ACTIVITY_CREATE_ACTIVITE',
  UPDATE_ACTIVITE: 'ACTIVITY_UPDATE_ACTIVITE',
  DELETE_ACTIVITE: 'ACTIVITY_DELETE_ACTIVITE',

  // SousActivite
  SEARCH_SOUS_ACTIVITES: 'ACTIVITY_SEARCH_SOUS_ACTIVITES',
  CREATE_SOUS_ACTIVITE: 'ACTIVITY_CREATE_SOUS_ACTIVITE',
  UPDATE_SOUS_ACTIVITE: 'ACTIVITY_UPDATE_SOUS_ACTIVITE',
  DELETE_SOUS_ACTIVITE: 'ACTIVITY_DELETE_SOUS_ACTIVITE',

  // FundingSource
  SEARCH_FUNDING_SOURCES: 'ACTIVITY_SEARCH_FUNDING_SOURCES',
  CREATE_FUNDING_SOURCE: 'ACTIVITY_CREATE_FUNDING_SOURCE',
  UPDATE_FUNDING_SOURCE: 'ACTIVITY_UPDATE_FUNDING_SOURCE',
  DELETE_FUNDING_SOURCE: 'ACTIVITY_DELETE_FUNDING_SOURCE',

  // SousActiviteFunding
  ALLOCATE_FUNDING: 'ACTIVITY_ALLOCATE_FUNDING',
  DEALLOCATE_FUNDING: 'ACTIVITY_DEALLOCATE_FUNDING',

  // Lifecycle
  TRANSITION_ACTIVITY: 'ACTIVITY_TRANSITION_ACTIVITY',
  GET_TRANSITION_HISTORY: 'ACTIVITY_GET_TRANSITION_HISTORY',

  // Execution
  REPORT_QUARTERLY_EXECUTION: 'ACTIVITY_REPORT_QUARTERLY_EXECUTION',
  GET_QUARTERLY_EXECUTIONS: 'ACTIVITY_GET_QUARTERLY_EXECUTIONS',

  // Dashboard
  GET_PTBA_DASHBOARD: 'ACTIVITY_GET_PTBA_DASHBOARD',

  // Indicator links
  LINK_ACTIVITY_TO_INDICATOR: 'ACTIVITY_LINK_ACTIVITY_TO_INDICATOR',
  UNLINK_ACTIVITY_FROM_INDICATOR: 'ACTIVITY_UNLINK_ACTIVITY_FROM_INDICATOR',
  SEARCH_INDICATORS: 'ACTIVITY_SEARCH_INDICATORS',

  // PTBA Transition
  TRANSITION_PTBA: 'ACTIVITY_TRANSITION_PTBA',

  // Weekly Plan
  GET_WEEKLY_PLAN_ENTRIES: 'ACTIVITY_GET_WEEKLY_PLAN_ENTRIES',
  CREATE_WEEKLY_PLAN_ENTRY: 'ACTIVITY_CREATE_WEEKLY_PLAN_ENTRY',
  UPDATE_WEEKLY_PLAN_ENTRY: 'ACTIVITY_UPDATE_WEEKLY_PLAN_ENTRY',
  DELETE_WEEKLY_PLAN_ENTRY: 'ACTIVITY_DELETE_WEEKLY_PLAN_ENTRY',

  // Calendar
  GET_CALENDAR_ACTIVITIES: 'ACTIVITY_GET_CALENDAR_ACTIVITIES',

  // PTBA Approve / Close
  APPROVE_PTBA: 'ACTIVITY_APPROVE_PTBA',
  CLOSE_PTBA: 'ACTIVITY_CLOSE_PTBA',

  // Revision workflow
  BEGIN_REVISION: 'ACTIVITY_BEGIN_REVISION',
  APPROVE_REVISION: 'ACTIVITY_APPROVE_REVISION',
  REJECT_REVISION: 'ACTIVITY_REJECT_REVISION',

  // Mutation
  MUTATION: 'ACTIVITY_MUTATION',
};

export const MUTATION_SERVICE = {
  PTBA: {
    CREATE: 'createPtba',
    UPDATE: 'updatePtba',
    DELETE: 'deletePtba',
  },
  COMPOSANTE: {
    CREATE: 'createComposante',
    UPDATE: 'updateComposante',
    DELETE: 'deleteComposante',
  },
  SOUS_COMPOSANTE: {
    CREATE: 'createSousComposante',
    UPDATE: 'updateSousComposante',
    DELETE: 'deleteSousComposante',
  },
  ACTIVITE: {
    CREATE: 'createActivite',
    UPDATE: 'updateActivite',
    DELETE: 'deleteActivite',
  },
  SOUS_ACTIVITE: {
    CREATE: 'createSousActivite',
    UPDATE: 'updateSousActivite',
    DELETE: 'deleteSousActivite',
  },
  FUNDING: {
    ALLOCATE: 'allocateFunding',
    DEALLOCATE: 'deallocateFunding',
  },
  FUNDING_SOURCE: {
    CREATE: 'createFundingSource',
    UPDATE: 'updateFundingSource',
    DELETE: 'deleteFundingSource',
  },
  LIFECYCLE: {
    TRANSITION: 'transitionActivity',
  },
  EXECUTION: {
    REPORT: 'reportQuarterlyExecution',
  },
  INDICATOR: {
    LINK: 'linkActivityToIndicator',
    UNLINK: 'unlinkActivityFromIndicator',
  },
  PTBA_TRANSITION: {
    TRANSITION: 'transitionPtba',
  },
  PTBA_APPROVE: {
    APPROVE: 'approvePtba',
  },
  PTBA_CLOSE: {
    CLOSE: 'closePtba',
  },
  REVISION: {
    BEGIN: 'beginRevision',
    APPROVE: 'approveRevision',
    REJECT: 'rejectRevision',
  },
  WEEKLY: {
    CREATE: 'createWeeklyPlanEntry',
    UPDATE: 'updateWeeklyPlanEntry',
    DELETE: 'deleteWeeklyPlanEntry',
  },
};

// --- Projections ---

const PTBA_LIST_PROJECTION = () => [
  'id',
  'code',
  'name',
  'fiscalYearStart',
  'fiscalYearEnd',
  'status',
  'dateCreated',
  'dateUpdated',
];

const PTBA_FULL_PROJECTION = () => [
  'id',
  'code',
  'name',
  'fiscalYearStart',
  'fiscalYearEnd',
  'status',
  'dateCreated',
  'dateUpdated',
  'jsonExt',
  'composantes { edges { node { id code name sortOrder sousComposantes { edges { node { id code name sortOrder activites { edges { node { id code name status implementingStructure procurementMethod indicatorDescription province observations sortOrder sousActivites { edges { node { id code name unit quantityTotal quantityT1 quantityT2 quantityT3 quantityT4 unitCost budgetT1 budgetT2 budgetT3 budgetT4 budgetTotal expenseCategoryCode expenseCategory sortOrder fundingAllocations { edges { node { id fundingSource { id code name } amount } } } } } } } } } } } } } } }',
];

const COMPOSANTE_PROJECTION = () => [
  'id',
  'code',
  'name',
  'sortOrder',
  'ptba { id code }',
];

const SOUS_COMPOSANTE_PROJECTION = () => [
  'id',
  'code',
  'name',
  'sortOrder',
  'composante { id code }',
];

const ACTIVITE_LIST_PROJECTION = () => [
  'id',
  'code',
  'name',
  'status',
  'implementingStructure',
  'procurementMethod',
  'province',
  'observations',
  'sortOrder',
  'sousComposante { id code name composante { id code name ptba { id code } } }',
];

const ACTIVITE_FULL_PROJECTION = () => [
  'id',
  'code',
  'name',
  'status',
  'implementingStructure',
  'procurementMethod',
  'indicatorDescription',
  'province',
  'observations',
  'sortOrder',
  'jsonExt',
  'revisionStatus',
  'revisionComment',
  'sousComposante { id code name composante { id code name ptba { id code name } } }',
  'sousActivites { edges { node { id code name unit quantityTotal quantityT1 quantityT2 quantityT3 quantityT4 unitCost budgetT1 budgetT2 budgetT3 budgetT4 budgetTotal expenseCategoryCode expenseCategory sortOrder quantityInitial quantityRevised unitCostInitial unitCostRevised budgetInitial budgetRevised dateStart dateEnd responsible intervenants revisionStatus revisionComment fundingAllocations { edges { node { id fundingSource { id code name } amount } } } } } }',
  'indicators { edges { node { id name baseline target currentValue } } }',
];

const SOUS_ACTIVITE_PROJECTION = () => [
  'id',
  'code',
  'name',
  'unit',
  'quantityTotal',
  'quantityT1',
  'quantityT2',
  'quantityT3',
  'quantityT4',
  'unitCost',
  'budgetT1',
  'budgetT2',
  'budgetT3',
  'budgetT4',
  'budgetTotal',
  'expenseCategoryCode',
  'expenseCategory',
  'sortOrder',
  'quantityInitial',
  'quantityRevised',
  'unitCostInitial',
  'unitCostRevised',
  'budgetInitial',
  'budgetRevised',
  'dateStart',
  'dateEnd',
  'responsible',
  'intervenants',
  'revisionStatus',
  'revisionComment',
  'activite { id code name }',
  'fundingAllocations { edges { node { id fundingSource { id code name } amount } } }',
];

const WEEKLY_PLAN_PROJECTION = () => [
  'id',
  'sousActivite { id name }',
  'weekStart',
  'weekEnd',
  'plannedDescription',
  'statusDescription',
  'status',
  'responsible',
  'intervenants',
];

const FUNDING_SOURCE_PROJECTION = () => [
  'id',
  'code',
  'name',
  'isActive',
];

// --- Mutation helper ---

const PERFORM_MUTATION = (mutationType, mutationInput, ACTION, clientMutationLabel) => {
  const mutation = formatMutation(mutationType, mutationInput, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
};

// --- PTBA actions ---

export function fetchPtbas(modulesManager, params) {
  const payload = formatPageQueryWithCount('ptba', params, PTBA_LIST_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_PTBAS);
}

export function fetchPtba(modulesManager, params) {
  const payload = formatPageQueryWithCount('ptba', params, PTBA_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_PTBA);
}

export function clearPtba() {
  return (dispatch) => {
    dispatch({ type: CLEAR(ACTION_TYPE.PTBA) });
  };
}

const formatPtbaGQL = (ptba) => `
  ${ptba?.id ? `id: "${ptba.id}"` : ''}
  ${ptba?.code ? `code: "${formatGQLString(ptba.code)}"` : ''}
  ${ptba?.name ? `name: "${formatGQLString(ptba.name)}"` : ''}
  ${ptba?.fiscalYearStart ? `fiscalYearStart: "${ptba.fiscalYearStart}"` : ''}
  ${ptba?.fiscalYearEnd ? `fiscalYearEnd: "${ptba.fiscalYearEnd}"` : ''}
  ${ptba?.status ? `status: "${ptba.status}"` : ''}
`;

export function createPtba(ptba, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PTBA.CREATE,
    formatPtbaGQL(ptba),
    ACTION_TYPE.CREATE_PTBA,
    clientMutationLabel,
  );
}

export function updatePtba(ptba, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PTBA.UPDATE,
    formatPtbaGQL(ptba),
    ACTION_TYPE.UPDATE_PTBA,
    clientMutationLabel,
  );
}

export function deletePtba(ptba, clientMutationLabel) {
  const ptbaUuids = `ids: ["${ptba?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PTBA.DELETE,
    ptbaUuids,
    ACTION_TYPE.DELETE_PTBA,
    clientMutationLabel,
  );
}

// --- Composante actions ---

export function fetchComposantes(modulesManager, params) {
  const payload = formatPageQueryWithCount('composante', params, COMPOSANTE_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_COMPOSANTES);
}

const formatComposanteGQL = (composante) => `
  ${composante?.id ? `id: "${composante.id}"` : ''}
  ${composante?.ptbaId ? `ptbaId: "${composante.ptbaId}"` : ''}
  ${composante?.code ? `code: "${formatGQLString(composante.code)}"` : ''}
  ${composante?.name ? `name: "${formatGQLString(composante.name)}"` : ''}
  ${composante?.sortOrder != null ? `sortOrder: ${composante.sortOrder}` : ''}
`;

export function createComposante(composante, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.COMPOSANTE.CREATE,
    formatComposanteGQL(composante),
    ACTION_TYPE.CREATE_COMPOSANTE,
    clientMutationLabel,
  );
}

export function updateComposante(composante, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.COMPOSANTE.UPDATE,
    formatComposanteGQL(composante),
    ACTION_TYPE.UPDATE_COMPOSANTE,
    clientMutationLabel,
  );
}

export function deleteComposante(composante, clientMutationLabel) {
  const composanteUuids = `ids: ["${composante?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.COMPOSANTE.DELETE,
    composanteUuids,
    ACTION_TYPE.DELETE_COMPOSANTE,
    clientMutationLabel,
  );
}

// --- SousComposante actions ---

export function fetchSousComposantes(modulesManager, params) {
  const payload = formatPageQueryWithCount('sousComposante', params, SOUS_COMPOSANTE_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_SOUS_COMPOSANTES);
}

const formatSousComposanteGQL = (sousComposante) => `
  ${sousComposante?.id ? `id: "${sousComposante.id}"` : ''}
  ${sousComposante?.composanteId ? `composanteId: "${sousComposante.composanteId}"` : ''}
  ${sousComposante?.code ? `code: "${formatGQLString(sousComposante.code)}"` : ''}
  ${sousComposante?.name ? `name: "${formatGQLString(sousComposante.name)}"` : ''}
  ${sousComposante?.sortOrder != null ? `sortOrder: ${sousComposante.sortOrder}` : ''}
`;

export function createSousComposante(sousComposante, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.SOUS_COMPOSANTE.CREATE,
    formatSousComposanteGQL(sousComposante),
    ACTION_TYPE.CREATE_SOUS_COMPOSANTE,
    clientMutationLabel,
  );
}

export function updateSousComposante(sousComposante, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.SOUS_COMPOSANTE.UPDATE,
    formatSousComposanteGQL(sousComposante),
    ACTION_TYPE.UPDATE_SOUS_COMPOSANTE,
    clientMutationLabel,
  );
}

export function deleteSousComposante(sousComposante, clientMutationLabel) {
  const ids = `ids: ["${sousComposante?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.SOUS_COMPOSANTE.DELETE,
    ids,
    ACTION_TYPE.DELETE_SOUS_COMPOSANTE,
    clientMutationLabel,
  );
}

// --- Activite actions ---

export function fetchActivites(modulesManager, params) {
  const payload = formatPageQueryWithCount('activite', params, ACTIVITE_LIST_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_ACTIVITES);
}

export function fetchActivite(modulesManager, params) {
  const payload = formatPageQueryWithCount('activite', params, ACTIVITE_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_ACTIVITE);
}

export function clearActivite() {
  return (dispatch) => {
    dispatch({ type: CLEAR(ACTION_TYPE.ACTIVITE) });
  };
}

const formatActiviteGQL = (activite) => `
  ${activite?.id ? `id: "${activite.id}"` : ''}
  ${activite?.sousComposanteId ? `sousComposanteId: "${activite.sousComposanteId}"` : ''}
  ${activite?.code ? `code: "${formatGQLString(activite.code)}"` : ''}
  ${activite?.name ? `name: "${formatGQLString(activite.name)}"` : ''}
  ${activite?.status ? `status: "${activite.status}"` : ''}
  ${activite?.implementingStructure ? `implementingStructure: "${formatGQLString(activite.implementingStructure)}"` : ''}
  ${activite?.procurementMethod ? `procurementMethod: "${formatGQLString(activite.procurementMethod)}"` : ''}
  ${activite?.indicatorDescription ? `indicatorDescription: "${formatGQLString(activite.indicatorDescription)}"` : ''}
  ${activite?.province ? `province: "${formatGQLString(activite.province)}"` : ''}
  ${activite?.observations ? `observations: "${formatGQLString(activite.observations)}"` : ''}
  ${activite?.sortOrder != null ? `sortOrder: ${activite.sortOrder}` : ''}
  ${activite?.revisionStatus ? `revisionStatus: "${activite.revisionStatus}"` : ''}
  ${activite?.revisionComment ? `revisionComment: "${formatGQLString(activite.revisionComment)}"` : ''}
`;

export function createActivite(activite, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.ACTIVITE.CREATE,
    formatActiviteGQL(activite),
    ACTION_TYPE.CREATE_ACTIVITE,
    clientMutationLabel,
  );
}

export function updateActivite(activite, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.ACTIVITE.UPDATE,
    formatActiviteGQL(activite),
    ACTION_TYPE.UPDATE_ACTIVITE,
    clientMutationLabel,
  );
}

export function deleteActivite(activite, clientMutationLabel) {
  const activiteUuids = `ids: ["${activite?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.ACTIVITE.DELETE,
    activiteUuids,
    ACTION_TYPE.DELETE_ACTIVITE,
    clientMutationLabel,
  );
}

// --- SousActivite actions ---

export function fetchSousActivites(modulesManager, params) {
  const payload = formatPageQueryWithCount('sousActivite', params, SOUS_ACTIVITE_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_SOUS_ACTIVITES);
}

const formatSousActiviteGQL = (sa) => `
  ${sa?.id ? `id: "${sa.id}"` : ''}
  ${sa?.activiteId ? `activiteId: "${sa.activiteId}"` : ''}
  ${sa?.code ? `code: "${formatGQLString(sa.code)}"` : ''}
  ${sa?.name ? `name: "${formatGQLString(sa.name)}"` : ''}
  ${sa?.unit ? `unit: "${formatGQLString(sa.unit)}"` : ''}
  ${sa?.quantityTotal != null ? `quantityTotal: "${sa.quantityTotal}"` : ''}
  ${sa?.quantityT1 != null ? `quantityT1: "${sa.quantityT1}"` : ''}
  ${sa?.quantityT2 != null ? `quantityT2: "${sa.quantityT2}"` : ''}
  ${sa?.quantityT3 != null ? `quantityT3: "${sa.quantityT3}"` : ''}
  ${sa?.quantityT4 != null ? `quantityT4: "${sa.quantityT4}"` : ''}
  ${sa?.unitCost != null ? `unitCost: "${sa.unitCost}"` : ''}
  ${sa?.budgetT1 != null ? `budgetT1: "${sa.budgetT1}"` : ''}
  ${sa?.budgetT2 != null ? `budgetT2: "${sa.budgetT2}"` : ''}
  ${sa?.budgetT3 != null ? `budgetT3: "${sa.budgetT3}"` : ''}
  ${sa?.budgetT4 != null ? `budgetT4: "${sa.budgetT4}"` : ''}
  ${sa?.budgetTotal != null ? `budgetTotal: "${sa.budgetTotal}"` : ''}
  ${sa?.expenseCategoryCode ? `expenseCategoryCode: "${formatGQLString(sa.expenseCategoryCode)}"` : ''}
  ${sa?.expenseCategory ? `expenseCategory: "${formatGQLString(sa.expenseCategory)}"` : ''}
  ${sa?.sortOrder != null ? `sortOrder: ${sa.sortOrder}` : ''}
  ${sa?.quantityInitial != null ? `quantityInitial: "${sa.quantityInitial}"` : ''}
  ${sa?.quantityRevised != null ? `quantityRevised: "${sa.quantityRevised}"` : ''}
  ${sa?.unitCostInitial != null ? `unitCostInitial: "${sa.unitCostInitial}"` : ''}
  ${sa?.unitCostRevised != null ? `unitCostRevised: "${sa.unitCostRevised}"` : ''}
  ${sa?.budgetInitial != null ? `budgetInitial: "${sa.budgetInitial}"` : ''}
  ${sa?.budgetRevised != null ? `budgetRevised: "${sa.budgetRevised}"` : ''}
  ${sa?.dateStart ? `dateStart: "${sa.dateStart}"` : ''}
  ${sa?.dateEnd ? `dateEnd: "${sa.dateEnd}"` : ''}
  ${sa?.responsible ? `responsible: "${formatGQLString(sa.responsible)}"` : ''}
  ${sa?.intervenants ? `intervenants: "${formatGQLString(sa.intervenants)}"` : ''}
  ${sa?.revisionStatus ? `revisionStatus: "${sa.revisionStatus}"` : ''}
  ${sa?.revisionComment ? `revisionComment: "${formatGQLString(sa.revisionComment)}"` : ''}
`;

export function createSousActivite(sousActivite, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.SOUS_ACTIVITE.CREATE,
    formatSousActiviteGQL(sousActivite),
    ACTION_TYPE.CREATE_SOUS_ACTIVITE,
    clientMutationLabel,
  );
}

export function updateSousActivite(sousActivite, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.SOUS_ACTIVITE.UPDATE,
    formatSousActiviteGQL(sousActivite),
    ACTION_TYPE.UPDATE_SOUS_ACTIVITE,
    clientMutationLabel,
  );
}

export function deleteSousActivite(sousActivite, clientMutationLabel) {
  const ids = `ids: ["${sousActivite?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.SOUS_ACTIVITE.DELETE,
    ids,
    ACTION_TYPE.DELETE_SOUS_ACTIVITE,
    clientMutationLabel,
  );
}

// --- FundingSource actions ---

export function fetchFundingSources(modulesManager, params) {
  const payload = formatPageQueryWithCount('fundingSource', params, FUNDING_SOURCE_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_FUNDING_SOURCES);
}

// --- Funding allocation ---

const formatAllocateFundingGQL = (allocation) => `
  ${allocation?.id ? `id: "${allocation.id}"` : ''}
  ${allocation?.sousActiviteId ? `sousActiviteId: "${allocation.sousActiviteId}"` : ''}
  ${allocation?.fundingSourceId ? `fundingSourceId: "${allocation.fundingSourceId}"` : ''}
  ${allocation?.amount != null ? `amount: "${allocation.amount}"` : ''}
`;

export function allocateFunding(allocation, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.FUNDING.ALLOCATE,
    formatAllocateFundingGQL(allocation),
    ACTION_TYPE.ALLOCATE_FUNDING,
    clientMutationLabel,
  );
}

// --- Lifecycle actions ---

export function transitionActivity(activite, toStatus, comment, clientMutationLabel) {
  const input = `
    activiteId: "${activite.id}"
    toStatus: "${toStatus}"
    ${comment ? `comment: "${formatGQLString(comment)}"` : ''}
  `;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.LIFECYCLE.TRANSITION,
    input,
    ACTION_TYPE.TRANSITION_ACTIVITY,
    clientMutationLabel,
  );
}

const TRANSITION_HISTORY_PROJECTION = () => [
  'id',
  'fromStatus',
  'toStatus',
  'transitionedAt',
  'comment',
  'transitionedBy { username lastName firstName }',
];

export function fetchTransitionHistory(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    'activityStatusTransition',
    params,
    TRANSITION_HISTORY_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_TRANSITION_HISTORY);
}

// --- Execution actions ---

const QUARTERLY_EXECUTION_PROJECTION = () => [
  'id',
  'quarter',
  'year',
  'budgetPrevu',
  'budgetEngage',
  'budgetDecaisse',
  'resultatsAttendus',
  'resultatsRealises',
  'tauxEngagement',
  'tauxDecaissement',
  'tauxRealisation',
  'observations',
  'reportedDate',
  'reportedBy { username lastName firstName }',
  'sousActivite { id code name }',
];

export function fetchQuarterlyExecutions(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    'quarterlyExecution',
    params,
    QUARTERLY_EXECUTION_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_QUARTERLY_EXECUTIONS);
}

export function reportQuarterlyExecution(data, clientMutationLabel) {
  const input = `
    sousActiviteId: "${data.sousActiviteId}"
    quarter: ${data.quarter}
    year: ${data.year}
    ${data.budgetEngage != null ? `budgetEngage: "${data.budgetEngage}"` : ''}
    ${data.budgetDecaisse != null ? `budgetDecaisse: "${data.budgetDecaisse}"` : ''}
    ${data.resultatsRealises != null ? `resultatsRealises: "${data.resultatsRealises}"` : ''}
    ${data.observations ? `observations: "${formatGQLString(data.observations)}"` : ''}
  `;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.EXECUTION.REPORT,
    input,
    ACTION_TYPE.REPORT_QUARTERLY_EXECUTION,
    clientMutationLabel,
  );
}

// --- Dashboard actions ---

export function fetchPtbaDashboard(modulesManager, params) {
  const payload = formatQuery('ptbaDashboard', params, [
    'budgetPrevu',
    'budgetEngage',
    'budgetDecaisse',
    'tauxEngagement',
    'tauxDecaissement',
    'tauxRealisation',
    'activitiesByStatus { status count }',
    'fundingBreakdown { sourceCode sourceName amount percentage }',
    'composantePerformance { composanteId composanteCode composanteName budgetPrevu budgetDecaisse tauxDecaissement tauxRealisation }',
    'quarterlyTrend { quarter tauxEngagement tauxDecaissement tauxRealisation }',
    'topDelayedActivities { activiteId activiteName composanteName tauxRealisation }',
    'alerts { activiteId activiteName message severity }',
  ]);
  return graphql(payload, ACTION_TYPE.GET_PTBA_DASHBOARD);
}

// --- Indicator link actions ---

export function linkActivityToIndicator(activiteId, indicatorId, clientMutationLabel) {
  const input = `
    activiteId: "${activiteId}"
    indicatorId: ${indicatorId}
  `;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.INDICATOR.LINK,
    input,
    ACTION_TYPE.LINK_ACTIVITY_TO_INDICATOR,
    clientMutationLabel,
  );
}

export function unlinkActivityFromIndicator(activiteId, indicatorId, clientMutationLabel) {
  const input = `
    activiteId: "${activiteId}"
    indicatorId: ${indicatorId}
  `;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.INDICATOR.UNLINK,
    input,
    ACTION_TYPE.UNLINK_ACTIVITY_FROM_INDICATOR,
    clientMutationLabel,
  );
}

// --- Weekly Plan actions ---

export function fetchWeeklyPlanEntries(modulesManager, params) {
  const payload = formatPageQueryWithCount('weeklyPlanEntry', params, WEEKLY_PLAN_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_WEEKLY_PLAN_ENTRIES);
}

const formatWeeklyPlanEntryGQL = (entry) => `
  ${entry?.id ? `id: "${entry.id}"` : ''}
  ${entry?.sousActiviteId ? `sousActiviteId: "${entry.sousActiviteId}"` : ''}
  ${entry?.weekStart ? `weekStart: "${entry.weekStart}"` : ''}
  ${entry?.weekEnd ? `weekEnd: "${entry.weekEnd}"` : ''}
  ${entry?.plannedDescription ? `plannedDescription: "${formatGQLString(entry.plannedDescription)}"` : ''}
  ${entry?.statusDescription ? `statusDescription: "${formatGQLString(entry.statusDescription)}"` : ''}
  ${entry?.status ? `status: "${entry.status}"` : ''}
  ${entry?.responsible ? `responsible: "${formatGQLString(entry.responsible)}"` : ''}
  ${entry?.intervenants ? `intervenants: "${formatGQLString(entry.intervenants)}"` : ''}
`;

export function createWeeklyPlanEntry(data, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.WEEKLY.CREATE,
    formatWeeklyPlanEntryGQL(data),
    ACTION_TYPE.CREATE_WEEKLY_PLAN_ENTRY,
    clientMutationLabel,
  );
}

export function updateWeeklyPlanEntry(data, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.WEEKLY.UPDATE,
    formatWeeklyPlanEntryGQL(data),
    ACTION_TYPE.UPDATE_WEEKLY_PLAN_ENTRY,
    clientMutationLabel,
  );
}

export function deleteWeeklyPlanEntry(data, clientMutationLabel) {
  const ids = `ids: ["${data?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.WEEKLY.DELETE,
    ids,
    ACTION_TYPE.DELETE_WEEKLY_PLAN_ENTRY,
    clientMutationLabel,
  );
}

// --- Funding deallocation ---

export function deallocateFunding(allocation, clientMutationLabel) {
  const ids = `ids: ["${allocation?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.FUNDING.DEALLOCATE,
    ids,
    ACTION_TYPE.DEALLOCATE_FUNDING,
    clientMutationLabel,
  );
}

// --- FundingSource CRUD ---

const formatFundingSourceGQL = (fs) => `
  ${fs?.id ? `id: "${fs.id}"` : ''}
  ${fs?.code ? `code: "${formatGQLString(fs.code)}"` : ''}
  ${fs?.name ? `name: "${formatGQLString(fs.name)}"` : ''}
  ${fs?.isActive != null ? `isActive: ${fs.isActive}` : ''}
`;

export function createFundingSource(fs, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.FUNDING_SOURCE.CREATE,
    formatFundingSourceGQL(fs),
    ACTION_TYPE.CREATE_FUNDING_SOURCE,
    clientMutationLabel,
  );
}

export function updateFundingSource(fs, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.FUNDING_SOURCE.UPDATE,
    formatFundingSourceGQL(fs),
    ACTION_TYPE.UPDATE_FUNDING_SOURCE,
    clientMutationLabel,
  );
}

export function deleteFundingSource(fs, clientMutationLabel) {
  const ids = `ids: ["${fs?.id}"]`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.FUNDING_SOURCE.DELETE,
    ids,
    ACTION_TYPE.DELETE_FUNDING_SOURCE,
    clientMutationLabel,
  );
}

// --- Indicator search ---

const INDICATOR_SEARCH_PROJECTION = () => [
  'id',
  'name',
  'baseline',
  'target',
  'section { id name }',
];

export function fetchIndicators(modulesManager, params) {
  const payload = formatPageQueryWithCount('indicator', params, INDICATOR_SEARCH_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_INDICATORS);
}

// --- Calendar actions ---

const CALENDAR_ACTIVITY_PROJECTION = () => [
  'id',
  'name',
  'code',
  'source',
  'dateStart',
  'dateEnd',
  'responsible',
  'revisionStatus',
  'budgetTotal',
  'budgetRevised',
  'activite{id name code status revisionStatus implementingStructure '
  + 'sousComposante{id code name composante{id code name}}}',
];

export function fetchCalendarActivities(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    'sousActivite',
    params,
    CALENDAR_ACTIVITY_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_CALENDAR_ACTIVITIES);
}

// --- PTBA Transition ---

export function transitionPtba(ptba, toStatus, clientMutationLabel) {
  const input = `
    ptbaId: "${ptba.id}"
    toStatus: "${toStatus}"
  `;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PTBA_TRANSITION.TRANSITION,
    input,
    ACTION_TYPE.TRANSITION_PTBA,
    clientMutationLabel,
  );
}

// --- PTBA Approve / Close ---

export function approvePtba(ptba, comment, clientMutationLabel) {
  const input = `
    ptbaId: "${ptba.id}"
    ${comment ? `comment: "${formatGQLString(comment)}"` : ''}
  `;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PTBA_APPROVE.APPROVE,
    input,
    ACTION_TYPE.APPROVE_PTBA,
    clientMutationLabel,
  );
}

export function closePtba(ptba, comment, clientMutationLabel) {
  const input = `
    ptbaId: "${ptba.id}"
    ${comment ? `comment: "${formatGQLString(comment)}"` : ''}
  `;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.PTBA_CLOSE.CLOSE,
    input,
    ACTION_TYPE.CLOSE_PTBA,
    clientMutationLabel,
  );
}

// --- Revision workflow ---

export function beginRevision(sousActiviteId, clientMutationLabel) {
  const input = `sousActiviteId: "${sousActiviteId}"`;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.REVISION.BEGIN,
    input,
    ACTION_TYPE.BEGIN_REVISION,
    clientMutationLabel,
  );
}

export function approveRevision(sousActiviteId, comment, clientMutationLabel) {
  const input = `
    sousActiviteId: "${sousActiviteId}"
    ${comment ? `comment: "${formatGQLString(comment)}"` : ''}
  `;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.REVISION.APPROVE,
    input,
    ACTION_TYPE.APPROVE_REVISION,
    clientMutationLabel,
  );
}

export function rejectRevision(sousActiviteId, reason, clientMutationLabel) {
  const input = `
    sousActiviteId: "${sousActiviteId}"
    ${reason ? `reason: "${formatGQLString(reason)}"` : ''}
  `;
  return PERFORM_MUTATION(
    MUTATION_SERVICE.REVISION.REJECT,
    input,
    ACTION_TYPE.REJECT_REVISION,
    clientMutationLabel,
  );
}
