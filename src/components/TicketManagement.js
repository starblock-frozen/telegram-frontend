import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  FilterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import TicketTable from './TicketTable';
import TicketDetailsModal from './TicketDetailsModal';
import TicketFilterPanel from './TicketFilterPanel';
import { ticketAPI } from '../services/api';
import { exportTicketsToCSV } from '../utils/csvExport';
import dayjs from 'dayjs';

const { Title } = Typography;

const TicketManagement = ({ 
  tickets, 
  setTickets, 
  loading, 
  fetchTickets, 
  showNotification,
  onTicketCountChange
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filters, setFilters] = useState({
    customer_id: '',
    status: null,
    domains: [],
    dateRange: null,
  });

  useEffect(() => {
    applyFilters();
  }, [tickets, filters]);

  const applyFilters = () => {
    let filtered = [...tickets];

    if (filters.customer_id) {
      filtered = filtered.filter(ticket =>
        ticket.customer_id.toLowerCase().includes(filters.customer_id.toLowerCase())
      );
    }

    if (filters.status !== null) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    if (filters.domains.length > 0) {
      filtered = filtered.filter(ticket =>
        ticket.request_domains.some(domain =>
          filters.domains.some(filterDomain =>
            domain.toLowerCase().includes(filterDomain.toLowerCase())
          )
        )
      );
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(ticket => {
        if (!ticket.request_time) return false;
        const ticketDate = dayjs(ticket.request_time);
        return ticketDate.isAfter(startDate.startOf('day')) && 
               ticketDate.isBefore(endDate.endOf('day'));
      });
    }

    setFilteredTickets(filtered);
  };

  const handleViewDetails = async (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
    
    if (ticket.status === 'New') {
      try {
        await ticketAPI.markAsRead(ticket.id);
        const updatedTickets = tickets.map(t => 
          t.id === ticket.id ? { ...t, status: 'Read' } : t
        );
        setTickets(updatedTickets);
        onTicketCountChange();
      } catch (error) {
        console.error('Error marking ticket as read:', error);
      }
    }
  };

  const handleStatusChange = async (ticketId, newStatus, price = null, soldDomains = null) => {
    try {
      if (newStatus === 'Sold' && price !== null) {
        const requestData = { price };
        if (soldDomains) {
          requestData.soldDomains = soldDomains;
        }
        await ticketAPI.markAsSold(ticketId, requestData);
      } else if (newStatus === 'Cancelled') {
        await ticketAPI.markAsCancelled(ticketId);
      } else if (newStatus === 'Read') {
        await ticketAPI.markAsRead(ticketId);
      }
      
      showNotification('success', 'Success', `Ticket marked as ${newStatus.toLowerCase()}`);
      fetchTickets();
      onTicketCountChange();
    } catch (error) {
      showNotification('error', 'Error', `Failed to mark ticket as ${newStatus.toLowerCase()}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await ticketAPI.deleteTicket(id);
      showNotification('success', 'Success', 'Ticket deleted successfully');
      fetchTickets();
      onTicketCountChange();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete ticket');
    }
  };

  const handleExportCSV = () => {
    exportTicketsToCSV(filteredTickets, 'tickets.csv');
    showNotification('success', 'Success', 'Tickets exported successfully');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      customer_id: '',
      status: null,
      domains: [],
      dateRange: null,
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Ticket
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            </Space>
          </Col>
        </Row>

        {showFilters && (
          <>
            <Divider />
            <TicketFilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              tickets={tickets}
            />
          </>
        )}

        <Divider />

        <TicketTable
          tickets={filteredTickets}
          loading={loading}
          onViewDetails={handleViewDetails}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />

        <TicketDetailsModal
          visible={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          ticket={selectedTicket}
          onStatusChange={handleStatusChange}
        />
      </Card>
    </div>
  );
};

export default TicketManagement;
