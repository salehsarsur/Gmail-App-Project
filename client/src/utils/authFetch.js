export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('token');

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
