import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme, notification } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './components/LoginPage';
import MainLayout from './components/MainLayout';
import DomainManagement from './components/DomainManagement';
import TicketManagement from './components/TicketManagement';
import { domainAPI, ticketAPI, authAPI } from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [newTicketsCount, setNewTicketsCount] = useState(0);
  const [activeTab, setActiveTab] = useState('domains');
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  // Check authentication on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchInitialData();
    }
    setLoading(false);
  }, []);

  // Fetch initial data when authenticated
  const fetchInitialData = async () => {
    await Promise.all([
      fetchDomains(),
      fetchTickets(),
      fetchNewTicketsCount()
    ]);
  };

  // Fetch domains from API
  const fetchDomains = async () => {
    try {
      setDomainsLoading(true);
      const response = await domainAPI.getAllDomains();
      setDomains(response.data.data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      showNotification('error', 'Error', 'Failed to fetch domains');
    } finally {
      setDomainsLoading(false);
    }
  };

  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      const response = await ticketAPI.getAllTickets();
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showNotification('error', 'Error', 'Failed to fetch tickets');
    } finally {
      setTicketsLoading(false);
    }
  };

  // Fetch new tickets count
  const fetchNewTicketsCount = async () => {
    try {
      const response = await ticketAPI.getNewTicketsCount();
      setNewTicketsCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching new tickets count:', error);
    }
  };

  // Handle login
  const handleLogin = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      
      // Fetch initial data after login
      await fetchInitialData();
      
      showNotification('success', 'Success', 'Login successful');
    } catch (error) {
      throw error; // Let LoginPage handle the error
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setDomains([]);
    setTickets([]);
    setNewTicketsCount(0);
    setActiveTab('domains');
    showNotification('info', 'Info', 'Logged out successfully');
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Refresh data when switching tabs
    if (tab === 'domains') {
      fetchDomains();
    } else if (tab === 'tickets') {
      fetchTickets();
      fetchNewTicketsCount();
    }
  };

  // Notification function using both Ant Design and React Toastify
  const showNotification = (type, title, message) => {
    // Ant Design notification
    api[type]({
      message: title,
      description: message,
      placement: 'topRight',
      duration: 4.5,
    });

    // React Toastify notification (backup)
    switch (type) {
      case 'success':
        toast.success(`${title}: ${message}`);
        break;
      case 'error':
        toast.error(`${title}: ${message}`);
        break;
      case 'warning':
        toast.warning(`${title}: ${message}`);
        break;
      case 'info':
        toast.info(`${title}: ${message}`);
        break;
      default:
        toast(`${title}: ${message}`);
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            colorBgContainer: '#141414',
            colorBgElevated: '#1f1f1f',
            colorBorder: '#303030',
            colorText: 'rgba(255, 255, 255, 0.85)',
            colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
            colorBgBase: '#000000',
          },
        }}
      >
        <div className="App">
          {contextHolder}
          <LoginPage onLogin={handleLogin} />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </ConfigProvider>
    );
  }

  // Show main application
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorBgContainer: '#141414',
          colorBgElevated: '#1f1f1f',
          colorBorder: '#303030',
          colorText: 'rgba(255, 255, 255, 0.85)',
          colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
          colorBgBase: '#000000',
        },
      }}
    >
      <div className="App">
        {contextHolder}
        <MainLayout
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          newTicketsCount={newTicketsCount}
        >
          {activeTab === 'domains' && (
            <DomainManagement
              domains={domains}
              setDomains={setDomains}
              loading={domainsLoading}
              fetchDomains={fetchDomains}
              showNotification={showNotification}
            />
          )}
          {activeTab === 'tickets' && (
            <TicketManagement
              tickets={tickets}
              setTickets={setTickets}
              loading={ticketsLoading}
              fetchTickets={fetchTickets}
              showNotification={showNotification}
              onTicketCountChange={fetchNewTicketsCount}
            />
          )}
        </MainLayout>
      </div>
    </ConfigProvider>
  );
}

export default App;
