import { PTBA_STATUS } from '../constants';

/**
 * Message key of a PTBA status label; a PTBA not yet saved has no status and
 * is shown as DRAFT, the status the backend gives it on creation.
 */
export const ptbaStatusMessageKey = (status) => `ptba.status.${status || PTBA_STATUS.DRAFT}`;
