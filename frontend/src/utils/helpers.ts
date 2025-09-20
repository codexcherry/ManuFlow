import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string, formatStr: string = 'MMM dd, yyyy') => {
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (dateString: string) => {
  return formatDate(dateString, 'MMM dd, yyyy HH:mm');
};

export const formatCurrency = (amount: number, currency: string = '$') => {
  return `${currency}${amount.toFixed(2)}`;
};

export const formatNumber = (num: number, decimals: number = 2) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const calculateEfficiency = (produced: number, planned: number): number => {
  if (planned === 0) return 0;
  return Math.round((produced / planned) * 100);
};

export const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    planned: 'badge-planned',
    in_progress: 'badge-in-progress',
    done: 'badge-done',
    cancelled: 'badge-cancelled',
    pending: 'badge-pending',
    completed: 'badge-completed',
  };
  return colors[status] || 'badge-pending';
};

export const getStatusText = (status: string): string => {
  const texts: { [key: string]: string } = {
    planned: 'Planned',
    in_progress: 'In Progress',
    done: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    completed: 'Completed',
  };
  return texts[status] || status;
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): { isValid: boolean; message: string } => {
  if (username.length < 6) {
    return { isValid: false, message: 'Username must be at least 6 characters long' };
  }
  
  if (username.length > 12) {
    return { isValid: false, message: 'Username must be at most 12 characters long' };
  }
  
  return { isValid: true, message: '' };
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasUpperCase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!hasLowerCase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: '' };
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const downloadAsCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
