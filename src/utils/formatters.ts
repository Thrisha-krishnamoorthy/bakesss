
/**
 * Format a number as INR currency (₹)
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};
