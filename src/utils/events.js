/**
 * Click handler for a control inside a clickable table row: runs `action`
 * without letting the click reach the row's own onClick.
 */
export const stopRowClick = (action) => (event) => {
  if (event?.stopPropagation) event.stopPropagation();
  action(event);
};
