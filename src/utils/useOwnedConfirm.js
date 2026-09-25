import { useEffect, useRef } from 'react';

import { confirmStep, newConfirmToken } from './confirm';

// Returns `askConfirm(title, message, action)`, which opens the fe-core confirm
// dialog and runs `action` only when the user answers OK to that same dialog.
// `confirm` and `confirmed` are state.core.confirm and state.core.confirmed;
// `coreConfirm` and `clearConfirm` are the bound fe-core action creators.
export function useOwnedConfirm(confirm, confirmed, coreConfirm, clearConfirm) {
  const token = useRef(null);
  if (token.current === null) token.current = newConfirmToken();
  const pending = useRef(null);
  const shown = useRef(confirm);
  shown.current = confirm;

  useEffect(() => {
    const step = confirmStep(pending.current, confirm, confirmed);
    pending.current = step.pending;
    if (step.run) step.run();
  }, [confirm, confirmed]);

  // A dialog this component opened does not outlive it.
  useEffect(() => () => {
    if (pending.current && shown.current?.intent === pending.current.token) {
      clearConfirm(null);
    }
  }, []);

  return (title, message, action) => {
    pending.current = { token: token.current, action, opened: false };
    coreConfirm(title, message, token.current);
  };
}
