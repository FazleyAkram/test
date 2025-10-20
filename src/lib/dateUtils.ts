/**
 * Formats a date to DD-MM-YYYY format
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string in DD-MM-YYYY format
 */
export function formatDateDMY(date: Date | string | number): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * Formats a date to DD-MM-YYYY format for HTML date inputs
 * Note: HTML date inputs require YYYY-MM-DD format, so this converts back
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string in YYYY-MM-DD format for HTML inputs
 */
export function formatDateForInput(date: Date | string | number): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Parses a DD-MM-YYYY formatted date string to a Date object
 * @param dateString - Date string in DD-MM-YYYY format
 * @returns Date object
 */
export function parseDMYDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  
  return new Date(dateString);
}





