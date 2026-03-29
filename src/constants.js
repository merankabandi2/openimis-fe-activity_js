export const MODULE_NAME = 'activity';

// --- PTBA Status ---
export const PTBA_STATUS = {
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
};

export const PTBA_STATUS_LIST = [
  PTBA_STATUS.DRAFT,
  PTBA_STATUS.APPROVED,
  PTBA_STATUS.ACTIVE,
  PTBA_STATUS.CLOSED,
];

// --- Activity Status ---
export const ACTIVITY_STATUS = {
  PLANIFIE: 'PLANIFIE',
  BUDGETISE: 'BUDGETISE',
  EN_COURS: 'EN_COURS',
  REALISE: 'REALISE',
  CLOTURE: 'CLOTURE',
};

export const ACTIVITY_STATUS_LIST = [
  ACTIVITY_STATUS.PLANIFIE,
  ACTIVITY_STATUS.BUDGETISE,
  ACTIVITY_STATUS.EN_COURS,
  ACTIVITY_STATUS.REALISE,
  ACTIVITY_STATUS.CLOTURE,
];

// --- Revision Status ---
export const REVISION_STATUS = {
  INITIAL: 'INITIAL',
  REVISE: 'REVISE',
  AJOUTE: 'AJOUTE',
  ABANDONNE: 'ABANDONNE',
};

// --- Weekly Status ---
export const WEEKLY_STATUS = {
  PLANIFIE: 'PLANIFIE',
  EN_COURS: 'EN_COURS',
  REALISE: 'REALISE',
  REPORTE: 'REPORTE',
  SUSPENDU: 'SUSPENDU',
  PARTIELLEMENT_REALISE: 'PARTIELLEMENT_REALISE',
};

// --- Revision Status Colors ---
export const REVISION_STATUS_COLORS = {
  INITIAL: '#9e9e9e',
  REVISE: '#ff9800',
  AJOUTE: '#4caf50',
  ABANDONNE: '#f44336',
};

// --- Weekly Status Colors ---
export const WEEKLY_STATUS_COLORS = {
  PLANIFIE: '#9e9e9e',
  EN_COURS: '#1976d2',
  REALISE: '#4caf50',
  REPORTE: '#ff9800',
  SUSPENDU: '#f44336',
  PARTIELLEMENT_REALISE: '#ffeb3b',
};

// --- Calendar Color Schemes ---
export const CALENDAR_COLOR_BY = {
  STATUS: 'status',
  COMPOSANTE: 'composante',
  SOURCE: 'source',
  REVISION: 'revision',
  RESPONSIBLE: 'responsible',
};

export const CALENDAR_GROUP_BY = {
  COMPOSANTE: 'composante',
  RESPONSIBLE: 'responsible',
  STATUS: 'status',
  FLAT: 'flat',
};

export const CALENDAR_VIEW = {
  TIMELINE: 'timeline',
  MONTH: 'month',
  WEEK: 'week',
};

export const SOURCE_TYPES = {
  PTBA: 'PTBA',
  WEEKLY: 'WEEKLY',
  MANUAL: 'MANUAL',
};

export const SOURCE_COLORS = {
  PTBA: '#1976d2',
  WEEKLY: '#ff9800',
  MANUAL: '#9e9e9e',
};

export const COMPOSANTE_PALETTE = [
  '#1976d2',
  '#388e3c',
  '#f57c00',
  '#7b1fa2',
  '#c62828',
  '#00838f',
  '#5d4037',
  '#283593',
  '#ad1457',
  '#00695c',
];

export const RESPONSIBLE_PALETTE = [
  '#1976d2',
  '#388e3c',
  '#f57c00',
  '#7b1fa2',
  '#c62828',
  '#00838f',
  '#5d4037',
  '#283593',
  '#ad1457',
  '#00695c',
  '#ef6c00',
  '#1565c0',
];

// --- Routes ---
export const ROUTE_PTBA_LIST = 'activity/ptba';
export const ROUTE_PTBA = 'activity/ptba/ptba';
export const ROUTE_ACTIVITE = 'activity/activite';
export const ROUTE_DASHBOARD = 'activity/dashboard';
export const ROUTE_WEEKLY_PLAN = 'activity/weekly-plan';
export const ROUTE_FUNDING_SOURCES = 'activity/funding-sources';
export const ROUTE_CALENDAR = 'activity/calendar';

// --- Route ref keys ---
export const PTBA_LIST_ROUTE = 'activity.route.ptbaList';
export const PTBA_ROUTE = 'activity.route.ptba';
export const ACTIVITE_ROUTE = 'activity.route.activite';
export const DASHBOARD_ROUTE = 'activity.route.dashboard';
export const WEEKLY_PLAN_ROUTE = 'activity.route.weeklyPlan';
export const FUNDING_SOURCES_ROUTE = 'activity.route.fundingSources';
export const CALENDAR_ROUTE = 'activity.route.calendar';

// --- PTBA Lifecycle Transitions ---
export const PTBA_VALID_TRANSITIONS = {
  DRAFT: ['APPROVED'],
  APPROVED: ['ACTIVE', 'DRAFT'],
  ACTIVE: ['CLOSED'],
  CLOSED: [],
};

// --- Activity Lifecycle Transitions ---
export const VALID_TRANSITIONS = {
  PLANIFIE: ['BUDGETISE'],
  BUDGETISE: ['EN_COURS', 'PLANIFIE'],
  EN_COURS: ['REALISE'],
  REALISE: ['CLOTURE', 'EN_COURS'],
  CLOTURE: [],
};

export const TRANSITION_LABELS = {
  PLANIFIE_BUDGETISE: 'transition.budgetiser',
  BUDGETISE_EN_COURS: 'transition.demarrer',
  EN_COURS_REALISE: 'transition.marquerRealise',
  REALISE_CLOTURE: 'transition.cloturer',
  BUDGETISE_PLANIFIE: 'transition.revenirPlanifie',
  REALISE_EN_COURS: 'transition.reouvrir',
};

// --- Rights (170001-170013) ---
export const RIGHT_PTBA_SEARCH = 170001;
export const RIGHT_PTBA_CREATE = 170002;
export const RIGHT_PTBA_UPDATE = 170003;
export const RIGHT_PTBA_DELETE = 170004;
export const RIGHT_ACTIVITY_SEARCH = 170005;
export const RIGHT_ACTIVITY_CREATE = 170006;
export const RIGHT_ACTIVITY_UPDATE = 170007;
export const RIGHT_ACTIVITY_DELETE = 170008;
export const RIGHT_EXECUTION_REPORT = 170009;
export const RIGHT_EXECUTION_APPROVE = 170010;
export const RIGHT_TRANSITION = 170011;
export const RIGHT_DASHBOARD_VIEW = 170012;
export const RIGHT_FUNDING_MANAGE = 170013;

export const TRANSITION_RIGHTS = {
  PLANIFIE_BUDGETISE: RIGHT_PTBA_UPDATE,
  BUDGETISE_EN_COURS: RIGHT_TRANSITION,
  EN_COURS_REALISE: RIGHT_EXECUTION_REPORT,
  REALISE_CLOTURE: RIGHT_EXECUTION_APPROVE,
  BUDGETISE_PLANIFIE: RIGHT_TRANSITION,
  REALISE_EN_COURS: RIGHT_TRANSITION,
};

// --- Status Colors ---
export const STATUS_COLORS = {
  PLANIFIE: '#9e9e9e',
  BUDGETISE: '#1976d2',
  EN_COURS: '#ff9800',
  REALISE: '#4caf50',
  CLOTURE: '#424242',
};

// --- Menu Contribution Keys ---
export const ACTIVITY_MAIN_MENU_CONTRIBUTION_KEY = 'activity.MainMenu';

// --- Defaults ---
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_DEBOUNCE_TIME = 500;
export const CONTAINS_LOOKUP = 'Icontains';

// --- Quarters ---
export const QUARTERS = [
  { value: 1, label: 'T1' },
  { value: 2, label: 'T2' },
  { value: 3, label: 'T3' },
  { value: 4, label: 'T4' },
];
