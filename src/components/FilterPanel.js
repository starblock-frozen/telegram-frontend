import React from 'react';
import {
  Row,
  Col,
  Input,
  Select,
  Slider,
  Button,
  Card,
  Typography,
  Space,
  DatePicker,
} from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FilterPanel = ({ filters, onFilterChange, onClearFilters, domains }) => {
  const categories = ['GOV', 'EDU', 'eCommerce', 'Commerce'];
  const countries = [...new Set(domains.map(domain => domain.country))].filter(Boolean).sort();

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleDateRangeChange = (dates) => {
    handleFilterChange('dateRange', dates);
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
              Domain Name
            </label>
            <Input
              placeholder="Search domain name"
              value={filters.domainName}
              onChange={(e) => handleFilterChange('domainName', e.target.value)}
              allowClear
            />
          </div>
        </Col>

        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Countries
            </label>
            <Select
              mode="multiple"
              placeholder="Select countries"
              value={filters.countries}
              onChange={(value) => handleFilterChange('countries', value)}
              style={{ width: '100%' }}
              allowClear
            >
              {countries.map(country => (
                <Option key={country} value={country}>
                  {country}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Categories
            </label>
            <Select
              mode="multiple"
              placeholder="Select categories"
              value={filters.categories}
              onChange={(value) => handleFilterChange('categories', value)}
              style={{ width: '100%' }}
              allowClear
            >
              {categories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Date Range (Created)
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

      <Row gutter={16}>
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
              <Option value={true}>Available</Option>
              <Option value={false}>Sold</Option>
            </Select>
          </div>
        </Col>

        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Channel Status
            </label>
            <Select
              placeholder="Select channel status"
              value={filters.ischannel}
              onChange={(value) => handleFilterChange('ischannel', value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value={true}>Posted</Option>
              <Option value={false}>Not Posted</Option>
            </Select>
          </div>
        </Col>

        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Domain Authority (DA): {filters.daRange[0]} - {filters.daRange[1]}
            </label>
            <Slider
              range
              min={0}
              max={100}
              value={filters.daRange}
              onChange={(value) => handleFilterChange('daRange', value)}
            />
          </div>
        </Col>

        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Page Authority (PA): {filters.paRange[0]} - {filters.paRange[1]}
            </label>
            <Slider
              range
              min={0}
              max={100}
              value={filters.paRange}
              onChange={(value) => handleFilterChange('paRange', value)}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Spam Score (SS): {filters.ssRange[0]} - {filters.ssRange[1]}
            </label>
            <Slider
              range
              min={0}
              max={100}
              value={filters.ssRange}
              onChange={(value) => handleFilterChange('ssRange', value)}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default FilterPanel;
