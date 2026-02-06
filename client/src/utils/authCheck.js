import API_CONFIG from '../config/api.config';
//profile,email,username
/**
 * Check auth by making a request to any protected endpoint
 * If request fails with 403, redirect to login
 * @param {string} url - Backend endpoint to check (e.g., '/user/wishlist')
 * @param {Function} navigate - React Router navigate function
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
export const checkAuth = async (url, navigate) => {
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}${url}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 403) {
      // Token invalid or missing, redirect to login
      if (navigate) {
        navigate('/login');
      }
      return false;
    }

    if (response.ok) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};

/**
 * Hook-ready auth fetch wrapper
 * Automatically includes credentials and redirects on 403
 * @param {string} url - Full URL to fetch
 * @param {Object} options - Fetch options
 * @param {Function} navigate - Optional navigate function for redirect on 403
 * @returns {Promise<Response>}
 */
export const authFetch = async (url, options = {}, navigate = null) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // If unauthorized, redirect to login
  if (response.status === 403 && navigate) {
    navigate('/login');
  }

  return response;
};

