
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

export const calculateSavingsRange = (estimatedAnnualSpend: number, minCashbackPercentage: number, maxCashbackPercentage: number) => {
  const minSavings = Math.round(estimatedAnnualSpend * (minCashbackPercentage / 100));
  const maxSavings = Math.round(estimatedAnnualSpend * (maxCashbackPercentage / 100));
  return { minSavings, maxSavings };
};
