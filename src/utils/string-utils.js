export const pageTitle = (item) => ({
  name: item?.name,
});

export const mutationLabel = (item) => ({
  id: item?.id,
});

export const formatBIFAmount = (value) => {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};
