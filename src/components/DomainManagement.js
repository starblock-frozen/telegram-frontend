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
  PlusOutlined,
  DownloadOutlined,
  FilterOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import DomainTable from './DomainTable';
import DomainForm from './DomainForm';
import DomainDetailsModal from './DomainDetailsModal';
import FilterPanel from './FilterPanel';
import ImportModal from './ImportModal';
import { domainAPI } from '../services/api';
import { exportToCSV } from '../utils/csvExport';
import dayjs from 'dayjs';

const { Title } = Typography;

const DomainManagement = ({ 
  domains, 
  setDomains, 
  loading, 
  fetchDomains, 
  showNotification 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [filters, setFilters] = useState({
    domainName: '',
    countries: [],
    categories: [],
    daRange: [0, 100],
    paRange: [0, 100],
    ssRange: [0, 100],
    status: null,
    ischannel: null,
    dateRange: null,
    postDateRange: null,
  });

  useEffect(() => {
    applyFilters();
  }, [domains, filters]);

  const applyFilters = () => {
    let filtered = [...domains];

    // Domain name filter
    if (filters.domainName) {
      filtered = filtered.filter(domain =>
        domain.domainName.toLowerCase().includes(filters.domainName.toLowerCase())
      );
    }

    // Country filter
    if (filters.countries.length > 0) {
      filtered = filtered.filter(domain =>
        filters.countries.includes(domain.country)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(domain =>
        filters.categories.includes(domain.category)
      );
    }

    // DA range filter
    filtered = filtered.filter(domain =>
      domain.da >= filters.daRange[0] && domain.da <= filters.daRange[1]
    );

    // PA range filter
    filtered = filtered.filter(domain =>
      domain.pa >= filters.paRange[0] && domain.pa <= filters.paRange[1]
    );

    // SS range filter
    filtered = filtered.filter(domain =>
      domain.ss >= filters.ssRange[0] && domain.ss <= filters.ssRange[1]
    );

    // Status filter
    if (filters.status !== null) {
      filtered = filtered.filter(domain => domain.status === filters.status);
    }

    // Channel filter
    if (filters.ischannel !== null) {
      filtered = filtered.filter(domain => domain.ischannel === filters.ischannel);
    }

    // Date range filter (created date)
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(domain => {
        if (!domain.createdAt) return false;
        const domainDate = dayjs(domain.createdAt);
        return domainDate.isAfter(startDate.startOf('day')) && 
               domainDate.isBefore(endDate.endOf('day'));
      });
    }

    // Post date range filter
    if (filters.postDateRange && filters.postDateRange.length === 2) {
      const [startDate, endDate] = filters.postDateRange;
      filtered = filtered.filter(domain => {
        if (!domain.postDateTime) return false;
        const postDate = dayjs(domain.postDateTime);
        return postDate.isAfter(startDate.startOf('day')) && 
               postDate.isBefore(endDate.endOf('day'));
      });
    }

    setFilteredDomains(filtered);
  };

  const handleAddNew = () => {
    setSelectedDomain(null);
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (domain) => {
    setSelectedDomain(domain);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleViewDetails = (domain) => {
    setSelectedDomain(domain);
    setShowDetailsModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (isEdit) {
        await domainAPI.updateDomain(selectedDomain.id, formData);
        showNotification('success', 'Success', 'Domain updated successfully');
      } else {
        // Use multiple domains endpoint for new domains
        const response = await domainAPI.createDomains(formData);
        const { created, errors } = response.data.data;
        
        if (created.length > 0) {
          showNotification('success', 'Success', `${created.length} domains created successfully`);
        }
        
        if (errors.length > 0) {
          showNotification('warning', 'Warning', `${errors.length} domains had errors`);
        }
      }
      setShowForm(false);
      fetchDomains();
    } catch (error) {
      if (error.response?.status === 409) {
        showNotification('error', 'Error', error.response.data.message);
      } else {
        showNotification('error', 'Error', 'Failed to save domain(s)');
      }
    }
  };

  const handleImport = async (file) => {
    try {
      setImportLoading(true);
      const response = await domainAPI.importDomainsFromCSV(file);
      
      if (response.data.summary.successful > 0) {
        fetchDomains(); // Refresh the domains list
      }
      
      showNotification(
        'success', 
        'Import Completed', 
        `Successfully imported ${response.data.summary.successful} domains`
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to import CSV';
      showNotification('error', 'Import Failed', errorMessage);
      throw error;
    } finally {
      setImportLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await domainAPI.deleteDomain(id);
      showNotification('success', 'Success', 'Domain deleted successfully');
      fetchDomains();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete domain');
    }
  };

  const handleMarkSold = async (id) => {
    try {
      await domainAPI.markAsSold(id);
      showNotification('success', 'Success', 'Domain marked as sold');
      fetchDomains();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to mark domain as sold');
    }
  };

  const handleMarkAvailable = async (id) => {
    try {
      await domainAPI.markAsAvailable(id);
      showNotification('success', 'Success', 'Domain marked as available');
      fetchDomains();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to mark domain as available');
    }
  };

  const handlePostToChannel = async (id) => {
    try {
      await domainAPI.postToChannel(id);
      showNotification('success', 'Success', 'Domain posted to channel');
      fetchDomains();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to post domain to channel');
    }
  };

  const handleRemoveFromChannel = async (id) => {
    try {
      await domainAPI.removeFromChannel(id);
      showNotification('success', 'Success', 'Domain removed from channel');
      fetchDomains();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to remove domain from channel');
    }
  };

  const handleExportCSV = () => {
    exportToCSV(filteredDomains, 'domains.csv');
    showNotification('success', 'Success', 'Data exported successfully');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      domainName: '',
      countries: [],
      categories: [],
      daRange: [0, 100],
      paRange: [0, 100],
      ssRange: [0, 100],
      status: null,
      ischannel: null,
      dateRange: null,
      postDateRange: null,
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Domain
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
                type="default"
                icon={<UploadOutlined />}
                onClick={() => setShowImportModal(true)}
              >
                Import CSV
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddNew}
              >
                Add Domain
              </Button>
            </Space>
          </Col>
        </Row>

        {showFilters && (
          <>
            <Divider />
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              domains={domains}
            />
          </>
        )}

        <Divider />

        <DomainTable
          domains={filteredDomains}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMarkSold={handleMarkSold}
          onMarkAvailable={handleMarkAvailable}
          onPostToChannel={handlePostToChannel}
          onRemoveFromChannel={handleRemoveFromChannel}
          onViewDetails={handleViewDetails}
        />

        <DomainForm
          visible={showForm}
          onCancel={() => setShowForm(false)}
          domain={selectedDomain}
          onSave={handleSave}
          isEdit={isEdit}
        />

        <DomainDetailsModal
          visible={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          domain={selectedDomain}
        />

        <ImportModal
          visible={showImportModal}
          onCancel={() => setShowImportModal(false)}
          onImport={handleImport}
          loading={importLoading}
        />
      </Card>
    </div>
  );
};

export default DomainManagement;
