/**
 * Utility functions for formatting values
 */

/**
 * Format price with appropriate decimal places
 * @param {number} price - The price to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted price
 */
export const formatPrice = (price: any, decimals = 2) => {
  if (typeof price !== "number") {
    // Try to parse number if string is provided
    try {
      price = parseFloat(price.replace(",", "."));
    } catch (e) {
      return "0.00";
    }
  }

  return price.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format amount with appropriate decimal places
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Formatted amount
 */
export const formatAmount = (amount: any, decimals = 4) => {
  if (typeof amount !== "number") {
    // Try to parse number if string is provided
    try {
      amount = parseFloat(amount.replace(",", "."));
    } catch (e) {
      return "0.0000";
    }
  }

  return amount.toFixed(decimals);
};

/**
 * Format percentage value
 * @param {number} value - The percentage value
 * @param {boolean} includeSign - Whether to include + sign for positive values
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value: any, includeSign = true) => {
  if (typeof value !== "number") {
    try {
      value = parseFloat(value);
    } catch (e) {
      return "0.00%";
    }
  }

  const formattedValue = value.toFixed(2);
  if (includeSign && value > 0) {
    return `+${formattedValue}%`;
  }

  return `${formattedValue}%`;
};

/**
 * Format currency value (e.g., for USD equivalent)
 * @param {number} value - The currency value
 * @param {string} currencySymbol - Currency symbol (default: '$')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value: any, currencySymbol = "$") => {
  if (typeof value !== "number") {
    try {
      value = parseFloat(value);
    } catch (e) {
      return `${currencySymbol}0.00`;
    }
  }

  return `${currencySymbol}${value
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

/**
 * Format timestamp to HH:MM format
 * @param {Date|number} timestamp - Date object or timestamp
 * @returns {string} Formatted time
 */
export const formatTime = (timestamp: any) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
