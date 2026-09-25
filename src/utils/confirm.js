// Decisions for a confirmation a component opens in the shared fe-core
// confirm dialog (state.core.confirm, state.core.confirmed). Pure module (no
// imports) so it runs under `node --test`.

let lastToken = 0;

// Intent carried by every confirm dialog one component instance opens. Each
// instance gets its own, so an answer is only taken for the dialog it opened.
export const newConfirmToken = () => {
  lastToken += 1;
  return `activity-confirm-${lastToken}`;
};

// `pending` is the action a component waits to run on OK:
// { token, action, opened } or null. Returns the pending action to keep, the
// action to run now (or null) and whether the component's own dialog has just
// been answered:
// - its own dialog is shown: marked opened;
// - another dialog is shown (another component, session expiry): dropped;
// - its dialog is closed: answered, run when the answer is OK, dropped in
//   every case.
export function confirmStep(pending, confirm, confirmed) {
  if (!pending) return { pending: null, run: null, answered: false };
  if (confirm) {
    return confirm.intent === pending.token
      ? { pending: { ...pending, opened: true }, run: null, answered: false }
      : { pending: null, run: null, answered: false };
  }
  if (!pending.opened) return { pending, run: null, answered: false };
  return { pending: null, run: confirmed === true ? pending.action : null, answered: true };
}
