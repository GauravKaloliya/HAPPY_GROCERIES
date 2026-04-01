const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_USERNAME_KEY = 'adminUsername';

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const getAdminUsername = () => localStorage.getItem(ADMIN_USERNAME_KEY);

export const setAdminSession = ({ token, username }) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USERNAME_KEY, username);
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USERNAME_KEY);
};

export const isAdminAuthenticated = () => !!getAdminToken();
