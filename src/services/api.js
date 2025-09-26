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

// WebSocket connection for real-time updates
let wsConnection = null;

export const connectWebSocket = (onNewTicket) => {
  if (wsConnection) {
    wsConnection.close();
  }

  const token = localStorage.getItem('token');
  if (!token) return;

  const wsUrl = process.env.REACT_APP_WS_URL || `ws://localhost:5000/ws?token=${token}`;
  
  try {
    wsConnection = new WebSocket(wsUrl);
    
    wsConnection.onopen = () => {
      console.log('WebSocket connected');
    };
    
    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_TICKET' && onNewTicket) {
          onNewTicket(data.ticket);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (localStorage.getItem('token')) {
          connectWebSocket(onNewTicket);
        }
      }, 5000);
    };
    
    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    console.error('Error creating WebSocket connection:', error);
  }
};

export const disconnectWebSocket = () => {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
};

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
  // New bulk actions API
  bulkActions: (action, domainNames) => api.post('/domains/bulk-actions', { action, domainNames }),
};

export const ticketAPI = {
  getAllTickets: () => api.get('/tickets'),
  getNewTicketsCount: () => api.get('/tickets/count/new'),
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  updateTicket: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  updateNote: (id, noteData) => api.patch(`/tickets/${id}/note`, noteData),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
  markAsRead: (id) => api.patch(`/tickets/${id}/read`),
  markAsSold: (id, data) => api.patch(`/tickets/${id}/sold`, data),
  markAsCancelled: (id, data) => api.patch(`/tickets/${id}/cancelled`, data),
};

export const telegramAPI = {
  sendNotification: (message) => api.post('/telegram/notify', { message }),
};

export default api;
