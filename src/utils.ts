/**
 * Utility functions for Hashmi Fabrics System
 */

/**
 * Format any number as PKR currency: "Rs. X,XXX"
 */
export function formatPKR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rs. 0";
  return `Rs. ${Math.round(num).toLocaleString("en-US")}`;
}

/**
 * Generate 2 letter initials from any name
 */
export function getInitials(name: string): string {
  if (!name) return "HF";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
