import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isDate, isBefore, isAfter, addDays, subDays } from "date-fns";

/**
 * Combines class names using clsx and tailwind-merge for better class name handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validates a phone number (basic validation)
 */
export function validatePhone(phone: string): boolean {
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{4,10}$/;
  return re.test(phone);
}

/**
 * Formats a date string to a readable format
 * @param date Date string or Date object
 * @param formatStr Format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Formats a date and time string to a readable format
 * @param date Date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

/**
 * Formats a time string to 12-hour format
 * @param time Time string in 24-hour format (HH:MM)
 * @returns Formatted time string in 12-hour format
 */
export function formatTime(time: string): string {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Converts a file to base64 string
 * @param file File object
 * @returns Promise that resolves to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Validates a file based on size and type
 * @param file File object
 * @param options Object containing maxSize in MB and allowedTypes array
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateFile(
  file: File, 
  options: { maxSize?: number; allowedTypes?: string[] } = {}
): { isValid: boolean; error?: string } {
  const { maxSize = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
  
  if (file.size > maxSize * 1024 * 1024) {
    return { 
      isValid: false, 
      error: `File size must be less than ${maxSize}MB` 
    };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  return { isValid: true };
}

/**
 * Truncates a string to a specified length and adds ellipsis
 * @param str Input string
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number = 100): string {
  if (!str) return '';
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
}

/**
 * Generates a random string of specified length
 * @param length Length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce a function call
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Converts a string to title case
 * @param str Input string
 * @returns String in title case
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Checks if a date is in the future
 * @param date Date string or Date object
 * @returns Boolean indicating if the date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isAfter(dateObj, new Date());
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a date is in the past
 * @param date Date string or Date object
 * @returns Boolean indicating if the date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isBefore(dateObj, new Date());
  } catch (error) {
    return false;
  }
}

/**
 * Gets the time difference between two dates in a human-readable format
 * @param startDate Start date string or Date object
 * @param endDate End date string or Date object (defaults to now)
 * @returns Human-readable time difference (e.g., "2 days ago", "in 1 hour")
 */
export function getTimeDifference(
  startDate: string | Date, 
  endDate: string | Date = new Date()
): string {
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    const diffInSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ${diffInDays > 0 ? 'ago' : ''}`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ${diffInHours > 0 ? 'ago' : ''}`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ${diffInMinutes > 0 ? 'ago' : ''}`;
    } else {
      return 'just now';
    }
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return '';
  }
}
