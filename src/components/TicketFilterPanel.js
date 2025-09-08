import React from 'react';
import {
  Row,
  Col,
  Input,
  Select,
  Button,
  Card,
  Typography,
  DatePicker,
  Space,
} from 'antd';
import { ClearOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const TicketFilterPanel = ({ filters, onFilterChange, onClearFilters, tickets }) => {
  const statuses = ['New', 'Read', 'Sold', 'Cancelled'];
  const allDomains = [...new Set(
    tickets.flatMap(ticket => ticket.request_domains || [])
  )].filter(Boolean).sort();

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleDateRangeChange = (dates) => {
    handleFilterChange('dateRange', dates);
  };

  const handleDomainsChange = (value) => {
    handleFilterChange('domains', value);
  };

  return (
    <Card size="small">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Filters
          </Title>
        </Col>
        <Col>
          <Button
            icon={<ClearOutlined />}
            onClick={onClearFilters}
            size="small"
          >
            Clear All
          </Button>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Customer ID
            </label>
            <Input
              placeholder="Search customer ID"
              value={filters.customer_id}
              onChange={(e) => handleFilterChange('customer_id', e.target.value)}
              allowClear
            />
          </div>
        </Col>

        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Status
            </label>
            <Select
              placeholder="Select status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: '100%' }}
              allowClear
            >
              {statuses.map(status => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Domains
            </label>
            <Select
              mode="tags"
              placeholder="Search domains"
              value={filters.domains}
              onChange={handleDomainsChange}
              style={{ width: '100%' }}
              allowClear
            >
              {allDomains.map(domain => (
                <Option key={domain} value={domain}>
                  {domain}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Request Date Range
            </label>
            <RangePicker
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder={['Start Date', 'End Date']}
              allowClear
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TicketFilterPanel;
