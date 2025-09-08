import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
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
  // Get all domains
  getAllDomains: () => api.get('/domains'),
  
  // Create domain
  createDomain: (domainData) => api.post('/domains', domainData),
  
  // Create multiple domains
  createDomains: (domainsData) => api.post('/domains/multiple', domainsData),
  
  // Import domains from CSV
  importDomainsFromCSV: (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);
    return api.post('/domains/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update domain
  updateDomain: (id, domainData) => api.put(`/domains/${id}`, domainData),
  
  // Delete domain
  deleteDomain: (id) => api.delete(`/domains/${id}`),
  
  // Mark as sold
  markAsSold: (id) => api.patch(`/domains/${id}/sold`),
  
  // Mark as available
  markAsAvailable: (id) => api.patch(`/domains/${id}/available`),
  
  // Post to channel
  postToChannel: (id) => api.patch(`/domains/${id}/post`),
  
  // Remove from channel
  removeFromChannel: (id) => api.patch(`/domains/${id}/unpost`),
};

export const ticketAPI = {
  // Get all tickets
  getAllTickets: () => api.get('/tickets'),
  
  // Get new tickets count
  getNewTicketsCount: () => api.get('/tickets/count/new'),
  
  // Create ticket
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  
  // Update ticket
  updateTicket: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  
  // Delete ticket
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
  
  // Mark as read
  markAsRead: (id) => api.patch(`/tickets/${id}/read`),
  
  // Mark as sold
  markAsSold: (id, data) => api.patch(`/tickets/${id}/sold`, data),
  
  // Mark as cancelled
  markAsCancelled: (id) => api.patch(`/tickets/${id}/cancelled`),
};

export default api;
