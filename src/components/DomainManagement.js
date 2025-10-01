import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  FilterOutlined,
  UploadOutlined,
  BellOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import DomainTable from './DomainTable';
import DomainForm from './DomainForm';
import DomainDetailsModal from './DomainDetailsModal';
import FilterPanel from './FilterPanel';
import ImportModal from './ImportModal';
import NotificationModal from './NotificationModal';
import DomainSearchModal from './DomainSearchModal';
import { domainAPI, telegramAPI } from '../services/api';
import { exportToCSV, exportSearchResultsToCSV } from '../utils/csvExport';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

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
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [sortedDomains, setSortedDomains] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [sortedInfo, setSortedInfo] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
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
  }, [domains, filters, dateRange]);

  useEffect(() => {
    applySorting();
  }, [filteredDomains, sortedInfo]);

  const applyFilters = () => {
    let filtered = [...domains];

    // Default sorting by creation date (newest first)
    filtered.sort((a, b) => {
      const dateA = dayjs(a.createdAt || a.updatedAt);
      const dateB = dayjs(b.createdAt || b.updatedAt);
      return dateB.unix() - dateA.unix();
    });

    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(domain => {
        if (!domain.createdAt) return false;
        const domainDate = dayjs(domain.createdAt);
        return domainDate.isAfter(startDate.startOf('day')) && 
               domainDate.isBefore(endDate.endOf('day'));
      });
    }

    if (filters.domainName) {
      filtered = filtered.filter(domain =>
        domain.domainName.toLowerCase().includes(filters.domainName.toLowerCase())
      );
    }

    if (filters.countries.length > 0) {
      filtered = filtered.filter(domain =>
        filters.countries.includes(domain.country)
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(domain =>
        filters.categories.includes(domain.category)
      );
    }

    filtered = filtered.filter(domain =>
      domain.da >= filters.daRange[0] && domain.da <= filters.daRange[1]
    );

    filtered = filtered.filter(domain =>
      domain.pa >= filters.paRange[0] && domain.pa <= filters.paRange[1]
    );

    filtered = filtered.filter(domain =>
      domain.ss >= filters.ssRange[0] && domain.ss <= filters.ssRange[1]
    );

    if (filters.status !== null) {
      filtered = filtered.filter(domain => domain.status === filters.status);
    }

    if (filters.ischannel !== null) {
      filtered = filtered.filter(domain => domain.ischannel === filters.ischannel);
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(domain => {
        if (!domain.createdAt) return false;
        const domainDate = dayjs(domain.createdAt);
        return domainDate.isAfter(startDate.startOf('day')) && 
               domainDate.isBefore(endDate.endOf('day'));
      });
    }

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
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      current: 1, // Reset to first page when filters change
    }));
  };

  const applySorting = () => {
    if (!sortedInfo.columnKey) {
      setSortedDomains(filteredDomains);
      return;
    }

    const sorted = [...filteredDomains].sort((a, b) => {
      const { columnKey, order } = sortedInfo;
      let aValue = a[columnKey];
      let bValue = b[columnKey];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Handle different data types
      if (columnKey === 'createdAt' || columnKey === 'postDateTime') {
        aValue = aValue ? dayjs(aValue).unix() : 0;
        bValue = bValue ? dayjs(bValue).unix() : 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let result = 0;
      if (aValue < bValue) result = -1;
      if (aValue > bValue) result = 1;

      return order === 'descend' ? -result : result;
    });

    setSortedDomains(sorted);
    setPagination(prev => ({
      ...prev,
      current: 1, // Reset to first page when sorting changes
    }));
  };

  const handleSortChange = (sorter) => {
    setSortedInfo(sorter);
  };

  const handlePaginationChange = (paginationInfo, filters, sorter) => {
    setPagination({
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
      total: paginationInfo.total,
    });
  };

  const getPaginatedDomains = () => {
    const domainsToUse = sortedInfo.columnKey ? sortedDomains : filteredDomains;
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return domainsToUse.slice(startIndex, endIndex);
  };

  const getAllFilteredDomains = () => {
    return sortedInfo.columnKey ? sortedDomains : filteredDomains;
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
        fetchDomains();
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

  const handleSendNotification = async (message) => {
    try {
      setNotificationLoading(true);
      const response = await telegramAPI.sendNotification(message);
      showNotification('success', 'Success', 'Notification sent successfully');
      return response.data.data;
    } catch (error) {
      showNotification('error', 'Error', 'Failed to send notification');
      throw error;
    } finally {
      setNotificationLoading(false);
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

  // New bulk actions handler
  const handleBulkActions = async (action, domainNames) => {
    try {
      const response = await domainAPI.bulkActions(action, domainNames);
      const { successful, failed, results } = response.data.data;
      
      if (successful > 0) {
        let actionText = '';
        switch (action) {
          case 'markSold':
            actionText = 'marked as sold';
            break;
          case 'markAvailable':
            actionText = 'marked as available';
            break;
          case 'postToChannel':
            actionText = 'posted to channel';
            break;
          case 'removeFromChannel':
            actionText = 'removed from channel';
            break;
        }
        
        showNotification('success', 'Success', `${successful} domains ${actionText} successfully`);
      }
      
      if (failed > 0) {
        showNotification('warning', 'Warning', `${failed} domains failed to process`);
        console.log('Failed domains:', results.failed);
      }
      
      fetchDomains();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to perform bulk action');
      throw error;
    }
  };

  const handleExportCSV = () => {
    const domainsToExport = getAllFilteredDomains();
    exportToCSV(domainsToExport, 'domains.csv');
    showNotification('success', 'Success', 'Data exported successfully');
  };

  const handleExportSearchResults = (searchResults) => {
    exportSearchResultsToCSV(searchResults, 'domain_search_results.csv');
    showNotification('success', 'Success', 'Search results exported successfully');
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
    setDateRange(null);
    setSortedInfo({});
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <Title level={2} style={{ margin: 0 }}>
                Domain
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<SearchOutlined />}
                onClick={() => setShowSearchModal(true)}
                style={{ backgroundColor: '#722ed1', borderColor: '#722ed1', color: '#fff' }}
              >
                Search Domains
              </Button>
              <Button
                icon={<BellOutlined />}
                onClick={() => setShowNotificationModal(true)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
              >
                Notify Users
              </Button>
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
          domains={getPaginatedDomains()}
          allDomains={getAllFilteredDomains()}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMarkSold={handleMarkSold}
          onMarkAvailable={handleMarkAvailable}
          onPostToChannel={handlePostToChannel}
          onRemoveFromChannel={handleRemoveFromChannel}
          onViewDetails={handleViewDetails}
          onBulkActions={handleBulkActions}
          onSortChange={handleSortChange}
          sortedInfo={sortedInfo}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} domains`,
            pageSizeOptions: ['10', '25', '50', '100'],
          }}
          onPaginationChange={handlePaginationChange}
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

        <NotificationModal
          visible={showNotificationModal}
          onCancel={() => setShowNotificationModal(false)}
          onSend={handleSendNotification}
          loading={notificationLoading}
        />

        <DomainSearchModal
          visible={showSearchModal}
          onCancel={() => setShowSearchModal(false)}
          domains={domains}
          onExport={handleExportSearchResults}
        />
      </Card>
    </div>
  );
};

export default DomainManagement;
