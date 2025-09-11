import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const domainAPI = {
  getAllDomains: () => api.get('/domains'),
  createDomain: (domainData) => api.post('/domains', domainData),
  createDomains: (domainsData) => api.post('/domains/multiple', domainsData),
  importDomainsFromCSV: (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);
    return api.post('/domains/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateDomain: (id, domainData) => api.put(`/domains/${id}`, domainData),
  deleteDomain: (id) => api.delete(`/domains/${id}`),
  markAsSold: (id) => api.patch(`/domains/${id}/sold`),
  markAsAvailable: (id) => api.patch(`/domains/${id}/available`),
  postToChannel: (id) => api.patch(`/domains/${id}/post`),
  removeFromChannel: (id) => api.patch(`/domains/${id}/unpost`),
};

export const ticketAPI = {
  getAllTickets: () => api.get('/tickets'),
  getNewTicketsCount: () => api.get('/tickets/count/new'),
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  updateTicket: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
  markAsRead: (id) => api.patch(`/tickets/${id}/read`),
  markAsSold: (id, data) => api.patch(`/tickets/${id}/sold`, data),
  markAsCancelled: (id) => api.patch(`/tickets/${id}/cancelled`),
};

export const telegramAPI = {
  sendNotification: (message) => api.post('/telegram/notify', { message }),
};

export default api;
