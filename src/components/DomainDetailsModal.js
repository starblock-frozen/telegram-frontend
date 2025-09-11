import React, { useState } from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Typography,
  Row,
  Col,
  Card,
  Divider,
  Button,
  Space,
  Input,
  Tooltip,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  UserOutlined,
  LockOutlined,
  CopyOutlined,
  GlobalOutlined,
  CheckOutlined,
  CloudServerOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DomainDetailsModal = ({ visible, onCancel, domain }) => {
  const [copiedStates, setCopiedStates] = useState({});

  if (!domain) return null;

  const copyToClipboard = async (text, fieldKey) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Set copied state for this specific field
      setCopiedStates(prev => ({ ...prev, [fieldKey]: true }));
      
      // Show success message
      message.success('Copied to clipboard!');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [fieldKey]: false }));
      }, 2000);
    } catch (err) {
      message.error('Failed to copy to clipboard');
    }
  };

  const renderCredentialItem = (label, value, fieldKey, isPassword = false) => {
    if (!value) return null;
    
    const isCopied = copiedStates[fieldKey];
    
    return (
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          {label}:
        </Text>
        <Input
          value={isPassword ? '••••••••' : value}
          readOnly
          size="small"
          style={{ width: '100%' }}
          addonAfter={
            <Tooltip title={isCopied ? 'Copied!' : 'Copy'}>
              <Button
                type="text"
                size="small"
                icon={isCopied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                onClick={() => copyToClipboard(value, fieldKey)}
                style={{ 
                  color: isCopied ? '#52c41a' : undefined,
                  transition: 'all 0.3s ease'
                }}
              />
            </Tooltip>
          }
        />
      </div>
    );
  };

  const renderLinkItem = (label, value, fieldKey, icon) => {
    if (!value) return null;
    
    const isCopied = copiedStates[fieldKey];
    
    return (
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          {label}:
        </Text>
        <Input
          value={value}
          readOnly
          size="small"
          style={{ width: '100%' }}
          prefix={icon}
          addonAfter={
            <Space size={0}>
              <Tooltip title={isCopied ? 'Copied!' : 'Copy'}>
                <Button
                  type="text"
                  size="small"
                  icon={isCopied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                  onClick={() => copyToClipboard(value, fieldKey)}
                  style={{ 
                    color: isCopied ? '#52c41a' : undefined,
                    transition: 'all 0.3s ease'
                  }}
                />
              </Tooltip>
              <Tooltip title="Open Link">
                <Button
                  type="text"
                  size="small"
                  icon={<LinkOutlined />}
                  onClick={() => window.open(value, '_blank')}
                />
              </Tooltip>
            </Space>
          }
        />
      </div>
    );
  };

  return (
    <Modal
      title={
        <Title level={3} style={{ margin: 0 }}>
          Domain Details: {domain.domainName}
        </Title>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" type="primary" onClick={onCancel}>
          Close
        </Button>
      ]}
    >
      {/* Basic Information */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Basic Information" size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={3} size="small">
              <Descriptions.Item label="Domain Name">
                <Text strong style={{ color: '#1890ff' }}>
                  {domain.domainName}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Country">
                {domain.country}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color={
                  domain.category === 'GOV' ? 'blue' :
                  domain.category === 'EDU' ? 'green' :
                  domain.category === 'eCommerce' ? 'orange' :
                  domain.category === 'NEWS' ? 'red' : 'purple'
                }>
                  {domain.category}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Price">
                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                  ${domain.price?.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag 
                  icon={domain.status ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  color={domain.status ? 'success' : 'error'}
                >
                  {domain.status ? 'Available' : 'Sold'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Channel Status">
                <Tag 
                  icon={domain.ischannel ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  color={domain.ischannel ? 'processing' : 'default'}
                >
                  {domain.ischannel ? 'Posted' : 'Not Posted'}
                </Tag>
              </Descriptions.Item>
              {domain.postDateTime && (
                <Descriptions.Item label="Post Date">
                  <Space>
                    <CalendarOutlined />
                    <Text>
                      {dayjs(domain.postDateTime).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* SEO Metrics */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="SEO Metrics" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                    {domain.da || 0}
                  </Title>
                  <Text type="secondary">Domain Authority</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                    {domain.pa || 0}
                  </Title>
                  <Text type="secondary">Page Authority</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <Title level={3} style={{ margin: 0, color: '#faad14' }}>
                    {domain.ss || 0}
                  </Title>
                  <Text type="secondary">Spam Score</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
                    {domain.backlink?.toLocaleString() || 0}
                  </Title>
                  <Text type="secondary">Backlinks</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Panel Information */}
      {(domain.panelLink || domain.panelUsername || domain.panelPassword) && (
        <Row gutter={16}>
          <Col span={12}>
            <Card 
              title={
                <Space>
                  <UserOutlined />
                  Panel Information
                </Space>
              } 
              size="small" 
              style={{ marginBottom: 16 }}
            >
              {renderLinkItem('Panel Link', domain.panelLink, 'panelLink', <UserOutlined />)}
              {renderCredentialItem('Panel Username', domain.panelUsername, 'panelUsername')}
              {renderCredentialItem('Panel Password', domain.panelPassword, 'panelPassword', true)}
            </Card>
          </Col>

          {/* Hosting Information */}
          <Col span={12}>
            <Card 
              title={
                <Space>
                  <CloudServerOutlined />
                  Hosting Site
                </Space>
              } 
              size="small" 
              style={{ marginBottom: 16 }}
            >
              {renderLinkItem('Hosting Link', domain.hostingLink, 'hostingLink', <CloudServerOutlined />)}
              {renderCredentialItem('Hosting Username', domain.hostingUsername, 'hostingUsername')}
              {renderCredentialItem('Hosting Password', domain.hostingPassword, 'hostingPassword', true)}
            </Card>
          </Col>
        </Row>
      )}

      {/* Shell Link */}
      {domain.goodLink && (
        <Row gutter={16}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <GlobalOutlined />
                  Shell Link
                </Space>
              } 
              size="small"
              style={{ marginBottom: 16 }}
            >
              {renderLinkItem('Shell Link', domain.goodLink, 'goodLink', <GlobalOutlined />)}
            </Card>
          </Col>
        </Row>
      )}
    </Modal>
  );
};

export default DomainDetailsModal;
