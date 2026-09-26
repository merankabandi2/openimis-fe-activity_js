import {
  PTBA_STATUS,
  ACTIVITY_STATUS,
  RIGHT_PTBA_SEARCH,
  RIGHT_PTBA_CREATE,
  RIGHT_PTBA_UPDATE,
  RIGHT_PTBA_DELETE,
  RIGHT_ACTIVITY_CREATE,
  RIGHT_ACTIVITY_UPDATE,
  RIGHT_ACTIVITY_DELETE,
  RIGHT_EXECUTION_REPORT,
  RIGHT_EXECUTION_APPROVE,
  RIGHT_FUNDING_MANAGE,
} from '../constants';

const holds = (rights, right) => (rights || []).includes(right);

/**
 * What the PTBA screen lets the user do. Each flag mirrors the right the
 * backend mutation checks (activity/gql_mutations.py); a CLOSED PTBA is
 * read-only whatever the rights.
 */
export function ptbaPermissions(rights, ptba, isNew = false) {
  const locked = ptba?.status === PTBA_STATUS.CLOSED;
  const open = !locked;
  return {
    locked,
    canView: isNew ? holds(rights, RIGHT_PTBA_CREATE) : holds(rights, RIGHT_PTBA_SEARCH),
    canSave: isNew ? holds(rights, RIGHT_PTBA_CREATE) : open && holds(rights, RIGHT_PTBA_UPDATE),
    canDelete: !isNew && open && holds(rights, RIGHT_PTBA_DELETE),
    canTransition: !isNew && open && holds(rights, RIGHT_PTBA_UPDATE),
    canAddComposante: open && holds(rights, RIGHT_PTBA_CREATE),
    canEditHierarchy: open && holds(rights, RIGHT_PTBA_UPDATE),
    canDeleteHierarchy: open && holds(rights, RIGHT_PTBA_DELETE),
    canAddSousComposante: open && holds(rights, RIGHT_PTBA_CREATE),
    canAddActivite: open && holds(rights, RIGHT_ACTIVITY_CREATE),
  };
}

/** Delete from the PTBA list: the delete right, and never on a CLOSED PTBA. */
export const canDeletePtbaFromList = (rights, ptba) => (
  holds(rights, RIGHT_PTBA_DELETE) && ptba?.status !== PTBA_STATUS.CLOSED
);

/**
 * What the activity screen lets the user do, per action, with the right
 * each backend mutation checks. A CLOTURE activity is read-only. Under a
 * CLOSED PTBA the activity and its sous-activites cannot be edited, created
 * or deleted (the backend refuses those mutations).
 */
export function activityPermissions(rights, activite) {
  const open = activite?.status !== ACTIVITY_STATUS.CLOTURE;
  const ptbaOpen = activite?.sousComposante?.composante?.ptba?.status !== PTBA_STATUS.CLOSED;
  const editable = open && ptbaOpen;
  return {
    canEdit: editable && holds(rights, RIGHT_ACTIVITY_UPDATE),
    canDelete: editable && holds(rights, RIGHT_ACTIVITY_DELETE),
    canCreateSousActivite: editable && holds(rights, RIGHT_ACTIVITY_CREATE),
    canUpdateSousActivite: editable && holds(rights, RIGHT_ACTIVITY_UPDATE),
    canDeleteSousActivite: editable && holds(rights, RIGHT_ACTIVITY_DELETE),
    canBeginRevision: open && holds(rights, RIGHT_ACTIVITY_UPDATE),
    canDecideRevision: open && holds(rights, RIGHT_EXECUTION_APPROVE),
    canReportExecution: activite?.status === ACTIVITY_STATUS.EN_COURS
      && holds(rights, RIGHT_EXECUTION_REPORT),
    canManageFunding: open && holds(rights, RIGHT_FUNDING_MANAGE),
    canLinkIndicators: open && holds(rights, RIGHT_ACTIVITY_UPDATE),
    canCreateWeekly: open && holds(rights, RIGHT_ACTIVITY_CREATE),
    canUpdateWeekly: open && holds(rights, RIGHT_ACTIVITY_UPDATE),
    canDeleteWeekly: open && holds(rights, RIGHT_ACTIVITY_DELETE),
  };
}

/** A PTBA fiscal year may not end before it starts (ISO date strings). */
export const ptbaDatesValid = (start, end) => !start || !end || String(end) >= String(start);
