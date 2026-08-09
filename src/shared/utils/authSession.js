import { baseApi } from '../lib/baseApi';

export function clearAuthSession(dispatch) {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('status');
  localStorage.removeItem('email');
  localStorage.removeItem('name');
  if (dispatch) {
    dispatch(baseApi.util.resetApiState());
  }
}

export function setAuthSession({ token, role, status, email, name }, dispatch) {
  if (token) localStorage.setItem('token', token);
  if (role) localStorage.setItem('role', role);
  if (status) localStorage.setItem('status', status);
  if (email) localStorage.setItem('email', email);
  if (name) localStorage.setItem('name', name);
  if (dispatch) {
    dispatch(baseApi.util.resetApiState());
  }
}
