/**
 * Helper functions for authentication
 */

// Store authentication state in local storage to prevent unnecessary API calls
const AUTH_STATE_KEY = 'manuflow_auth_state';

/**
 * Set authentication state in local storage
 */
export const setAuthState = (isAuthenticated: boolean): void => {
  localStorage.setItem(AUTH_STATE_KEY, JSON.stringify({
    isAuthenticated,
    timestamp: Date.now()
  }));
};

/**
 * Check if user is likely authenticated based on local storage
 * This helps prevent unnecessary API calls when we know the user isn't authenticated
 */
export const isProbablyAuthenticated = (): boolean => {
  try {
    const authStateStr = localStorage.getItem(AUTH_STATE_KEY);
    if (!authStateStr) return false;
    
    const authState = JSON.parse(authStateStr);
    const isStale = Date.now() - authState.timestamp > 30 * 60 * 1000; // 30 minutes
    
    // If the state is stale, we should check with the server
    if (isStale) return true;
    
    return authState.isAuthenticated;
  } catch (error) {
    return false;
  }
};

/**
 * Clear authentication state from local storage
 */
export const clearAuthState = (): void => {
  localStorage.removeItem(AUTH_STATE_KEY);
};
