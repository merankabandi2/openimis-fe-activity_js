export const pageTitle = (item) => ({
  name: item?.name,
});

export const mutationLabel = (item) => ({
  id: item?.id,
});

// Quantities, unit costs and amounts are stored with two decimals
// (DecimalField decimal_places=2); both decimals are shown when set.
export const formatDecimal = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
};

export const formatBIFAmount = (value) => formatDecimal(value);
